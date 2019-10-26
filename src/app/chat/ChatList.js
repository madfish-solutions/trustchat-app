import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import { Link } from "wouter";
import Div100vh from "react-div-100vh";
import InfiniteScroll from "react-infinite-scroller";
import useTronWebContext from "lib/tron/useTronWebContext";
import isAddressesEqual from "lib/tron/isAddressesEqual";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const ChatList = restrictWithTronWeb(() => {
  const chatsBlockRef = React.useRef(null);

  React.useEffect(() => {
    const el = chatsBlockRef.current;
    BSL.disableBodyScroll(el);
    return () => BSL.enableBodyScroll(el);
  }, []);

  const [chatEvents, setChatEvents] = React.useState([]);

  const { tronWeb, accountId } = useTronWebContext();

  const hasMoreRef = React.useRef(true);

  const fetchMyChats = React.useCallback(
    async (page = 1) => {
      const lastEvent = chatEvents[chatEvents.length - 1];
      const events = await tronWeb.tw.getEventResult(CONTRACT_ADDRESS, {
        previousLastEventFingerprint: lastEvent ? lastEvent.timestamp : null,
        eventName: "OpenChat",
        size: 50,
        page
      });

      console.info(page, events);
      hasMoreRef.current = events.length !== 0;

      const appendedChats = events.filter(
        evt =>
          isAddressesEqual(tronWeb.tw, evt.result.creator, accountId) ||
          evt.result.mates.some(address =>
            isAddressesEqual(tronWeb.tw, address, accountId)
          )
      );

      setChatEvents(currentChats => currentChats.concat(appendedChats));
    },
    [tronWeb, accountId, chatEvents, setChatEvents]
  );

  return (
    <Div100vh>
      <ContentContainer className="h-full flex flex-col">
        <Header showBack={false} />
        <div
          ref={chatsBlockRef}
          className={classNames(
            "flex-1 bg-white",
            "overflow-y-auto scrolling-touch"
          )}
        >
          <InfiniteScroll
            pageStart={0}
            loadMore={fetchMyChats}
            hasMore={hasMoreRef.current}
            loader={
              <div
                key="-1"
                className="py-4 px-2 flex justify-center text-gray-500"
              >
                Loading ...
              </div>
            }
            useWindow={false}
            getScrollParent={() => chatsBlockRef.current}
          >
            <div className="flex flex-col">
              {chatEvents.map(createChat).map(({ id }) => (
                <Link key={id} href={`/chat/${id}`} className="w-full h-10">
                  {id}
                </Link>
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </ContentContainer>
    </Div100vh>
  );
});

export default ChatList;

function createChat(evt) {
  const { identifier, creator, mates } = evt.result;
  return {
    id: identifier,
    creator,
    mates
  };
}
