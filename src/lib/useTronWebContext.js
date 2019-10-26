import * as React from "react";
import createUseContext from "constate";
import useForceUpdate from "use-force-update";

export default createUseContext(useTronWeb);

function useTronWeb() {
  const tw = getTronWeb();
  const envId = getEnvId(tw);
  const accountId = getAccountId(tw);
  const tronWeb = React.useMemo(() => ({ tw, envId }), [tw, envId]);

  const ready = Boolean(tw);

  const updatesCountRef = React.useRef(0);
  const isInitialUpdated = React.useCallback(
    () => updatesCountRef.current > 10,
    []
  );

  const updateTimeoutRef = React.useRef();
  const forceUpdate = useForceUpdate();

  const updateAndDefer = React.useCallback(() => {
    const initialUpdated = isInitialUpdated();
    if (!initialUpdated) {
      updatesCountRef.current++;
    }

    forceUpdate();

    const ms = initialUpdated ? 1000 : 100;
    updateTimeoutRef.current = setTimeout(updateAndDefer, ms);
  }, [forceUpdate, isInitialUpdated]);

  React.useEffect(() => {
    clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(updateAndDefer, 100);

    return () => {
      clearTimeout(updateTimeoutRef.current);
    };
  }, [updateAndDefer]);

  const initialized = ready || isInitialUpdated();

  return React.useMemo(() => ({ initialized, tronWeb, accountId, ready }), [
    initialized,
    tronWeb,
    accountId,
    ready
  ]);
}

function getTronWeb() {
  const tw = window.tronWeb;
  return tw && tw.ready ? tw : null;
}

function getEnvId(tw) {
  try {
    return tw
      ? [tw.fullNode.host, tw.solidityNode.host, tw.eventServer.host].join("")
      : null;
  } catch (_err) {
    return null;
  }
}

function getAccountId(tw) {
  return tw && tw.ready ? tw.defaultAddress.base58 : null;
}
