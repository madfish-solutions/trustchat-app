import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import useStayScrolled from "react-stay-scrolled";
import Div100vh from "react-div-100vh";
import cryptico from "cryptico";
import InfiniteScroll from "react-infinite-scroller";
import cogoToast from "cogo-toast";
import useTronWebContext from "lib/tron/useTronWebContext";
import useWatcher from "lib/tron/useWatcher";
import isAddressesEqual from "lib/tron/isAddressesEqual";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import useTrustchatContext from "app/trustchat/useTrustchatContext";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const Chat = restrictWithTronWeb(({ params }) => {
  const messagesBlockRef = React.useRef(null);

  const { stayScrolled } = useStayScrolled(messagesBlockRef);

  React.useEffect(() => {
    const el = messagesBlockRef.current;
    BSL.disableBodyScroll(el);
    return () => BSL.enableBodyScroll(el);
  }, []);

  const [messages, setMessages] = React.useState([]);

  React.useLayoutEffect(() => {
    stayScrolled();
  }, [stayScrolled, messages]);

  const chatId = params.id;

  const {
    contract,
    getMessageEvents,
    sendMessage,
    chats,
    accountPrivKey
  } = useTrustchatContext();
  const { accountId } = useTronWebContext();

  const cht = React.useMemo(() => chats.find(c => c.id === chatId) || null, [
    chats,
    chatId
  ]);
  const myIndex = React.useMemo(() => {
    if (!(contract && cht && accountId)) {
      return null;
    }

    // console.info(cht.users, accountId);
    const i = cht.users.findIndex(u =>
      isAddressesEqual(contract.tronWeb, u, accountId)
    );
    // console.info(i);
    return i;
  }, [contract, cht, accountId]);

  const lastMessageEventRef = React.useRef(null);
  const messageEventsHasMoreRef = React.useRef(true);

  const fetchMessageEvents = React.useCallback(
    async (page = 1) => {
      const size = 100;
      const events = await getMessageEvents({
        previousLastEventFingerprint: lastMessageEventRef.current
          ? lastMessageEventRef.current.timestamp
          : null,
        size,
        page
      });

      lastMessageEventRef.current = events[events.length - 1];
      messageEventsHasMoreRef.current = events.length === size;

      return events.filter(evt => evt.result._chatId === chatId);
    },
    [getMessageEvents, chatId]
  );

  const toMessage = React.useCallback(
    evt => {
      if (!contract || !accountId) {
        return null;
      }

      if (myIndex === null || myIndex === -1) {
        return null;
      }

      try {
        const encMessages = JSON.parse(
          contract.tronWeb.toUtf8(evt.result._message)
        );
        const myMessage = encMessages[myIndex];
        const message = cryptico.decrypt(myMessage, accountPrivKey).plaintext;

        return {
          chatId: evt.result._chatId,
          timestamp: evt.result._msgId,
          from: evt.result._from,
          message,
          my: isAddressesEqual(contract.tronWeb, evt.result._from, accountId)
        };
      } catch (_err) {
        return null;
      }
    },
    [contract, accountId, myIndex, accountPrivKey]
  );

  React.useEffect(() => {
    lastMessageEventRef.current = null;
    fetchMessageEvents().then(events => {
      setMessages(events.map(toMessage).filter(Boolean));
    });
  }, [fetchMessageEvents, toMessage]);

  const handleMessagesLoadMore = React.useCallback(
    async page => {
      const events = await fetchMessageEvents(page);
      setMessages(currentMessages => {
        return currentMessages.concat(events.map(toMessage).filter(Boolean));
      });
    },
    [fetchMessageEvents, toMessage]
  );

  const getMessageEventMethod = React.useCallback(
    () => contract && contract.Message(),
    [contract]
  );

  const handleMessageEventRes = React.useCallback(
    evt => {
      if (evt.result._chatId === chatId) {
        const msg = toMessage(evt);
        if (msg) {
          setMessages(messages => [toMessage(evt), ...messages]);
        }
      }
    },
    [chatId, setMessages, toMessage]
  );

  useWatcher(getMessageEventMethod, handleMessageEventRes);

  const messageFieldRef = React.useRef(null);

  // const [sending, setSending] = React.useState(false);
  const sending = false;

  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  });

  const handleSendMessage = React.useCallback(async () => {
    const message = `${messageFieldRef.current.value.trim()}`;
    if (!message) return;

    // setSending(true);
    try {
      cogoToast.info("Sending encrypted message...");

      messageFieldRef.current.value = "";
      await sendMessage(chatId, message);

      // if (mountedRef.current) {
      //   messageFieldRef.current.value = "";
      //   setSending(false);
      // }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }

      cogoToast.error(err.message);
      // if (mountedRef.current) {
      //   messageFieldRef.current.value = "";
      //   setSending(false);
      // }
    }
  }, [sendMessage, chatId]);

  return (
    <Div100vh>
      <ContentContainer className="h-full flex flex-col shadow">
        <Header />
        <div
          ref={messagesBlockRef}
          className={classNames(
            "flex-1 bg-white",
            "overflow-y-auto scrolling-touch",
            "p-4",
            "flex flex-col"
          )}
        >
          <div className="flex-1">
            {messages.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-semibold text-gray-500">No Messages</span>
              </div>
            ) : null}
          </div>
          <InfiniteScroll
            isReverse={true}
            pageStart={1}
            initialLoad={false}
            loadMore={handleMessagesLoadMore}
            hasMore={messageEventsHasMoreRef.current}
            loader={
              <div
                key="-1"
                className="py-4 px-2 flex justify-center text-gray-500"
              >
                Loading ...
              </div>
            }
            useWindow={false}
            getScrollParent={() => messagesBlockRef.current}
          >
            {[]
              .concat(messages)
              .reverse()
              .map(({ message, my }, i) => (
                <div
                  key={i}
                  className={classNames("flex items-center", "mt-4")}
                >
                  {my ? <div className="flex-1" /> : null}
                  <span
                    key={i}
                    className={classNames(
                      "py-2 px-5",
                      my ? "bg-blue-200" : "bg-gray-200",
                      "text-sm text-gray-800",
                      "rounded",
                      "max-w-full"
                    )}
                    style={{ wordWrap: "break-word" }}
                  >
                    {message}
                  </span>
                </div>
              ))}
          </InfiniteScroll>
        </div>
        <form
          className={classNames(
            "w-full h-16",
            "bg-gray-200",
            "p-2",
            "flex items-strech",
            sending && "pointer-events-none",
            sending && "opacity-50"
          )}
        >
          <textarea
            ref={messageFieldRef}
            className={classNames(
              "flex-1",
              "bg-white rounded",
              "py-1 px-2",
              "focus:outline-none focus:shadow-outline"
            )}
            disabled={sending}
          />
          <button
            type="button"
            disabled={sending}
            className={classNames(
              "ml-2",
              "w-20",
              "bg-blue-400 hover:bg-blue-500",
              "rounded",
              "text-white hover:text-gray-100",
              "font-bold",
              "flex items-center justify-center"
            )}
            onClick={handleSendMessage}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </ContentContainer>
    </Div100vh>
  );
});

export default Chat;
