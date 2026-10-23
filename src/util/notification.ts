import { App, notification as staticNotification } from "antd";

type NotificationInstance = ReturnType<typeof App.useApp>["notification"];

// Static antd calls cannot read the ConfigProvider theme, so App swaps in the themed instance.
let current: NotificationInstance = staticNotification;

export const setNotificationInstance = (instance: NotificationInstance) => {
  current = instance;
};

export const notification = {
  open: (args: Parameters<NotificationInstance["open"]>[0]) => current.open(args),
  destroy: (key?: React.Key) => current.destroy(key),
};
