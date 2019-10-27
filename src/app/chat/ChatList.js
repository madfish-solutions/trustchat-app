import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import { Link } from "wouter";
import Div100vh from "react-div-100vh";
import InfiniteScroll from "react-infinite-scroller";
import useTrustchatContext from "app/trustchat/useTrustchatContext";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const ChatList = restrictWithTronWeb(() => {
  const chatsBlockRef = React.useRef(null);

  React.useEffect(() => {
    const el = chatsBlockRef.current;
    BSL.disableBodyScroll(el);
    return () => BSL.enableBodyScroll(el);
  }, []);

  const {
    chats,
    handleChatsLoadMore,
    hasMoreChats,
    acceptInvitation
  } = useTrustchatContext();

  return (
    <Div100vh>
      <ContentContainer className="h-full flex flex-col shadow">
        <Header showBack={false} />
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
            loadMore={handleChatsLoadMore}
            hasMore={hasMoreChats}
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
              {chats.map(
                ({ id, invitations, users, readyToChat }, index, arr) => {
                  const last = index === arr.length - 1;

                  return (
                    <Link key={id} href={readyToChat ? `/chat/${id}` : null}>
                      <a
                        href="stub"
                        className={classNames(
                          "relative",
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
                                const joined = users.some(m => m === mmbr);

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
                            <b>{users.length}</b> of <b>{invitations.length}</b>{" "}
                            joined
                          </span>
                        </div>

                        {!readyToChat ? (
                          <div
                            className={classNames(
                              "absolute inset-0",
                              "flex items-center justify-center"
                            )}
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                          >
                            <button
                              className={classNames(
                                "bg-gray-100 hover:bg-gray-200 text-gray-900 text-base font-bold py-2 px-6 rounded"
                              )}
                              onClick={e => acceptInvitation(id)}
                            >
                              Join to Chat
                            </button>
                          </div>
                        ) : null}
                      </a>
                    </Link>
                  );
                }
              )}
            </div>
          </InfiniteScroll>
        </div>
      </ContentContainer>
    </Div100vh>
  );
});

export default ChatList;

function getImgUrl(id, type = "jdenticon") {
  return `https://avatars.dicebear.com/v2/${type}/${id}.svg`;
}
