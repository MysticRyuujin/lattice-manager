import React from "react";
import "antd/dist/antd.dark.min.css";
import "./styles.css";
import { Main } from "./components";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppContextProvider } from "./store/AppContext";

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <AppContextProvider>
          <Main />
        </AppContextProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
