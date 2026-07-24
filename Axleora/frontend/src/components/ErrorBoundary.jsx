import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Application page error", error, info); }
  render() {
    if (this.state.error) return <main className="app-error">
      <div><i className="fa-solid fa-triangle-exclamation"/><span className="kicker">PAGE RECOVERY</span><h1>This page could not be displayed.</h1><p>The rest of the system is still available. Reload the page to restore the current workspace.</p><button className="btn" onClick={() => window.location.reload()}>Reload page</button></div>
    </main>;
    return this.props.children;
  }
}
