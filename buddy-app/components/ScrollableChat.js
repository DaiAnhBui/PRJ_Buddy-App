// components/ScrollableChat.js

import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "@/config/ChatLogics";
import { Avatar, Tooltip } from "@chakra-ui/react";

export default function ScrollableChat({ messages, userId }) {
  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => (
        <div
          style={{ 
            display: "flex", 
            alignItems: "center",
            marginBottom: isSameUser(messages, m, i) ? 5 : 10,
          }}
          key={m._id}
        >
          {(m.sender._id !== userId) && // Render avatar only if the sender is not the current user
            (isSameSender(messages, m, i, userId) ||
              isLastMessage(messages, i, userId)) && (
              <Tooltip
                label={m.sender.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar 
                  mt={"7px"}
                  mr={2}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  color={"#113f67"}
                  bgColor={"#a2a8d3"}
                />
              </Tooltip>
            )
          }
          <span
            style={{
              backgroundColor: `${
                m.sender._id === userId ? "#B9F5D0" : "#BEE3F8"
              }`,
              marginLeft: isSameSenderMargin(messages, m, i, userId),
              marginTop: isSameUser(messages, m, i, userId) ? 3 : 10,
              borderRadius: "20px",
              padding: "8px 15px",
              maxWidth: "75%",
            }}
          >
            {m.content}
          </span>
        </div>
      ))}
    </ScrollableFeed>
  );
}
