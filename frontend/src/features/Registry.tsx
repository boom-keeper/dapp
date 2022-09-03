import { Flex, Select, Input, Button, Text, Box } from "@chakra-ui/react";
import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import registryABI from "../abis/KeeperRegistry.json";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { useCustomToast } from "../common/hooks/useCustomToast";

const Registry = () => {
  const [target, setTarget] = useState("");
  const { address, isConnected } = useAccount();

  const toast = useCustomToast();

  const { config } = usePrepareContractWrite({
    addressOrName: "0x595B999FaC4385b866661E5Bf254FEbFD1714Fab",
    contractInterface: registryABI.abi,
    functionName: "registerUpkeep",
    args: [target, new BigNumber(2300).toString(), address, "0x00"],
    onError(error) {
      console.error(
        `An error occurred preparing the transaction: ${error.message}`
      );
    },
  });

  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...config,
    onError(error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        status: "error",
      });
    },
    onSuccess(data) {
      toast({
        title: "Transaction confirmed. Waiting to be finalized...",
        description: (
          <a
            href={`https://goerli.etherscan.io/tx/${data.hash}`}
            target="_blank"
            rel="noreferrer"
          >
            See details on Etherscan
          </a>
        ),
        status: "success",
      });
    },
  });

  const handleClick = () => {
    if (!isConnected) {
      toast({
        title: "Connect your wallet for registering new job",
        status: "error",
      });
    }

    write?.();
  };

  return (
    <Flex direction="column" gap="30px">
      <Text fontSize="20px" fontWeight="bold" color="blue.600">
        Register new Upkeep
      </Text>
      <Flex w="440px" gap="36px" direction="column" px="4px">
        <Flex gap="20px" direction="column">
          <div>
            <Text mb="4px">Trigger</Text>
            <Select>
              <option value="custom">Custom logic</option>
              <option value="time" disabled>
                Time based
              </option>
            </Select>
          </div>
          <div>
            <Text mb="2px"> Target contract address</Text>
            <Input onChange={(e) => setTarget(e.target.value)} />
          </div>
        </Flex>
        <Button
          bgColor="#005baf"
          color="white"
          onClick={handleClick}
          disabled={!write}
        >
          Register New Job
        </Button>
      </Flex>
    </Flex>
  );
};

export default Registry;
