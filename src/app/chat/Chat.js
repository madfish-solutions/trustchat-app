import * as React from "react";
import classNames from "clsx";
import * as BSL from "body-scroll-lock";
import useStayScrolled from "react-stay-scrolled";
import Div100vh from "react-div-100vh";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";

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
      <div className="h-full flex flex-col">
        <div className="h-12 bg-red-300" />
        <div
          ref={messagesBlockRef}
          className={classNames(
            "flex-1 bg-blue-300",
            "overflow-y-auto scrolling-touch",
            "flex flex-col"
          )}
        >
          <div className="flex-1" />
          {messages.map(({ text }, i) => (
            <div key={i}>{`${text} ${i}`}</div>
          ))}
        </div>
        <div className="h-16 bg-green-300">
          {/* <input type="text" className="w-full h-full" /> */}
        </div>
      </div>
    </Div100vh>
  );
});

export default Chat;
