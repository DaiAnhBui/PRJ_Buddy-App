// context/ChatProvider.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import axios from "axios";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState();
  const [ token, setToken ] = useState(null);
  const [ userId, setUserId ] = useState(null);
  const [ notification, setNotification ] = useState([]);

  useEffect(() => {
    const fetchUserData = async() => {
      try {
        // To get the token and set the configuration
        const session = await fetchAuthSession();
        const token = session.tokens.idToken;
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        setToken(token);

        // To get the user ID from the DB
        const { username, userId } = await getCurrentUser();
        const cognitUsername = username;
        const response = await axios.get(`${apiUrl}/api/userId?cognitoUsername=${cognitUsername}`, config);
        const { _id } = response.data;
        setUserId(_id);

        console.log(`The user ${username} is authenticated`);

      } catch (err) {
        console.error("Error fetching user data: ", err);
      }
    };

    fetchUserData();
  }, [])

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        userId,
        setUserId, 
        token,
        setToken,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
