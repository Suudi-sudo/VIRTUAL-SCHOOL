import { useState, useEffect } from "react";
import axios from "axios"; // Assuming you're using Flask as backend
import io from "socket.io-client"; // For real-time messaging
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:5000"); // Connect to backend WebSocket server

const Chat = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  // Fetch users by email search
  const handleSearch = async () => {
    if (!searchEmail) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/search-users?email=${searchEmail}`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Select user to chat with
  const openChat = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when switching users
    socket.emit("join_chat", { sender: "student", receiver: user.email }); // Join room
  };

  // Handle sending messages
  const sendMessage = () => {
    if (!messageInput || !selectedUser) return;
    const messageData = {
      sender: "student", // Fetch from authentication
      receiver: selectedUser.email,
      message: messageInput,
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessageInput("");
  };

  // Receive messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  return (
    <div className="container mt-4">
      <h2>Chat</h2>

      {/* Search for Users */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleSearch}>Search</button>
      </div>

      {/* Display Search Results */}
      {users.length > 0 && (
        <div className="list-group">
          {users.map((user) => (
            <button key={user.email} className="list-group-item list-group-item-action" onClick={() => openChat(user)}>
              {user.name} ({user.email})
            </button>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {selectedUser && (
        <div className="chat-window border mt-3 p-3">
          <h5>Chat with {selectedUser.name}</h5>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "student" ? "text-end" : "text-start"}`}>
                <span className="badge bg-secondary">{msg.message}</span>
              </div>
            ))}
          </div>

          <div className="input-group mt-3">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button className="btn btn-success" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
