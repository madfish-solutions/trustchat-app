import * as React from "react";
import { Link } from "wouter";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";

const ChatList = restrictWithTronWeb(() => {
  return (
    <div>
      <Link href="/chat/kek">Navigate to fake Chat</Link>
    </div>
  );
});

export default ChatList;
