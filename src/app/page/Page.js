import * as React from "react";
import { Route, Switch } from "wouter";

const ChatList = React.lazy(() => import("app/chat/ChatList"));
const Chat = React.lazy(() => import("app/chat/Chat"));
const CreateChat = React.lazy(() => import("app/chat/CreateChat"));

const Page = () => (
  <Switch>
    <Route path="/" component={ChatList} />
    <Route path="/chat/:id" component={Chat} />
    <Route path="/create-chat" component={CreateChat} />
  </Switch>
);

export default Page;
