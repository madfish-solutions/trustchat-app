import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import useStayScrolled from "react-stay-scrolled";
import Div100vh from "react-div-100vh";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const MESSAGE = { text: "foo" };
const INITIAL_MESSAGES = [
  MESSAGE,
  MESSAGE,
  MESSAGE,
  MESSAGE,
  MESSAGE,
  MESSAGE,
  MESSAGE
];

const Chat = restrictWithTronWeb(({ params }) => {
  const chatId = params.id;
  console.info(chatId);

  const messagesBlockRef = React.useRef(null);

  const { stayScrolled } = useStayScrolled(messagesBlockRef);

  React.useEffect(() => {
    const el = messagesBlockRef.current;
    BSL.disableBodyScroll(el);
    return () => BSL.enableBodyScroll(el);
  }, []);

  const [messages, setMessages] = React.useState(INITIAL_MESSAGES);

  React.useLayoutEffect(() => {
    stayScrolled();
  }, [stayScrolled, messages]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prevMessages => prevMessages.concat([MESSAGE]));
    }, 500);

    return () => clearInterval(interval);
  }, []);

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
          <div className="flex-1" />
          {messages.map(({ text }, i) => (
            <div key={i} className={classNames("flex items-center", "mt-4")}>
              <span
                key={i}
                className={classNames("py-2 px-5", "bg-gray-200", "rounded")}
              >{`${text} ${i}`}</span>
            </div>
          ))}
        </div>
        <form
          className={classNames(
            "w-full h-16",
            "bg-gray-200",
            "p-2",
            "flex items-strech"
          )}
        >
          <textarea
            className={classNames(
              "flex-1",
              "bg-white rounded",
              "py-1 px-2",
              "focus:outline-none focus:shadow-outline"
            )}
          />
          <button
            className={classNames(
              "ml-2",
              "w-20",
              "bg-blue-400 hover:bg-blue-500",
              "rounded",
              "text-white hover:text-gray-100",
              "font-bold",
              "flex items-center justify-center"
            )}
          >
            Send
          </button>
        </form>
      </ContentContainer>
    </Div100vh>
  );
});

export default Chat;
