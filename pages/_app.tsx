import type { AppProps } from "next/app";
import { WagmiConfig, createClient, chain, configureChains } from "wagmi";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "../src/common/features/Header";

const { chains, provider } = configureChains(
  //   [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [chain.goerli],
  [
    alchemyProvider({ apiKey: "dCQDoMQTsnzhCdUscKkDf-AFd15FUr3Z" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} modalSize="compact">
        <ChakraProvider>
          <Header />
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
