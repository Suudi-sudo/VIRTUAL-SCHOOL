import React from 'react';

const ChatBubble = ({ sender, message, timestamp }) => {
  return (
    <div className="chat-bubble">
      <strong>{sender}</strong>
      <p>{message}</p>
      <small>{timestamp}</small>
    </div>
  );
};

export default ChatBubble;
