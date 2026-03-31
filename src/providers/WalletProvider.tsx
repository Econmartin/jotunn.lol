import { EveFrontierProvider } from "@evefrontier/dapp-kit";
import { QueryClient } from "@tanstack/react-query";

export function WalletProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <EveFrontierProvider queryClient={queryClient}>
      {children}
    </EveFrontierProvider>
  );
}
