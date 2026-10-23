import { screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { getMockSession } from "../../testUtils/getMockSession";
import { renderMockProvider } from "../../testUtils/MockProvider";
import AddressTagsPage from "../AddressTagsPage";
import { Receive, Send, Wallet } from "../btc-wallet";
import XpubPage from "../btc-wallet/XpubPage";
import Error from "../error";
import ExplorerPage from "../ExplorerPage";
import Landing from "../landing";
import Pair from "../pair";
import Permissions from "../permissions";
import Settings from "../settings";

// The browser smoke test cannot reach these screens without a paired Lattice1,
// so render each one against the mock session and fail on any React or antd error.

const btcSession = () =>
  getMockSession({
    overrides: {
      addresses: { BTC: [], BTC_CHANGE: [] },
      btcUtxos: [],
      btcPrice: 0,
      lastFetchedBtcData: 0,
      getBtcWalletData: vi.fn(),
      getBtcDisplayAddress: vi.fn(() => null),
      getBtcBalance: vi.fn(() => 0),
      getBtcTxs: vi.fn(() => []),
      getBtcUtxos: vi.fn(() => []),
      getPage: vi.fn(() => 1),
    } as any,
    clientOverrides: {} as any,
  });

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleError.mock.calls).toEqual([]);
  consoleError.mockRestore();
});

describe("screens render", () => {
  test("Landing", async () => {
    renderMockProvider({ children: <Landing goToPage={vi.fn()} /> });
    expect(await screen.findByText("Features")).toBeInTheDocument();
  });

  test("Settings", async () => {
    renderMockProvider({ children: <Settings /> });
    expect(await screen.findByText(/Connection Endpoint/)).toBeInTheDocument();
  });

  test("Permissions", async () => {
    renderMockProvider({ children: <Permissions /> });
    expect(await screen.findByText(/Spending Limits/)).toBeInTheDocument();
  });

  test("AddressTagsPage", async () => {
    renderMockProvider({ children: <AddressTagsPage /> });
    expect(await screen.findAllByText("Address Tags")).not.toHaveLength(0);
  });

  test("ExplorerPage", async () => {
    renderMockProvider({ children: <ExplorerPage /> });
    expect(await screen.findAllByText("Wallet Explorer")).not.toHaveLength(0);
  });

  test("BTC Wallet", async () => {
    const session = btcSession();
    renderMockProvider({
      children: (
        <Wallet session={session} refreshData={vi.fn()} lastUpdated={null} pageTurnCb={vi.fn()} />
      ),
    });
    expect(await screen.findAllByText("BTC Wallet")).not.toHaveLength(0);
  });

  test("BTC Receive", async () => {
    renderMockProvider({ children: <Receive session={btcSession()} /> });
    expect(await screen.findByText("Receive BTC")).toBeInTheDocument();
  });

  test("BTC Send", async () => {
    renderMockProvider({ children: <Send session={btcSession()} /> });
    expect(await screen.findByText("Send BTC")).toBeInTheDocument();
  });

  test("BTC XPUB", async () => {
    renderMockProvider({ children: <XpubPage session={btcSession()} /> });
    expect(await screen.findByText(/Extended Public Key/)).toBeInTheDocument();
  });

  test("Pair", async () => {
    renderMockProvider({ children: <Pair submit={vi.fn()} hide={false} /> });
    expect(await screen.findByText("Enter Secret")).toBeInTheDocument();
  });

  test("Error", async () => {
    renderMockProvider({ children: <Error msg="boom" retryCb={vi.fn()} /> });
    expect(await screen.findByText("boom")).toBeInTheDocument();
  });
});
