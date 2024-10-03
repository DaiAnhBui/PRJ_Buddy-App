// components/users/UserListItem.js

import { Box, Avatar, Text } from "@chakra-ui/react"

export default function UserListItem({ user, handleFunction }) {
  const attributes = Array.isArray(user.Attributes) ? user.Attributes : [];

  const name = user.name || 'No Name';
  const email = user.email || 'No Email';

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={name}
        src={user.pic} // Ensure `user.pic` is defined or use a default image
      />
      <Box>
        <Text>{name}</Text>
        <Text fontSize="xs">
          <b>Email: </b>
          {email}
        </Text>
      </Box>
    </Box>
  )
};
