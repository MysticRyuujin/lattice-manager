import { screen } from "@testing-library/react";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { createHash } from "crypto";
import { ec as EC } from "elliptic";
import React from "react";
import { renderMockProvider } from "../../testUtils/MockProvider";
import { constants } from "../../util/helpers";
import ValidateSig from "../validateSig";

// Builds a payload in the device's layout, signed by a test root key that stands in
// for the GridPlus cert signer: preimage(32) | sig template(74) | cert template(147).
const ec = new EC("secp256k1");
const root = ec.genKeyPair();
const device = ec.genKeyPair();
const sha256 = (data: Buffer) => createHash("sha256").update(data).digest();

function template(der: number[], len: number) {
  const out = Buffer.alloc(len);
  Buffer.from(der).copy(out);
  return out;
}

function buildPayload(message: string) {
  const preimage = Buffer.alloc(32);
  preimage.write(message);
  const deviceSig = device.sign(sha256(preimage)).toDER();

  const metadata = Buffer.alloc(8);
  const pubkey = Buffer.from(device.getPublic(false, "hex"), "hex");
  const certPreimage = Buffer.concat([metadata.subarray(2), pubkey]);
  const certSig = root.sign(sha256(certPreimage)).toDER();
  const cert = Buffer.concat([metadata, pubkey, template(certSig, 74)]);

  return Buffer.concat([preimage, template(deviceSig, 74), cert]);
}

describe("ValidateSig", () => {
  const original = constants.LATTICE_CERT_SIGNER;
  beforeEach(() => {
    constants.LATTICE_CERT_SIGNER = root.getPublic(false, "hex");
  });
  afterEach(() => {
    constants.LATTICE_CERT_SIGNER = original;
  });

  test("verifies a payload signed by the cert signer", async () => {
    const data = bs58.encode(buildPayload("hello lattice"));
    renderMockProvider({ children: <ValidateSig data={data} /> });
    expect(await screen.findByText("Verified")).toBeInTheDocument();
  });

  test("rejects a payload with a changed message", async () => {
    const payload = buildPayload("hello lattice");
    payload[0] ^= 0xff;
    renderMockProvider({ children: <ValidateSig data={bs58.encode(payload)} /> });
    expect(await screen.findByText("Could not Verify Authenticity")).toBeInTheDocument();
  });
});
