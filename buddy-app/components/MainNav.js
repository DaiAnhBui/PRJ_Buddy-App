// components/MainNav.js

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Flex, Tooltip, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Box, Input, useToast, Spinner, keyframes, Badge } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Text } from '@aws-amplify/ui-react';
import { useDisclosure } from '@chakra-ui/react';
import { fetchAuthSession } from "@aws-amplify/auth";
import axios from 'axios';

import ProfileModal from './misc/ProfileModal';
import UserListItem from './users/UserListItem';
import ChatLoading from './ChatLoading';
import { ChatState } from '@/Context/ChatProvider';
import { getSender } from '@/config/ChatLogics';

export default function MainNav({ user, signOut }) {

  // To get the API URL
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  // Using Context provider
  const { selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  // To handle forms
  const toast = useToast();

  // To handle the side drawer
  const { isOpen, onOpen, onClose } = useDisclosure();

  // To handle the drawer search
  const [ search, setSearch ] = useState('');

  // To handle search results
  const [searchResult, setSearchResult] = useState([]);

  // To handle loading of chats
  const [loading, setLoading] = useState(false);

  // To handle loading of chats
  const [loadingChat, setLoadingChat] = useState(false);

  // To route to other pages
  const router = useRouter();

  // To handle toggel
  const [isExpanded, setIsExpanded] = useState(false);

  // To handle Nav Toggel
  const handleNavToggle = (e) => {
    setIsExpanded(!isExpanded);
  }

  // To handle Nav Links
  const handleNavLinks = (e) => {
    setIsExpanded(false);
  }

  // To handle search
  const handleSearch =  async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      const session = await fetchAuthSession(); // Fetch the current user's session
      const token = session.tokens.idToken;
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`${apiUrl}/api/user?name=${search}`, config)
      setLoading(false);
      setSearchResult(data.users);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results, Please Try Again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      console.log("Error occured: ", err)
    }
  };

  // To handle accessing Chat
  const accessChat = async ( userId ) => {
    try {
      const session = await fetchAuthSession(); // Fetch the current user's session
      const token = session.tokens.idToken;
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(`${apiUrl}/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([ data, ...chats ]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // Animation for the notification icon
  const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  `;
  const animation = notification.length > 0 ? `${bounce} 0.5s infinite` : "none";

  return (
    <>
    {/* Header */}
      <Navbar expand="lg" className="bg-body-tertiary" expanded={isExpanded}>
        <Container>
          {router.pathname === '/chats' && (
            <Tooltip label="Search Users To Chat" hasArrow placeContent={"bottom-end"}>
              <Button variant={"ghost"} onClick={onOpen}>
                <Flex alignItems="center">
                  <i className="fas fa-search"></i>
                  <Text display={{ base: "none", md: "flex" }} px={4}>Search User</Text>
                </Flex>
              </Button>
            </Tooltip>
          )}
          <Link href='/' passHref legacyBehavior>
            <Navbar.Brand>Buddy App</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="navbarScroll" onClick={handleNavToggle} />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="p-2 ms-auto">
              <Link href='/' passHref legacyBehavior><Nav.Link onClick={handleNavLinks} active={router.pathname === '/'}>Dashboard</Nav.Link></Link>
              <Link href='/chats' passHref legacyBehavior><Nav.Link onClick={handleNavLinks} active={router.pathname === '/chats'}>Chats</Nav.Link></Link>
              <Link href='/events' passHref legacyBehavior><Nav.Link onClick={handleNavLinks} active={router.pathname === '/events'}>Events</Nav.Link></Link>
              <div>
                  <Menu>
                    <MenuButton padding={"1"}>
                        <BellIcon fontSize={"2xl"} m={1} color={notification.length > 0 ? 'red.500' : "black"} animation={animation}/>
                        {notification.length > 0 && (
                          <Badge 
                          colorScheme={"red"}
                          position={"absolute"}
                          top={"-1"}
                          right={"-1"}
                          borderRadius={"full"}
                          px={2}
                          py={1}
                          >
                            {notification.length}
                          </Badge>
                        )}
                    </MenuButton>
                    <MenuList pl={2}>
                      {!notification.length && "No New Messages"}
                      {notification.map((notif) => (
                       <MenuItem 
                        key={notif._id} 
                        onClick={() => {
                          setSelectedChat(notif.chat); //
                          setNotification(notification.filter((n) => n !== notif)); // Filter out the notification that is being viewed already
                          }}
                        >
                        {notif.chat.isGroupChat 
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${getSender(user, notif.chat.users)}`}
                       </MenuItem> 
                      ))}
                    </MenuList>
                  </Menu>
                  <Menu>
                  <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                    <Avatar
                      size="sm"
                      cursor="pointer"
                      name={user.username}
                      src={user.pic}
                    />
                  </MenuButton>
                  <MenuList>
                    <ProfileModal user={user}>
                      <MenuItem>My Profile</MenuItem>{" "}
                    </ProfileModal>      
                    <MenuDivider />
                    <MenuItem onClick={signOut}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* For Drawer */}
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
              <DrawerBody>
                  <Box display={"flex"} pb={2}>
                      <Input placeholder='Search by Full name or username' mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                      <Button onClick={handleSearch}>Go</Button>
                  </Box>
                  {loading ? (
                      <ChatLoading />
                  ) : (
                        searchResult.length > 0 ? (
                          searchResult.map((user) => (
                            user && user._id ? (
                              <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => accessChat(user._id)}
                              />
                            ) : null
                          ))
                        ) : (
                        <Box>No users found</Box>
                      )
                   )}
                  {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
              </DrawerBody>
          </DrawerContent>
      </Drawer>
    </>
  );
}
