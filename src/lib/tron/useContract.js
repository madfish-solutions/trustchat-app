import { useAsyncMemo } from "use-async-memo";
import useTronWebContext from "lib/tron/useTronWebContext";

export default function useContract(address) {
  const { tronWeb } = useTronWebContext();

  const contract = useAsyncMemo(
    async () => {
      if (!tronWeb) {
        return null;
      }

      try {
        const result = await tronWeb.tw.contract().at(address);
        if (result.Error) {
          throw new Error(result.Error);
        }

        return result;
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }

        return null;
      }
    },
    [tronWeb, address],
    null
  );

  return contract;
}
