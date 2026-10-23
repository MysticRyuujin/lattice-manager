import { vi } from "vitest";
import SDKSession from "../sdkSession";

// Calls sign() on a minimal session so the test needs no device or connection.
const signWith = (deviceResult) =>
  SDKSession.prototype.sign.call({ client: { sign: vi.fn(async () => deviceResult) } }, {});

describe("SDKSession.sign", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("resolves with the broadcast txid", async () => {
    fetchMock.mockResolvedValue(new Response("abc123txid", { status: 200 }));
    await expect(signWith({ tx: "rawtx" })).resolves.toBe("abc123txid");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: "rawtx" });
  });

  test("rejects when the broadcast endpoint returns an error", async () => {
    fetchMock.mockResolvedValue(new Response("bad-txns-inputs-missingorspent", { status: 400 }));
    await expect(signWith({ tx: "rawtx" })).rejects.toThrow(
      "Error broadcasting transaction: bad-txns-inputs-missingorspent"
    );
  });

  test("rejects when the device returns no transaction", async () => {
    await expect(signWith({})).rejects.toThrow("Signing transaction invalid.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
