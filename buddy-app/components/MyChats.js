// components/MyChats.js

import axios from 'axios';
import { ChatState } from "@/Context/ChatProvider"
import { Button, Divider, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react"
import { fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Stack, Text } from '@chakra-ui/layout';

import ChatLoading from './ChatLoading';
import { getSender } from '@/config/ChatLogics';
import GroupChatModal from './misc/GroupChatModal';

export default function MyChats({ fetchAgain }) {

  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
  
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [ loggedUser, setLoggedUser ] = useState(null);
  const toast = useToast();

  // Function to fetch the chats
  const fetchChats = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Make the request to fetch the chats
      const { data } = await axios.get(`${apiUrl}/api/chat`, config);

      // Fetch current user info
      const user = await getCurrentUser();

      // Set loggedUser if the username exists in the current user
      if (user) {
        setLoggedUser({
          username: user.username,
          userId: user.userId
        });
      } else {
        console.error("Current user could not be retrieved.");
      }

      // Set the chats data
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box 
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg='white'
      width={{ base: "100%", md: "31%"}}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily={"poppins"}
        display={'-ms-flexbox'}
        w={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        My Chats
        <Divider />
          <GroupChatModal>
            <Button
            display={"-ms-flexbox"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            width={"100%"}
            >
              New Group Chat
            </Button>
          </GroupChatModal>      
        <Divider />
      </Box>

      <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#F8F8F8"
      w="100%"
      borderRadius="lg"
      overflowY="hidden"
      >
        {chats? (
          <Stack overflowY={true}>
            {
              chats.map((chat) => (
                <Box
                onClick={() => setSelectedChat(chat)}
                cursor={"pointer"}
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius={"lg"}
                key={chat._id}
                >
                  <Text>
                    {!chat.isGroupChat ? (
                      loggedUser ? getSender(loggedUser, chat.users) : 'Loading...'
                    ) : chat.chatName}
                  </Text>
                </Box>
              ))
            }
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};
