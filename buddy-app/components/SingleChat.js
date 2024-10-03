// components/SingleChat.js

import { ChatState } from "@/Context/ChatProvider";
import React, { useEffect, useState } from "react";
import { fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

import { getSender, getSenderProfile } from "@/config/ChatLogics";
import UpdateGroupChatModal from "./misc/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json"

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_ENDPOINT;
var socket, selectedChatCompare;

export default function SingleChat( {fetchAgain, setFetchAgain, user} ) {

  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  const { selectedChat, setSelectedChat, userId, token, notification, setNotification } = ChatState();
  const toast = useToast();

  const [ messages, setMessages ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ newMessage, setNewMessage ] = useState("");
  const [ socketConnected, setScoketConnected ] = useState(false);
  const [ typing, setTyping ] = useState(false);
  const [ isTyping, setIsTyping ] = useState(false);

  // Define the default options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // useEffect for Socket.Io
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userId);
    socket.on("connected", () => setScoketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));
  }, []);

  // useEffect for messages received
  useEffect(() => {
    socket.on("message_recieved", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        // Send a notification
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  // useEffect for fetching the chats
  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat])

  // Function to handle send message
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop_typing", selectedChat._id);
      try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Empty the new message before making the API call
      setNewMessage("");

      // Make the API request to send the message
      const { data } = await axios.post(`${apiUrl}/api/message`, {
        content: newMessage,
        chatId: selectedChat,
      }, 
      config);

      socket.emit("new_message", data);
      setMessages([...messages, data]);
      } catch (err) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  // Function to handle typing
  const typingHandler = (e) => {
    setNewMessage(e.target.value); 

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypedTime = new Date().getTime();
    var timerLenth = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypedTime;

      if (timeDiff >= timerLenth && typing) {
        socket.emit("stop_typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLenth);
  };

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      
      // Set loading to true before fetching
      setLoading(true);

      // Make the API call to fetch the chat messages
      const { data } = await axios.get(`${apiUrl}/api/message/${selectedChat._id}`, config);

      setMessages(data);
      setLoading(false);

      socket.emit("join_chat", selectedChat._id);
      
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            width={"100%"}
            fontFamily={"Poppins"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
            >
            <IconButton display={{ base: "flex", md: "none" }}
            icon={<ArrowBackIcon />}
            onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}

              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} userId={userId} fetchMessages={fetchMessages}/>
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
            >
            {/* Messages */}
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
                />
            ) : (
              <div
                className="messages"
                style={{overflow: "unset", height: "100%"}}>
                {/* User Messages Here */}
                <ScrollableChat messages={messages} userId={userId}/>
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
              >
                {isTyping ? <div>
                  <Lottie 
                  style={{ width: "70px", marginBottom: "15px", marginLeft: "0px"}}
                  options={defaultOptions}
                /></div> : <></>}
                <Input 
                  variant={"filled"}
                  bg={"#E0E0E0"}
                  placeholder="Enter a message.."
                  onChange={typingHandler}
                  value={newMessage}
                />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display={"flex"} alignItems={"center"} height={"100%"}>
          <Text fontSize={"3xl"} pb={3} fontFamily={"Poppins"}>
            Click on a user or search a user to start chatting
          </Text>
        </Box> 
      )}
    </>
  )
};
