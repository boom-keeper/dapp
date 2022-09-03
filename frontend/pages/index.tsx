import { NextPage } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import Registry from "../src/features/Registry";
import CheckUpkeep from "../src/features/CheckUpkeep";
import { Divider, Flex } from "@chakra-ui/react";

const Main: NextPage = () => {
  return (
    <Flex
      maxW="1400px"
      alignItems="flex-start"
      mt="40px"
      px="40px"
      marginX="auto"
      gap="40px"
      flexDirection="column"
    >
      <Registry />
      <Divider orientation="horizontal" color="blue.600" border="4px" />
      <CheckUpkeep />
    </Flex>
  );
};

export default Main;
