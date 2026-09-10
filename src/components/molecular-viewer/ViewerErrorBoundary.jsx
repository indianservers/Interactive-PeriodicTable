import { Component } from 'react';

export default class ViewerErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { this.props.onError?.(error, info); }
  render() {
    if (this.state.error) return <div className="molstar-viewer-boundary" role="alert">The molecular viewer stopped unexpectedly. The surrounding scientific data remains available.</div>;
    return this.props.children;
  }
}
