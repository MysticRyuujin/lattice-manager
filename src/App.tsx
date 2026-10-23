import React, { useEffect } from "react";
import { App as AntApp, ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";
import "./styles.css";
import { Main } from "./components";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppContextProvider } from "./store/AppContext";
import { setNotificationInstance } from "./util/notification";

const darkTheme = { algorithm: theme.darkAlgorithm };

function NotificationBridge() {
  const { notification } = AntApp.useApp();
  useEffect(() => setNotificationInstance(notification), [notification]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={darkTheme}>
        <AntApp>
          <NotificationBridge />
          <div className="App">
            <AppContextProvider>
              <Main />
            </AppContextProvider>
          </div>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
