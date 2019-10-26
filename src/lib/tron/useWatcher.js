import * as React from "react";

export default function useWatcher(getWatchMethod, handleRes) {
  const watcherRef = React.useRef(null);

  React.useEffect(() => {
    restartWatcher();
    return stopWatcher;

    async function startWatcher() {
      const watchMethod = getWatchMethod();
      if (watchMethod) {
        watcherRef.current = await watchMethod.watch((err, res) => {
          if (err) {
            if (process.env.NODE_ENV === "development") {
              console.error(err);
            }
            restartWatcher();
            return;
          }

          handleRes(res);
        });
      }
    }

    function stopWatcher() {
      if (watcherRef.current) {
        watcherRef.current.stop();
      }
    }

    function restartWatcher() {
      stopWatcher();
      startWatcher();
    }
  }, [getWatchMethod, handleRes]);
}
