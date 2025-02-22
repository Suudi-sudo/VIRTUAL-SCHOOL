import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const useChat = () => useContext(ChatContext);

export default useChat;
