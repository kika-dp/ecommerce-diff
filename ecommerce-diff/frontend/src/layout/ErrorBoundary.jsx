import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <div className="empty-state" style={{ maxWidth: 520 }}>
            <h2 className="aura-headline" style={{ marginBottom: 12 }}>Something fractured in the void.</h2>
            <p className="aura-body">{this.state.error?.message || 'Unknown error.'}</p>
            <button className="btn btn--primary" style={{ marginTop: 24 }} onClick={() => window.location.reload()}>
              Reload the experience
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
