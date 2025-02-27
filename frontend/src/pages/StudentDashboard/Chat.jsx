import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:5000");

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
    setMessages([]); 
    socket.emit("join_chat", { sender: "student", receiver: user.email });
  };

  // Handle sending messages
  const sendMessage = () => {
    if (!messageInput || !selectedUser) return;
    const messageData = {
      sender: "student",
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
    <div className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-light">
      <div className="card bg-secondary text-light w-75 shadow-lg">
        <div className="card-header text-center">
          <h4 className="mb-0">Messages</h4>
        </div>
        <div className="card-body d-flex">
          {/* Sidebar: User Search */}
          <div className="col-md-4 border-end p-3">
            <input
              type="text"
              className="form-control bg-dark text-light border-0"
              placeholder="Search users by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <button className="btn btn-primary w-100 mt-2" onClick={handleSearch}>
              Search
            </button>
            <div className="list-group mt-3">
              {users.map((user) => (
                <button key={user.email} className="list-group-item list-group-item-action bg-dark text-light border-light" onClick={() => openChat(user)}>
                  {user.name} ({user.email})
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-md-8 p-3">
            {selectedUser ? (
              <>
                <div className="chat-box border rounded p-3 bg-dark" style={{ height: "400px", overflowY: "auto" }}>
                  {messages.map((msg, index) => (
                    <div key={index} className={`d-flex ${msg.sender === "student" ? "justify-content-end" : "justify-content-start"}`}>
                      <span className={`badge ${msg.sender === "student" ? "bg-success" : "bg-secondary"} p-2 m-1`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="input-group mt-3">
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-0"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button className="btn btn-success" onClick={sendMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
        {users.length === 0 && <div className="alert alert-danger text-center m-3">Failed to search users</div>}
      </div>
    </div>
  );
};

export default Chat;
