import { Transaction } from "@mysten/sui/transactions";
import {
  EVE_COIN_TYPE,
  EVE_SCALE,
  GAS_BUDGET,
  HUB_STATE_ID,
  SLOTS_HOUSE_ID,
  JOTUNN_PACKAGE_ID,
} from "./constants";

/** Pay 100 EVE to unlock a Hub video. Change is returned on-chain. */
export function buildHubUnlockTx(eveCoinId: string, videoId: number): Transaction {
  const tx = new Transaction();
  const [payment] = tx.splitCoins(tx.object(eveCoinId), [
    tx.pure.u64(100n * EVE_SCALE),
  ]);
  tx.moveCall({
    target: `${JOTUNN_PACKAGE_ID}::hub::unlock_video`,
    typeArguments: [EVE_COIN_TYPE],
    arguments: [tx.object(HUB_STATE_ID), tx.pure.u64(videoId), payment],
  });
  tx.setGasBudget(GAS_BUDGET);
  return tx;
}

/** Spin the slot machine with betEve EVE. Uses on-chain sui::random (0x8). */
export function buildSlotSpinTx(eveCoinId: string, betEve: number): Transaction {
  const tx = new Transaction();
  const [bet] = tx.splitCoins(tx.object(eveCoinId), [
    tx.pure.u64(BigInt(betEve) * EVE_SCALE),
  ]);
  tx.moveCall({
    target: `${JOTUNN_PACKAGE_ID}::slots::spin`,
    typeArguments: [EVE_COIN_TYPE],
    arguments: [
      tx.object(SLOTS_HOUSE_ID),
      bet,
      tx.object("0x8"), // sui::random shared object
    ],
  });
  tx.setGasBudget(GAS_BUDGET);
  return tx;
}
