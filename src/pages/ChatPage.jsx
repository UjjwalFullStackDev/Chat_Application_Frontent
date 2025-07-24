import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import UserList from '../components/Chat/UserList';
import ChatWindow from '../components/Chat/ChatWindow';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <UserList
          users={users}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          currentUser={currentUser}
        />
        <ChatWindow selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default ChatPage;