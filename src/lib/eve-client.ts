import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { EVE_COIN_TYPE } from "./constants";

export const suiClient = new SuiJsonRpcClient({ network: "testnet", url: getJsonRpcFullnodeUrl("testnet") });

export async function getLargestEveCoin(
  owner: string,
): Promise<{ id: string; balance: bigint } | null> {
  const { data } = await suiClient.getCoins({ owner, coinType: EVE_COIN_TYPE });
  if (!data?.length) return null;
  const top = [...data].sort(
    (a, b) => Number(BigInt(b.balance) - BigInt(a.balance)),
  )[0];
  return { id: top.coinObjectId, balance: BigInt(top.balance) };
}

export async function getEveBalance(owner: string): Promise<bigint> {
  const { data } = await suiClient.getCoins({ owner, coinType: EVE_COIN_TYPE });
  return (data ?? []).reduce(
    (acc: bigint, c: { balance: string }) => acc + BigInt(c.balance),
    0n,
  );
}
