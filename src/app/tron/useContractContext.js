import createUseContext from "constate";
import { useAsyncMemo } from "use-async-memo";
import useTronWebContext from "lib/tron/useTronWebContext";

const ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export default createUseContext(useContract);

function useContract() {
  const { tronWeb } = useTronWebContext();

  const contract = useAsyncMemo(
    async () => {
      if (!tronWeb) {
        return null;
      }

      try {
        const result = await tronWeb.tw.contract().at(ADDRESS);
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
    [tronWeb],
    null
  );

  return contract;
}
