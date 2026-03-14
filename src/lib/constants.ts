export const JOTUNN = {
  characterId:
    "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
  wallet:
    "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b",
  itemId: "2112077867",
  tribeId: 98000430,
  name: "War Admiral Jotunn",
} as const;

export const WORLD_PACKAGE_ID =
  import.meta.env.VITE_EVE_WORLD_PACKAGE_ID as string;

export const REGISTRIES = {
  killmail:
    "0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283",
  location:
    "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b",
  object:
    "0x454a9aa3d37e1d08d3c9181239c1b683781e4087fbbbd48c935d54b6736fd05c",
} as const;

export const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const SUISCAN_BASE = "https://suiscan.xyz/testnet";

export const WEBHOOKS: string[] = [];
