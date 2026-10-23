import React from "react";

type Props = { children: React.ReactNode };
type State = { error: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error === null) return this.props.children;
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        <button onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
  }
}
