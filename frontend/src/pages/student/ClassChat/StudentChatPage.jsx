import React, { useEffect, useState } from 'react';
// import { useSocket } from '../../hooks/useSocket'; // Assuming you have a custom hook for socket

const StudentChat = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const socket = useSocket(); // Use your socket hook

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setChatMessages(prev => [...prev, data]);
    });
    return () => socket.off('chatMessage');
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if(message.trim()){
      socket.emit('chatMessage', { sender: 'Student', text: message, timestamp: new Date().toLocaleTimeString() });
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h2>Student Chat</h2>
      <div className="chat-window">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender === 'Teacher' ? 'teacher' : 'student'}`}>
            <strong>{msg.sender}</strong>: {msg.text} <small>{msg.timestamp}</small>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default StudentChat;