// components/misc/ProfileModal.js

import { Text } from "@aws-amplify/ui-react";
import { ViewIcon } from "@chakra-ui/icons";
import { IconButton, Image, useDisclosure } from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Lorem, ModalFooter, Button } from "@chakra-ui/react";

import { fetchUserAttributes } from "@aws-amplify/auth";

import React, { useEffect, useState } from "react";

export default function ProfileModal({ user, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [userEmail, setUserEmail] = useState('');

  // Function to get the current user's email
  const getUserEmail = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      const email = userAttributes.email;
      setUserEmail(email);
    } catch (error) {
      console.error("Error fetching user attributes:", error);
    }
  };

  useEffect(() => {
    getUserEmail();
  }, []);


  if (!user) {
    return null; // Ensure that user is defined before rendering
  }
  
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size={"lg"} isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent height={"410px"}>
          <ModalHeader fontSize={"40px"} fontFamily={"Poppins"} display={"flex"} justifyContent={"center"}>{user.username}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"} justifyContent={"space-between"}>
            <Image borderRadius={"full"} boxSize={"150px"} src={user.username} alt={user.username}></Image>
            <Text fontSize={{ base: "28px", md: "30px" }} fontFamily={"poppins"}>
              <b>Email: </b>
              {userEmail}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
