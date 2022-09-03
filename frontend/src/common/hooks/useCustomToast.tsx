import { useToast } from "@chakra-ui/react";

export const useCustomToast = () => {
  const toast = useToast({
    position: "bottom-right",
    duration: 5000,
    containerStyle: {
      fontSize: "13px",
      color: "white",
    },
  });

  return toast;
};
