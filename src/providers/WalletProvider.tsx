import { createDAppKit, DAppKitProvider } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { VaultProvider } from "@evefrontier/dapp-kit";

const dAppKit = createDAppKit({
  networks: ["testnet"],
  createClient: () =>
    new SuiGrpcClient({
      network: "testnet",
      baseUrl: "https://fullnode.testnet.sui.io:443",
    }),
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <DAppKitProvider dAppKit={dAppKit}>
      <VaultProvider>{children}</VaultProvider>
    </DAppKitProvider>
  );
}
