import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import { Link } from "wouter";
import Div100vh from "react-div-100vh";
import InfiniteScroll from "react-infinite-scroller";
import useTronWebContext from "lib/tron/useTronWebContext";
import useContractContext from "app/tron/useContractContext";
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

  const { tronWeb, accountId } = useTronWebContext();
  const { contract, getChat } = useContractContext();

  /**
   * `Invitation` Events
   */
  const [invitationEvents, pureSetInvitationEvents] = React.useState([]);
  const lastInvitationEventRef = React.useRef(null);

  const setInvitationEvents = React.useCallback(
    value => {
      pureSetInvitationEvents(currentEvents => {
        const newEvents =
          typeof value === "function" ? value(currentEvents) : value;
        lastInvitationEventRef.current =
          newEvents[newEvents.length - 1] || null;
        return newEvents;
      });
    },
    [pureSetInvitationEvents]
  );

  const iEventsHasMoreRef = React.useRef(true);

  const fetchInvitationEvents = React.useCallback(
    async (page = 1) => {
      const size = 20;
      const events = await tronWeb.tw.getEventResult(CONTRACT_ADDRESS, {
        previousLastEventFingerprint: lastInvitationEventRef.current
          ? lastInvitationEventRef.current.timestamp
          : null,
        eventName: "Invitation",
        size,
        page
      });

      iEventsHasMoreRef.current = events.length === size;

      return events.filter(evt =>
        isAddressesEqual(tronWeb.tw, evt.result._member, accountId)
      );
    },
    [tronWeb, accountId]
  );

  const handleIEventsLoadMore = React.useCallback(
    async page => {
      const events = await fetchInvitationEvents(page);
      setInvitationEvents(currentEvents => currentEvents.concat(events));
    },
    [fetchInvitationEvents, setInvitationEvents]
  );

  /**
   * `JoinChat` Events
   */
  const [joinChatEvents, pureSetJoinChatEvents] = React.useState([]);
  const lastJoinChatEventRef = React.useRef(null);

  const setJoinChatEvents = React.useCallback(
    value => {
      pureSetJoinChatEvents(currentEvents => {
        const newEvents =
          typeof value === "function" ? value(currentEvents) : value;
        lastJoinChatEventRef.current = newEvents[newEvents.length - 1] || null;
        return newEvents;
      });
    },
    [pureSetJoinChatEvents]
  );

  const jcEventsHasMoreRef = React.useRef(true);

  const fetchJoinChatEvents = React.useCallback(
    async (page = 1) => {
      if (!getChat) {
        return [];
      }

      const size = 20;
      const events = await tronWeb.tw.getEventResult(CONTRACT_ADDRESS, {
        previousLastEventFingerprint: lastJoinChatEventRef.current
          ? lastJoinChatEventRef.current.timestamp
          : null,
        eventName: "JoinChat",
        size,
        page
      });

      jcEventsHasMoreRef.current = events.length === size;

      const myEvents = events.filter(evt =>
        isAddressesEqual(tronWeb.tw, evt.result._member, accountId)
      );

      return Promise.all(
        myEvents.map(async evt => {
          const [pubKeys, members, invitations] = await getChat(
            evt.result._chatId
          );
          const evtCopy = { ...evt };
          Object.assign(evtCopy.result, { pubKeys, members, invitations });
          return evtCopy;
        })
      );
    },
    [tronWeb, accountId, getChat]
  );

  const handleJCEventsLoadMore = React.useCallback(
    async page => {
      const events = await fetchJoinChatEvents(page);
      setJoinChatEvents(currentEvents => currentEvents.concat(events));
    },
    [fetchJoinChatEvents, setJoinChatEvents]
  );

  React.useEffect(() => {
    lastInvitationEventRef.current = null;
    lastJoinChatEventRef.current = null;

    Promise.all([fetchInvitationEvents(), fetchJoinChatEvents()]).then(
      ([iEvents, jcEvents]) => {
        setInvitationEvents(iEvents);
        setJoinChatEvents(jcEvents);
      }
    );
  }, [
    fetchInvitationEvents,
    fetchJoinChatEvents,
    setInvitationEvents,
    setJoinChatEvents
  ]);

  const acceptInvitation = React.useCallback(
    async iEvent => {
      try {
        if (!contract) {
          return;
        }

        await contract
          .joinChat(
            iEvent.result._chatId,
            contract.tronWeb.toHex("j".repeat(32))
          )
          .send({ shouldPollResponse: true });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error(err);
        }
      }
    },
    [contract]
  );

  return (
    <Div100vh>
      <ContentContainer className="h-full flex flex-col shadow">
        <Header showBack={false} />
        <LastInvitation
          invitationEvents={invitationEvents}
          joinChatEvents={joinChatEvents}
          hasMore={iEventsHasMoreRef.current}
          loadMore={handleIEventsLoadMore}
        >
          {iEvent =>
            iEvent ? (
              <div className="p-2 bg-gray-200 flex items-center">
                <span>Last Invitation {iEvent.result._chatId}</span>
                <div className="flex-1" />
                <button onClick={() => acceptInvitation(iEvent)}>Accept</button>
              </div>
            ) : null
          }
        </LastInvitation>
        <div
          ref={chatsBlockRef}
          className={classNames(
            "flex-1 bg-white",
            "overflow-y-auto scrolling-touch"
          )}
        >
          <InfiniteScroll
            pageStart={1}
            initialLoad={false}
            loadMore={handleJCEventsLoadMore}
            hasMore={jcEventsHasMoreRef.current}
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
              {joinChatEvents
                .map(createChat)
                .map(({ id, invitations, members }, index, arr) => {
                  const last = index === arr.length - 1;

                  return (
                    <Link key={id} href={`/chat/${id}`}>
                      <a
                        href="stub"
                        className={classNames(
                          "w-full",
                          "hover:bg-gray-100",
                          "flex items-strech"
                        )}
                      >
                        <div className="p-2">
                          <div
                            className={classNames(
                              "w-12 h-12 overflow-hidden",
                              "p-1",
                              "flex items-center justify-center",
                              "rounded"
                            )}
                            style={{
                              backgroundColor: "rgba(26, 200, 255, 0.35)"
                            }}
                          >
                            <img
                              src={getImgUrl(`${id}_${invitations.length}`)}
                              alt=""
                              className="h-full w-full"
                            />
                          </div>
                        </div>

                        <div
                          className={classNames(
                            "flex-1",
                            "p-2",
                            !last && "border-b border-gray-300",
                            "flex flex-col"
                          )}
                        >
                          <div className="flex items-center">
                            <span className="mr-2 text-lg text-gray-700 font-bold">
                              #{id}
                            </span>

                            {[]
                              .concat(invitations)
                              .reverse()
                              .map(mmbr => {
                                const joined = members.some(m => m === mmbr);

                                return (
                                  <div
                                    key={mmbr}
                                    className={classNames(
                                      "mr-1 w-5 h-5 overflow-hidden",
                                      "p-px",
                                      "bg-gray-200",
                                      "rounded",
                                      !joined && "opacity-25"
                                    )}
                                  >
                                    <img
                                      src={getImgUrl(mmbr, "bottts")}
                                      alt=""
                                      className="w-full h-full"
                                    />
                                  </div>
                                );
                              })}
                          </div>

                          <span className="text-xs text-gray-500">
                            <b>{members.length}</b> of{" "}
                            <b>{invitations.length}</b> joined
                          </span>
                        </div>
                      </a>
                    </Link>
                  );
                })}
            </div>
          </InfiniteScroll>
        </div>
      </ContentContainer>
    </Div100vh>
  );
});

export default ChatList;

function createChat(evt) {
  const {
    _chatId: id,
    _member: member,
    invitations,
    members,
    pubKeys
  } = evt.result;

  return { id, member, invitations, members, pubKeys };
}

const LastInvitation = ({
  children,
  invitationEvents,
  joinChatEvents
  // hasMore,
  // loadMore
}) => {
  // const pageRef = React.useRef(1);

  const realIEvents = React.useMemo(
    () =>
      invitationEvents.filter(evt =>
        joinChatEvents.every(
          jcEvt => jcEvt.result._chatId !== evt.result._chatId
        )
      ),
    [invitationEvents, joinChatEvents]
  );

  // const realIEventsSize = React.useMemo(() => realIEvents.length, [
  //   realIEvents
  // ]);

  // React.useEffect(() => {
  //   if (realIEventsSize === 0 && hasMore) {
  //     loadMore(pageRef.current);
  //     pageRef.current++;
  //   }
  // }, [realIEventsSize, hasMore, loadMore]);

  const lastEvent = realIEvents[0];
  return children(lastEvent);
};

function getImgUrl(id, type = "jdenticon") {
  return `https://avatars.dicebear.com/v2/${type}/${id}.svg`;
}
