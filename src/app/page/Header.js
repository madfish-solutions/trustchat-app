import * as React from "react";
import classNames from "clsx";
import { Link } from "wouter";

const Header = ({ showBack = true, showCreateChat = true }) => {
  const handleBackClick = React.useCallback(() => {
    window.history.back();
  }, []);

  return (
    <header
      className={classNames(
        "w-full h-16 px-4",
        "bg-red-400",
        "flex items-center",
        "text-white"
      )}
    >
      <div className="flex-1">
        {showBack ? (
          <button
            className={classNames(
              "py-1 pl-1 pr-3",
              "border border-white rounded",
              "flex items-center"
            )}
            onClick={handleBackClick}
          >
            <svg
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              aria-labelledby="chevronLeftIconTitle"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              color="white"
            >
              {" "}
              <title id="chevronLeftIconTitle">Chevron Left</title>{" "}
              <polyline points="14 18 8 12 14 6 14 6" />{" "}
            </svg>
            back
          </button>
        ) : null}
      </div>
      <span className="font-semibold text-lg">Trust Chat</span>
      <div className="flex-1 flex justify-end">
        {showCreateChat ? (
          <Link href="/create-chat">
            <button
              className={classNames(
                "py-1 pl-2 pr-3",
                "border border-white rounded",
                "bg-white text-gray-800",
                "flex items-center"
              )}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-labelledby="chatAddIconTitle"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="stroke-current"
              >
                <title id="chatAddIconTitle">New chat</title>
                <path d="M21 4V17H13L7 21V17H3V4H21Z" />
                <path d="M15 10H9" />
                <path d="M12 7V13" />
              </svg>
              <span className="ml-1">Create Chat</span>
            </button>
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
