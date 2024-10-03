// components/misc/GroupChatModal.js

import React, { useState } from "react";
import { fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';
import { Modal, Button, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, FormControl, Input, Text, Box } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { ChatState } from "@/Context/ChatProvider";
import axios from "axios";
import UserListItem from "../users/UserListItem";
import UserBadgeItem from "../users/UserBadgeItem";

export default function GroupChatModal({ children }) {

  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [ groupChatName, setGroupChatName ] = useState();
  const [ selectedUsers, setSelectedUsers ] = useState([]);
  const [ search, setSearch ] = useState("");
  const [ searchResult, setSearchResult ] = useState([]);
  const [ loading, setLoading ] = useState(false);

  const toast = useToast();

  const { chats, setChats } = ChatState();

  // Function to handle the search of users
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

      // To get the current logged in user info
      const user = await getCurrentUser();

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

  // Function to handle group
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // Function to handle delete
  const handleDelete = (deletedUser) => {
    setSelectedUsers(selectedUsers.filter(sel => sel._id !== deletedUser._id));
  };

  // Function to handle submit
  const handleSubmit = async () => {
    
    // To check if the group chat name and memebers exist or not
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      // To get the token and set the configuration
      const session = await fetchAuthSession();
      const token = session.tokens.idToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // To get the current logged in user info
      const user = await getCurrentUser();

      const { data } = await axios.post(`${apiUrl}/api/chat/group`, {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      }, config);

      setChats([ data, ...chats ]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (err) {
      toast({
        title: "Failed to Create the Chat!",
        description: "Please Try Again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
          fontSize={"35px"}
          fontFamily={"Poppins"}
          display={"flex"}
          justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
          display={"flex"}
          flexDir={"column"}
          alignItems={"center"}
          >
            <FormControl>
              <Input placeholder="Chat Name" mb={3} onChange={(e) => setGroupChatName(e.target.value)}/>
            </FormControl>
            <FormControl>
              <Input placeholder="Add Users" mb={1} onChange={(e) => handleSearch(e.target.value)}/>
            </FormControl>
            {/* Selected Users */}
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
              {selectedUsers.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
              ))}
            </Box>

            {/* Render Searched Users */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              search.length > 0 ? (
                searchResult.length > 0 ? (
                  searchResult.slice(0, 4).map((user) => (
                    <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                  ))
                ) : (
                  <div>No users found</div>
                )
              ) : (
                <div>Enter a search query</div>
              )
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
