import React from "react";
import { Input, InputProps, Space } from "antd";

// antd 6 replaces Input addons with Space.Compact. Form.Item binds to its direct child,
// so this wrapper forwards value, onChange and the rest to the inner Input.
export const AddonInput = ({
  addon,
  ...inputProps
}: InputProps & { addon: React.ReactNode }) => (
  <Space.Compact block>
    <Space.Addon>{addon}</Space.Addon>
    <Input {...inputProps} />
  </Space.Compact>
);
