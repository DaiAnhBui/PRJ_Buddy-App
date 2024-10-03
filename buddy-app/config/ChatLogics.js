// config/ChatLogics.js

// To get the sender's info
export const getSender = (loggedUser, users) => {
  if (!loggedUser || !users || !Array.isArray(users)) return "No sender found";

  // Ensure that user objects in the array have `cognitoUsername` or `sub`
  const sender = users.find(user => 
    user.cognitoUsername !== loggedUser.username
  );

  return sender ? sender.name : "Unknown sender";
};

// To check is the its the same sender
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 && ( // Check if the array does not exceed the array length 
      messages[i + 1].sender._id !== m.sender._id || // If the message is not the message sent by the same sender
      messages[i + 1].sender._id === undefined // Check if the message is not undefined
    ) && messages[i].sender.userId !== userId // Check if the message id is not the current user
  );
};

// To check if the message is the last message
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

/**
 * Determines the margin for a message based on its position in the message list and its sender.
 *
 * @param {Array} messages - The array of messages.
 * @param {Object} m - The current message object being evaluated.
 * @param {number} i - The index of the current message in the messages array.
 * @param {string} userId - The ID of the current user.
 * @returns {number|string} The margin value to be applied to the message (in pixels or "auto").
 */
export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

// To check if the user is same
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
