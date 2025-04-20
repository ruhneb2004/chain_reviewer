import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Chained_Review",
  projectId: "f07c0f3139ba1f80c42d1525852d1e1d",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(
      "https://mainnet.infura.io/v3/0c9d9d43be7445fda11d5d4948704f25"
    ),
    [sepolia.id]: http(
      "https://sepolia.infura.io/v3/0c9d9d43be7445fda11d5d4948704f25"
    ),
  },
});
