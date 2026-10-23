import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import { renderMockProvider } from "../../testUtils/MockProvider";
import localStorage from "../../util/localStorage";
import Settings, { getEndpointError } from "../settings";

describe("Connection Endpoint", () => {
  const reload = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    window.localStorage.clear();
    reload.mockClear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  test.each([
    ["https://lattice-connect.example", ""],
    ["http://10.0.0.5:8080", ""],
    ["https://lattice-connect.example/", 'URL cannot end with "/"'],
    ["ftp://lattice-connect.example", "Invalid protocol"],
  ])("getEndpointError(%s)", (value, error) => {
    expect(getEndpointError(value)).toBe(error);
  });

  test("does not save an invalid endpoint", async () => {
    const user = userEvent.setup();
    renderMockProvider({ children: <Settings /> });
    const input = await screen.findByPlaceholderText("host:port");
    await user.type(input, "not a url");
    // Focusing the field again clears the shown error; the save must still refuse.
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Update and Reload" }));

    expect(localStorage.getSettings().customEndpoint).toBeUndefined();
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByText(/Invalid URL/)).toBeInTheDocument();
  });

  test("saves a valid endpoint", async () => {
    const user = userEvent.setup();
    renderMockProvider({ children: <Settings /> });
    await user.type(await screen.findByPlaceholderText("host:port"), "https://relay.example");
    await user.click(screen.getByRole("button", { name: "Update and Reload" }));

    expect(localStorage.getSettings().customEndpoint).toBe("https://relay.example");
    expect(reload).toHaveBeenCalled();
  });
});
