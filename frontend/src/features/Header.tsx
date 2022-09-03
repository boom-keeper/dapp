import { NextPage } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Text, Image, Flex } from "@chakra-ui/react";

const Header = () => {
  return (
    <header>
      <Flex
        maxW="1400px"
        paddingY="30px"
        marginX="auto"
        justifyContent="space-between"
      >
        <Flex justifyContent="center" alignItems="center" gap="6px">
          <Image
            src="https://avatars.githubusercontent.com/u/112223515?s=64&v=4"
            w="38px"
            h="38px"
          />
          <Text fontSize="35px" fontWeight="bold" letterSpacing="-1.5px">
            Boom Keeper
          </Text>
        </Flex>
        <ConnectButton />
      </Flex>
    </header>
  );
};

export default Header;
