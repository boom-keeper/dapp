import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Flex,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { useAccount, useContractRead } from "wagmi";
import registryABI from "../abis/KeeperRegistry.json";

const CheckUpkeep = () => {
  const { isConnected } = useAccount();
  const { data: activeUpkeeps, error } = useContractRead({
    addressOrName: process.env.NEXT_PUBLIC_REGISTRY!,
    contractInterface: registryABI.abi,
    functionName: "getActiveUpkeepIDs",
    args: ["0", "0"],
  });

  return (
    <>
      {error && (
        <div>An error occurred preparing the transaction: {error.message}</div>
      )}

      <Flex direction="column" gap="30px">
        <div>
          <Text fontSize="20px" fontWeight="bold" color="blue.600" pb="8px">
            My upkeeps
          </Text>
          <UpkeepListTable>
            {isConnected ? (
              activeUpkeeps?.map((upkeep) => (
                <Upkeep upkeepId={upkeep._hex} isOnlyMyUpkeep={false} />
              ))
            ) : (
              <Flex
                alignItems="center"
                justifyContent="center"
                w="900px"
                h="60px"
                fontWeight="bold"
              >
                Please Connect Wallet
              </Flex>
            )}
          </UpkeepListTable>
        </div>

        <div>
          <Text fontSize="20px" fontWeight="bold" color="blue.600" pb="8px">
            Recent upkeeps
          </Text>
          <UpkeepListTable>
            {activeUpkeeps?.map((upkeep) => (
              <Upkeep upkeepId={upkeep._hex} isOnlyMyUpkeep={false} />
            ))}
          </UpkeepListTable>
        </div>
      </Flex>
    </>
  );
};

const UpkeepListTable = ({ children }: { children: ReactNode }) => {
  return (
    <TableContainer width="900px" minH="100px">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Upkeeep ID</Th>
            <Th>Status</Th>
            <Th>Execute Gas</Th>
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </TableContainer>
  );
};

const Upkeep = ({
  upkeepId,
  isOnlyMyUpkeep,
}: {
  upkeepId: string;
  isOnlyMyUpkeep: boolean;
}) => {
  const { address } = useAccount();

  const {
    data: dataDetail,
    isError,
    isLoading,
    error,
  } = useContractRead({
    addressOrName: process.env.NEXT_PUBLIC_REGISTRY!,
    contractInterface: registryABI.abi,
    functionName: "getUpkeep",
    args: [upkeepId],
  });

  console.log({ dataDetail }, { error });

  if (!dataDetail) return null;
  if (isOnlyMyUpkeep && dataDetail[5] !== address) return null;

  return (
    <Tr>
      <Td>{upkeepId}</Td>
      <Td color="green" fontWeight="bold">
        Active
      </Td>
      <Td>{dataDetail[1]}</Td>
    </Tr>
  );
};

export default CheckUpkeep;
