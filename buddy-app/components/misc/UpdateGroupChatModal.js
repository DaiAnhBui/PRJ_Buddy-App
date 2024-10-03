// componnts/misc/UpdateGroupChatModal.js

import React, { useState } from "react";
import axios from "axios";
import { fetchAuthSession } from '@aws-amplify/auth';

import { Box, FormControl, IconButton, Input, Spinner, useDisclosure, useToast, Text } from "@chakra-ui/react";
import { InfoIcon, ViewIcon } from "@chakra-ui/icons";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from "@chakra-ui/react";
import { ChatState } from "@/Context/ChatProvider";
import UserBadgeItem from "../users/UserBadgeItem";
import UserListItem from "../users/UserListItem";

export default function UpdateGroupChatModal({ fetchAgain, setFetchAgain, userId, fetchMessages }) {

  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {selectedChat, setSelectedChat }= ChatState()

  const [ groupChatName, setGroupChatName ] = useState("");
  const [ search, setSearch ] = useState("");
  const [ searchResult, setSearchResult ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [  renameLoading, setRenameLoading ] = useState(false);

  const toast = useToast();

  // Function to handle remove
  const handleRemove = async (user1) => {

    // To check if the user is the admin
    if (selectedChat.groupAdmin._id !== userId && user1._id !== userId) {
      toast({
        title: "Only admins can add or remove!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    };

    try {

      setLoading(true);

      // To get the token and set the configuration
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`${apiUrl}/api/chat/groupRemove`, 
        {
          chatId: selectedChat._id,
          userId: user1._id,
        }, config
      );

      if (user1 === userId) {
        setSelectedChat();
      } else {
        setSelectedChat(data);
      }

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  // Function to handle rename
  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    try {
      setRenameLoading(true);

      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Make the request to update the group name
      const { data } = await axios.put(`${apiUrl}/api/chat/rename`, 
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        }, config);

        setSelectedChat(data); // To update the chat data with the new name
        setFetchAgain(!fetchAgain); // TO fetch the chat data again
        setRenameLoading(false);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Something went wrong while renaming the group",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setRenameLoading(false);
      }
    setGroupChatName("");
  };

  // Function to handle search
  const handleSearch = async (query) => {
    setSearch(query)

    // Check if the query exists or not
    if (!query) {
      return;
    }

    try {
      setLoading(true);

      // To get the token and set the configuration
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`${apiUrl}/api/user?name=${query}`, config);
      setLoading(false);
      setSearchResult(data.users);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    };
  };

  // Function to handle add user
  const handleAddUser = async (user1) => {

    // To check if the user is already there in the group
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    };

    // To check if the user is the admin
    if (selectedChat.groupAdmin.cognitoUsername !== user.username) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    };

    try {

      setLoading(true);

      // To get the token and set the configuration
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`${apiUrl}/api/chat/groupAdd`, 
        {
          chatId: selectedChat._id,
          userId: user1._id,
        }, config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"25px"}
            fontFamily={"Poppins"}
            display={"flex"}
            justifyContent={"center"}
          >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box width={"100%"} display={"flex"} flexWrap={"wrap"} pb={3}> 
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display={"flex"}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme={"teal"}
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename} 
              >
                Update
              </Button>
            </FormControl>

            <FormControl display={"flex"}>
              <Input
                placeholder="Add a new user to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size={"lg"} />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(userId)} colorScheme={"red"}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
