import { LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  InputNumber,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { useAddressTags } from "../hooks/useAddressTags";
import { AppContext } from "../store/AppContext";
import { abbreviateHash } from "../util/addresses";
import {
  DERIVATION_TYPE,
  getDisplayStringForDerivationType,
  getFlagForDerivationType,
} from "../util/derivation";
import { constants } from "../util/helpers";
import { sendErrorNotification } from "../util/sendErrorNotification";
import { AddressTagInput } from "./AddressTagInput";
import { PageContent } from "./formatting";
import { UpdateAddressTagsModal } from "./UpdateAddressTagsModal";

const { ADDRESSES_PER_PAGE } = constants;
const { Option } = Select;

const PathSegment = ({
  disabled,
  defaultHardened = false,
  hardened,
  onHarden,
  value,
  onChange,
}) => (
  <Space.Compact style={{ width: "125px" }}>
    <Space.Addon>
      <Tooltip title="Harden">
        <Checkbox
          disabled={disabled}
          defaultChecked={defaultHardened}
          onChange={onHarden}
        />
      </Tooltip>
    </Space.Addon>
    <InputNumber disabled={disabled} controls value={value} onChange={onChange} />
    <Space.Addon>{hardened ? "'" : ""}</Space.Addon>
  </Space.Compact>
);

const ExplorerPage = () => {
  const { addressTags } = useAddressTags();
  const { session } = useContext(AppContext);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddAddressesModalVisible, setIsAddAddressesModalVisible] =
    useState(false);
  // m / purpose' / coin_type' / account' / change / index
  const [purpose, setPurpose] = useState(44);
  const [isPurposeHardened, setIsPurposeHardened] = useState(true);
  const [coinType, setCoinType] = useState(60);
  const [isCoinTypeHardened, setIsCoinTypeHardened] = useState(true);
  const [account, setAccount] = useState(0);
  const [isAccountHardened, setIsAccountHardened] = useState(true);
  const [change, setChange] = useState(0);
  const [isChangeHardened, setIsChangeHardened] = useState(false);
  const [index, setIndex] = useState(0);
  const [isIndexHardened, setIsIndexHardened] = useState(false);
  const [selectedDerivationType, setSelectedDerivationType] = useState(
    DERIVATION_TYPE.ETHEREUM
  );

  const getInitialAddressTags = () => {
    return addresses.map((addr) => {
      if (addr.record && addr.record.id) {
        return { key: addr.record.key, val: addr.record.val };
      }
      return { key: addr.address, val: "" };
    });
  };

  const getPath = () => {
    const HARDENED_OFFSET = 0x80000000;
    const purposePath = isPurposeHardened ? HARDENED_OFFSET + purpose : purpose;
    const coinTypePath = isCoinTypeHardened
      ? HARDENED_OFFSET + coinType
      : coinType;
    const accountPath = isAccountHardened ? HARDENED_OFFSET + account : account;
    const changePath = isChangeHardened ? HARDENED_OFFSET + change : change;
    const indexPath = isIndexHardened ? HARDENED_OFFSET + index : index;
    const path = [
      purposePath,
      coinTypePath,
      accountPath,
      changePath,
      indexPath,
    ].filter((x) => x !== null);
    return path;
  };

  const getAddrs = () => {
    setIsLoading(true);
    session.client
      .getAddresses({
        startPath: getPath(),
        n: ADDRESSES_PER_PAGE,
        flag: getFlagForDerivationType(selectedDerivationType),
      })
      .then((addrs) => {
        setAddresses(
          addrs.map((addr) => ({
            address: getDisplayStringForDerivationType(
              addr,
              selectedDerivationType
            ),
            record: addressTags.find((t) => t.key === addr),
          }))
        );
      })
      .catch(sendErrorNotification)
      .finally(() => setIsLoading(false));
  };

  const addrsColumns = [
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => <p>{abbreviateHash(text)}</p>,
    },
    {
      title: "Tag",
      dataIndex: "record",
      key: "tag",
      render: (record, { address }) => (
        <AddressTagInput
          record={record}
          address={address}
          fetchAddressTags={getAddrs}
        />
      ),
    },
  ];

  const onCheck = (e, checkedSetter) => {
    checkedSetter(e.target.checked);
  };

  useEffect(() => {
    getAddrs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDerivationType]);

  const onSelect = (option) => {
    if (option === DERIVATION_TYPE.ETHEREUM) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(60);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_LEGACY) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_SEGWIT) {
      setPurpose(84);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.BITCOIN_WRAPPED_SEGWIT) {
      setPurpose(49);
      setIsPurposeHardened(true);
      setCoinType(0);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(0);
      setIsChangeHardened(false);
      setIndex(0);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
    if (option === DERIVATION_TYPE.SOLANA) {
      setPurpose(44);
      setIsPurposeHardened(true);
      setCoinType(501);
      setIsCoinTypeHardened(true);
      setAccount(0);
      setIsAccountHardened(true);
      setChange(null);
      setIsChangeHardened(false);
      setIndex(null);
      setIsIndexHardened(false);
      setSelectedDerivationType(option);
    }
  };

  return (
    <PageContent>
      <Card title={"Wallet Explorer"}>
        <div>
          <h3>Standard Derivation Paths</h3>
          <div style={{ paddingBottom: "25px" }}>
            <Select
              defaultValue={DERIVATION_TYPE.ETHEREUM}
              onChange={onSelect}
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              <Option value={DERIVATION_TYPE.ETHEREUM}>Ethereum</Option>
              <Option value={DERIVATION_TYPE.BITCOIN_LEGACY}>
                Bitcoin (Legacy)
              </Option>
              <Option value={DERIVATION_TYPE.BITCOIN_SEGWIT}>
                Bitcoin (Segwit)
              </Option>
              <Option value={DERIVATION_TYPE.BITCOIN_WRAPPED_SEGWIT}>
                Bitcoin (Wrapped Segwit)
              </Option>
              <Option value={DERIVATION_TYPE.SOLANA}>Solana</Option>
            </Select>
          </div>
          <h3>Derivation Path</h3>
          <div
            style={{
              paddingBottom: "25px",
              display: "flex",
              gap: "10px",
              justifyContent: "stretch",
              flexWrap: "wrap",
            }}
          >
            <PathSegment
              disabled={isLoading}
              defaultHardened
              hardened={isPurposeHardened}
              onHarden={(e) => onCheck(e, setIsPurposeHardened)}
              value={purpose}
              onChange={(e) => setPurpose(e)}
            />
            <PathSegment
              disabled={isLoading}
              defaultHardened
              hardened={isCoinTypeHardened}
              onHarden={(e) => onCheck(e, setIsCoinTypeHardened)}
              value={coinType}
              onChange={(e) => setCoinType(e)}
            />
            <PathSegment
              disabled={isLoading}
              defaultHardened
              hardened={isAccountHardened}
              onHarden={(e) => onCheck(e, setIsAccountHardened)}
              value={account}
              onChange={(e) => setAccount(e)}
            />
            <PathSegment
              disabled={isLoading}
              hardened={isChangeHardened}
              onHarden={(e) => onCheck(e, setIsChangeHardened)}
              value={change}
              onChange={(e) => setChange(e)}
            />
            <PathSegment
              disabled={isLoading}
              hardened={isIndexHardened}
              onHarden={(e) => onCheck(e, setIsIndexHardened)}
              value={index}
              onChange={(e) => setIndex(e)}
            />
            <Button
              onClick={() => getAddrs()}
              disabled={isLoading}
              type="primary"
            >
              Sync
            </Button>
            {/*  TODO: Handle modifying all addresses 
              <Button
                type="ghost"
                onClick={()=>setIsAddAddressesModalVisible(true))}
                disabled={isLoading || isLoadingAddressTags}
              >
                Edit All
              </Button> 
            */}
          </div>
          <Table
            dataSource={addresses}
            columns={addrsColumns}
            tableLayout="fixed"
            rowKey={(record) => record.address}
            loading={{
              spinning: isLoading,
              description: "Loading...",
              indicator: <LoadingOutlined />,
            }}
            pagination={false}
          />
        </div>
        <UpdateAddressTagsModal
          isModalVisible={isAddAddressesModalVisible}
          setIsModalVisible={setIsAddAddressesModalVisible}
          initialAddressTags={getInitialAddressTags()}
        />
      </Card>
    </PageContent>
  );
};

export default ExplorerPage;
