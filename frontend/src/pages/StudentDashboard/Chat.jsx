import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';
import 'bootstrap/dist/css/bootstrap.min.css';

// Adjust to match your Flask server's address
const BASE_URL = 'https://virtual-school-2.onrender.com';

function Chat({ classId = 1 }) {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  // Fetch chats from the server
  const fetchChats = async (page = 1) => {
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/chats/${classId}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Error fetching chats');
      }
      const data = await response.json();
      setChats(data.chats);
      setTotalPages(data.pages);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError("Couldn't load messages");
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [classId]);

  // Refresh the current page of chats
  const refreshChats = () => {
    fetchChats(currentPage);
  };

  // Delete a chat message
  const handleDelete = async (chatId) => {
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/chats/message/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Error deleting chat');
      }
      refreshChats();
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError("Couldn't delete message");
    }
  };

  // Edit a chat message
  const handleEdit = async (chatId) => {
    setError('');
    const newMessage = prompt('Edit your message:');
    if (!newMessage) return;
    try {
      const response = await fetch(`${BASE_URL}/chats/message/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      if (!response.ok) {
        throw new Error('Error editing chat');
      }
      refreshChats();
    } catch (err) {
      console.error('Error editing chat:', err);
      setError("Couldn't edit message");
    }
  };

  // Send a new chat message
  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ class_id: classId, message })
      });
      if (!response.ok) {
        throw new Error('Error sending chat');
      }
      setMessage('');
      refreshChats();
    } catch (err) {
      console.error('Error sending chat:', err);
      setError("Couldn't send message");
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', width: '100%', backgroundColor: '#001f3f', padding: 0 }}
    >
      <div className="card shadow" style={{ width: '600px', maxWidth: '100%', height: '80vh' }}>
        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger rounded-0 mb-0" role="alert">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="card-body d-flex flex-column p-0" style={{ height: '100%' }}>
          {/* Messages List (Scrollable) */}
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#fff' }}>
            {chats.length === 0 ? (
              <div className="text-muted text-center mt-3">
                No messages yet...
              </div>
            ) : (
              chats.map((chat) => (
                <div key={chat.id} className="mb-3">
                  <div className="d-flex justify-content-between">
                    {/* Using a fallback for sender_name */}
                    <strong>{chat.sender_name || 'Anonymous'}</strong>
                    <small className="text-muted">
                      {new Date(chat.timestamp).toLocaleString()}
                    </small>
                  </div>
                  <div>{chat.message}</div>
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(chat.id)}
                    >
                      <MdEdit className="me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(chat.id)}
                    >
                      <MdDelete className="me-1" />
                      Delete
                    </button>
                  </div>
                  <hr />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center mb-0">
              {Array.from({ length: totalPages }).map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => fetchChats(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Input Bar */}
          <div className="p-3 border-top">
            <form onSubmit={handleSend} className="d-flex">
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary ms-2">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
