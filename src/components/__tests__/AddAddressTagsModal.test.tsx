import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { getMockSession } from "../../testUtils/getMockSession";
import { renderMockProvider } from "../../testUtils/MockProvider";
import { AddAddressTagsModal } from "../AddAddressTagsModal";

// The inputs sit inside Form.Item through AddonInput; this proves the values still bind.
test("submits the typed address tag to the device", async () => {
  const user = userEvent.setup();
  const session = getMockSession();
  const address = "0x00000000000000000000000000000000000000a1";

  renderMockProvider({
    children: (
      <AddAddressTagsModal
        isModalVisible
        setIsModalVisible={vi.fn()}
        initialAddressTags={[{ key: "", val: "" }]}
      />
    ),
    session,
  } as any);

  await user.type(await screen.findByTestId("0-address-input"), address);
  await user.type(screen.getByTestId("0-name-input"), "cold wallet");
  await user.click(screen.getByRole("button", { name: "Add" }));

  await waitFor(() => expect(session.client.addKvRecords).toHaveBeenCalled());
  expect((session.client.addKvRecords as any).mock.calls[0][0].records).toEqual({
    [address]: "cold wallet",
  });
});
