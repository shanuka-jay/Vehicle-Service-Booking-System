import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: "", username: "", email: "", phone: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (user) setProfile({ fullName: user.fullName || "", username: user.username || "", email: user.email || "", phone: user.phone || "" });
  }, [user]);

  const saveProfile = async event => {
    event.preventDefault(); setBusy("profile"); setError(""); setProfileMessage("");
    try {
      const { data } = await api.put("/auth/profile", profile);
      updateUser(data); setProfileMessage("Profile details updated.");
    } catch (err) { setError(err.response?.data?.message || "Profile could not be updated"); }
    finally { setBusy(""); }
  };
  const changePassword = async event => {
    event.preventDefault(); setBusy("password"); setError(""); setPasswordMessage("");
    if (password.newPassword !== password.confirm) { setBusy(""); return setError("New passwords do not match"); }
    try {
      const { data } = await api.put("/auth/password", { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPasswordMessage(data.message); setPassword({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) { setError(err.response?.data?.message || "Password change failed"); }
    finally { setBusy(""); }
  };

  return <div className="admin-content">
    <div className="admin-title"><div><span className="kicker">PERSONAL SETTINGS</span><h1>My account</h1><p>Keep your staff identity and sign-in credentials current.</p></div></div>
    {error && <div className="alert error">{error}</div>}
    <div className="account-layout">
      <aside className="admin-panel account-card">
        <div className="profile-avatar large">{user?.fullName?.[0]?.toUpperCase() || "A"}</div>
        <h2>{user?.fullName}</h2><p>@{user?.username}</p>
        <span className={`role-chip ${user?.role?.toLowerCase()}`}>{user?.role === "OWNER" ? "Workshop owner" : "Workshop staff"}</span>
        <div className="account-facts">
          <div><span>Member since</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</strong></div>
          <div><span>Last sign-in</span><strong>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Current session"}</strong></div>
        </div>
      </aside>
      <div className="account-forms">
        <form className="admin-panel settings-form" onSubmit={saveProfile}>
          <div className="panel-copy"><span className="kicker">PROFILE</span><h2>Your details</h2><p>This name is shown inside the administration workspace.</p></div>
          <div className="form-grid compact-grid">
            <label>Full name<input required value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })}/></label>
            <label>Username<input required minLength="3" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })}/></label>
            <label>Email<input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}/></label>
            <label>Phone<input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/></label>
          </div>
          {profileMessage && <div className="alert success">{profileMessage}</div>}
          <button className="btn" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : "Save profile"}</button>
        </form>
        <form className="admin-panel settings-form" onSubmit={changePassword}>
          <div className="panel-copy"><span className="kicker">SIGN-IN SECURITY</span><h2>Change password</h2><p>Use at least eight characters and avoid passwords used elsewhere.</p></div>
          <label className="password-field">Current password<div className="input-icon"><i className="fa-solid fa-lock"/><input required type={showPasswords.current ? "text" : "password"} value={password.currentPassword} onChange={e => setPassword({ ...password, currentPassword: e.target.value })}/><button type="button" className="password-toggle" onClick={() => setShowPasswords(current => ({ ...current, current: !current.current }))} aria-label={showPasswords.current ? "Hide password" : "Show password"}><i className={`fa-solid ${showPasswords.current ? "fa-eye-slash" : "fa-eye"}`}/></button></div></label>
          <div className="form-grid compact-grid">
            <label className="password-field">New password<div className="input-icon"><i className="fa-solid fa-lock"/><input required minLength="8" type={showPasswords.next ? "text" : "password"} value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })}/><button type="button" className="password-toggle" onClick={() => setShowPasswords(current => ({ ...current, next: !current.next }))} aria-label={showPasswords.next ? "Hide password" : "Show password"}><i className={`fa-solid ${showPasswords.next ? "fa-eye-slash" : "fa-eye"}`}/></button></div></label>
            <label className="password-field">Confirm new password<div className="input-icon"><i className="fa-solid fa-lock"/><input required type={showPasswords.confirm ? "text" : "password"} value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })}/><button type="button" className="password-toggle" onClick={() => setShowPasswords(current => ({ ...current, confirm: !current.confirm }))} aria-label={showPasswords.confirm ? "Hide password" : "Show password"}><i className={`fa-solid ${showPasswords.confirm ? "fa-eye-slash" : "fa-eye"}`}/></button></div></label>
          </div>
          {passwordMessage && <div className="alert success">{passwordMessage}</div>}
          <button className="btn" disabled={busy === "password"}>{busy === "password" ? "Updating…" : "Update password"}</button>
        </form>
      </div>
    </div>
  </div>;
}
