import * as React from "react";
import { Link } from "wouter";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const ChatList = restrictWithTronWeb(() => {
  return (
    <ContentContainer>
      <Header showBack={false} />
      <div className="bg-white p-4">
        <div>
          <Link href="/create-chat">Create Chat</Link>
        </div>
        <Link href="/chat/kek">Navigate to fake Chat</Link>
      </div>
    </ContentContainer>
  );
});

export default ChatList;
