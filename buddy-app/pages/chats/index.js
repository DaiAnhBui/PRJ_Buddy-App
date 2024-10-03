// pages/chats/index.js

// Install the necessary modules and components
import React, { useState, useEffect, useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";

import MyChats from "@/components/MyChats";
import ChatBox from "@/components/ChatBox";

const Chats = ({ user }) => {
  const [ fetchAgain, setFetchAgain ] = useState(false);

  return <div style={{ width: "100%" }}>
    <Box display={"flex"} justifyContent={"space-between"} width={"100%"} height={"91.5vh"} padding={"10px"}>
      <MyChats fetchAgain={fetchAgain} user={user}/>
      <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} user={user}/>
    </Box>
  </div>
};

export default Chats;
