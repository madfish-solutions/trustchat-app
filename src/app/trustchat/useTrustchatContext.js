import * as React from "react";
import createUseContext from "constate";
import cryptico from "cryptico";
import { Buffer } from "buffer";
import useTronWebContext from "lib/tron/useTronWebContext";
import useContract from "lib/tron/useContract";
import useWatcher from "lib/tron/useWatcher";
import isAddressesEqual from "lib/tron/isAddressesEqual";
import getPubKeys from "app/trustchat/getPubKeys";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export default createUseContext(useTronchat);

function useTronchat() {
  const { tronWeb, accountId } = useTronWebContext();
  const contract = useContract(CONTRACT_ADDRESS);

  const accountPrivKey = React.useMemo(
    () => cryptico.generateRSAKey(accountId, 512),
    [accountId]
  );

  const accountPubKey = React.useMemo(
    () => cryptico.publicKeyString(accountPrivKey),
    [accountPrivKey]
  );

  const [pbPart1Hex, pbPart2Hex] = React.useMemo(() => {
    try {
      const buf = Buffer.from(accountPubKey, "base64");
      const part1 = buf.slice(0, buf.length / 2);
      const part2 = buf.slice(buf.length / 2, buf.length);
      return [`0x${part1.toString("hex")}`, `0x${part2.toString("hex")}`];
    } catch (_err) {
      return [null, null];
    }
  }, [accountPubKey]);

  const [chats, setChats] = React.useState([]);

  const lastInvitationEventRef = React.useRef(null);
  const iEventsHasMoreRef = React.useRef(true);

  const fetchInvitationEvents = React.useCallback(
    async (page = 1) => {
      const size = 50;
      const events = await tronWeb.tw.getEventResult(CONTRACT_ADDRESS, {
        previousLastEventFingerprint: lastInvitationEventRef.current
          ? lastInvitationEventRef.current.timestamp
          : null,
        eventName: "Invitation",
        size,
        page
      });

      lastInvitationEventRef.current = events[events.length - 1];
      iEventsHasMoreRef.current = events.length === size;

      return events.filter(evt =>
        isAddressesEqual(tronWeb.tw, evt.result._member, accountId)
      );
    },
    [tronWeb, accountId]
  );

  const toChat = React.useCallback(
    async evt => {
      if (!contract) return null;

      const id = evt.result._chatId;
      const member = evt.result._member;
      const [pubKeys, users, invitations] = await contract.getChat(id).call();
      const readyToChat = users.some(u =>
        isAddressesEqual(contract.tronWeb, u, accountId)
      );

      return {
        id,
        member,
        pubKeys,
        users,
        invitations,
        readyToChat
      };
    },
    [contract, accountId]
  );

  React.useEffect(() => {
    lastInvitationEventRef.current = null;
    fetchInvitationEvents().then(iEvents =>
      Promise.all(iEvents.map(toChat))
        .then(chs => Promise.resolve(chs.filter(Boolean)))
        .then(setChats)
    );
  }, [fetchInvitationEvents, toChat, setChats]);

  const getInvitationEventMethod = React.useCallback(
    () => contract && contract.Invitation(),
    [contract]
  );

  const handleInvitationEventRes = React.useCallback(
    async evt => {
      if (isAddressesEqual(tronWeb.tw, evt.result._member, accountId)) {
        const chat = await toChat(evt);
        if (chat) {
          setChats(currentChats => [chat, ...currentChats]);
        }
      }
    },
    [tronWeb, accountId, setChats, toChat]
  );

  useWatcher(getInvitationEventMethod, handleInvitationEventRes);

  const getJoinChatEventMethod = React.useCallback(
    () => contract && contract.JoinChat(),
    [contract]
  );

  const handleJoinChatEventRes = React.useCallback(
    async evt => {
      const chatIndex = chats.findIndex(({ id }) => id === evt.result._chatId);
      if (chatIndex !== -1) {
        const chat = await toChat(evt);
        if (chat) {
          setChats(currentChats =>
            currentChats.map((c, i) => (i === chatIndex ? chat : c))
          );
        }
      }
    },
    [chats, setChats, toChat]
  );

  useWatcher(getJoinChatEventMethod, handleJoinChatEventRes);

  const handleChatsLoadMore = React.useCallback(
    async page => {
      const iEvents = await fetchInvitationEvents(page);
      const chats = await Promise.all(iEvents.map(toChat)).then(chs =>
        Promise.resolve(chs.filter(Boolean))
      );

      setChats(currentChats => currentChats.concat(chats));
    },
    [fetchInvitationEvents, toChat, setChats]
  );

  const acceptInvitation = React.useCallback(
    async chatId => {
      try {
        if (!contract) {
          return;
        }

        await contract
          .joinChat(chatId, pbPart1Hex, pbPart2Hex)
          .send({ shouldPollResponse: true });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
      }
    },
    [contract, pbPart1Hex, pbPart2Hex]
  );

  const sendMessage = React.useCallback(
    async (chatId, message) => {
      if (!contract) {
        return;
      }

      const chat = chats.find(c => c.id === chatId);
      if (!chat) {
        throw new Error("Error. Chat Not Found! Try to reassign to chat");
      }

      const encMessages = getPubKeys(chat.pubKeys).map(
        key => cryptico.encrypt(message, key).cipher
      );

      const messagePackage = contract.tronWeb.fromUtf8(
        JSON.stringify(encMessages)
      );

      return contract
        .send(chatId, Date.now(), messagePackage)
        .send({ shouldPollResponse: true });
    },
    [contract, chats]
  );

  const getMessageEvents = React.useCallback(
    async (params = {}) => {
      if (!contract) {
        return null;
      }

      return contract.tronWeb.getEventResult(CONTRACT_ADDRESS, {
        eventName: "Message",
        ...params
      });
    },
    [contract]
  );

  const initialized = Boolean(contract);
  const hasMoreChats = iEventsHasMoreRef.current;

  return React.useMemo(
    () => ({
      contract,
      accountId,
      accountPrivKey,
      accountPubKey,
      pbPart1Hex,
      pbPart2Hex,
      chats,
      handleChatsLoadMore,
      hasMoreChats,
      acceptInvitation,
      sendMessage,
      getMessageEvents,
      initialized
    }),
    [
      contract,
      accountId,
      accountPrivKey,
      accountPubKey,
      pbPart1Hex,
      pbPart2Hex,
      chats,
      handleChatsLoadMore,
      hasMoreChats,
      acceptInvitation,
      sendMessage,
      getMessageEvents,
      initialized
    ]
  );
}
