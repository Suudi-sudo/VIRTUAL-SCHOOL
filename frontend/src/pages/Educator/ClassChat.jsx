import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";

const ClassChat = () => {
  const { classId } = useParams(); // Get class ID from URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chats/${classId}`);
        setMessages(response.data.chats);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [classId]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post("/api/chats", {
        class_id: classId,
        message: newMessage,
      });
      setMessages((prev) => [...prev, response.data.chat]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4 px-6 text-xl font-bold shadow-md">
        Class Chatroom
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg shadow mb-2 max-w-xs ${
                msg.sender_id === 1
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white p-4 border-t flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg p-3 outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-3 bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ClassChat;
