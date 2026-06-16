import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#e74c3c' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            We're sorry, but an unexpected error occurred while rendering this page.
          </p>
          <Link to="/" onClick={() => this.setState({ hasError: false })} style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
          }}>
            Return to Home
          </Link>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
