import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0c10",
            color: "#ff3b3b",
            padding: "2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1 style={{ color: "#ff3b3b", marginBottom: "1rem" }}>
            🚨 SYSTEM ERROR
          </h1>
          <p style={{ color: "#8aa1b1", marginBottom: "2rem" }}>
            Intelligence network temporarily offline
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#00e0b8",
              color: "#000",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🔄 Restart System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
