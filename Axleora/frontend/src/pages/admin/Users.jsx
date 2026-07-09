import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const blank = { fullName: "", username: "", email: "", phone: "", password: "", role: "STAFF" };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api.get("/users").then(({ data }) => setUsers(data)).catch(err => setError(err.response?.data?.message || "Team accounts could not be loaded"));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing("new"); setForm(blank); setError(""); setMessage(""); };
  const openEdit = account => {
    setEditing(account.id);
    setForm({ fullName: account.fullName, username: account.username, email: account.email || "", phone: account.phone || "", role: account.role, isActive: account.isActive });
    setError(""); setMessage("");
  };
  const save = async event => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (editing === "new") await api.post("/users", form);
      else await api.put(`/users/${editing}`, form);
      setEditing(null); setForm(blank); setMessage(editing === "new" ? "Staff account created." : "Staff account updated."); await load();
    } catch (err) {
      setError(err.response?.data?.message || "Account could not be saved");
    } finally { setBusy(false); }
  };
  const resetPassword = async event => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await api.put(`/users/${resetting.id}/password`, { password: temporaryPassword });
      setResetting(null); setTemporaryPassword(""); setMessage(`Password reset for ${resetting.fullName}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Password could not be reset");
    } finally { setBusy(false); }
  };

  return <div className="admin-content">
    <div className="admin-title">
      <div><span className="kicker">ACCESS CONTROL</span><h1>Workshop team</h1><p>Create staff access, assign ownership and disable accounts when responsibilities change.</p></div>
      <button className="btn" onClick={openCreate}><i className="fa-solid fa-user-plus"/> Add team member</button>
    </div>
    {error && <div className="alert error">{error}</div>}
    {message && <div className="alert success">{message}</div>}
    <section className="team-summary">
      <div><i className="fa-solid fa-users"/><span><strong>{users.filter(x => x.isActive).length}</strong> active accounts</span></div>
      <p>Owners manage accounts. Staff handle day-to-day workshop records and customer requests.</p>
    </section>
    <section className="admin-panel">
      <div className="panel-head"><div><h2>Authorized users</h2><p>Every person should use their own account—never share the owner password.</p></div></div>
      <div className="team-list">
        {users.map(account => <article className={`team-row ${!account.isActive ? "disabled" : ""}`} key={account.id}>
          <div className="team-person">
            <div className="profile-avatar small">{account.fullName?.[0]?.toUpperCase()}</div>
            <div><strong>{account.fullName}</strong><span>@{account.username} · {account.email || "No email"}</span></div>
          </div>
          <div><span className={`role-chip ${account.role.toLowerCase()}`}>{account.role === "OWNER" ? "Owner" : "Staff"}</span></div>
          <div className="team-login"><small>LAST SIGN-IN</small><strong>{account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "Not signed in yet"}</strong></div>
          <span className={`account-state ${account.isActive ? "active" : ""}`}>{account.isActive ? "Active" : "Disabled"}</span>
          <div className="team-actions">
            <button onClick={() => openEdit(account)} aria-label={`Edit ${account.fullName}`}><i className="fa-solid fa-pen"/></button>
            <button onClick={() => { setResetting(account); setTemporaryPassword(""); setError(""); }} aria-label={`Reset password for ${account.fullName}`}><i className="fa-solid fa-key"/></button>
          </div>
        </article>)}
      </div>
    </section>

    {editing && <div className="modal-backdrop"><form className="modal staff-modal" onSubmit={save}>
      <button type="button" className="modal-close" onClick={() => setEditing(null)} aria-label="Close"><i className="fa-solid fa-xmark"/></button>
      <span className="kicker">{editing === "new" ? "NEW ACCESS" : "EDIT ACCESS"}</span>
      <h3>{editing === "new" ? "Add a team member" : "Update team member"}</h3>
      <p>Use a unique username. Owners can manage other users; staff cannot.</p>
      <div className="form-grid compact-grid">
        <label>Full name<input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}/></label>
        <label>Username<input required minLength="3" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}/></label>
        <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
        <label>Phone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label>
        <label>Role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="STAFF">Staff</option><option value="OWNER">Owner</option></select></label>
        {editing === "new"
          ? <label className="password-field">Temporary password<div className="input-icon"><i className="fa-solid fa-lock"/><input required minLength="8" type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}/></button></div></label>
          : <label className="status-switch"><span>Account access</span><button type="button" className={`switch ${form.isActive ? "on" : ""}`} onClick={() => setForm({ ...form, isActive: !form.isActive })}><span/></button><small>{form.isActive ? "Active" : "Disabled"}</small></label>}
      </div>
      {editing === currentUser.id && <div className="alert">Your own owner role and active status are protected.</div>}
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save account"}</button></div>
    </form></div>}

    {resetting && <div className="modal-backdrop"><form className="modal" onSubmit={resetPassword}>
      <button type="button" className="modal-close" onClick={() => setResetting(null)} aria-label="Close"><i className="fa-solid fa-xmark"/></button>
      <span className="kicker">SECURITY</span><h3>Reset {resetting.fullName}&apos;s password</h3>
      <p>Set a temporary password and share it privately. The account holder can replace it from My account.</p>
      <label className="password-field">Temporary password<div className="input-icon"><i className="fa-solid fa-lock"/><input required minLength="8" type={showPassword ? "text" : "password"} value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)}/><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}/></button></div></label>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setResetting(null)}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Resetting…" : "Reset password"}</button></div>
    </form></div>}
  </div>;
}
