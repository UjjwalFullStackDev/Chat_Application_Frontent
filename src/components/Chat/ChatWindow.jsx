import React, { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import MessageInput from './MessageInput';

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getMessages(selectedUser._id);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedUser]);

  useEffect(() => {
    // Socket event listeners
    const handleNewMessage = (message) => {
      if (
        (message.sender._id === selectedUser?._id && message.receiver._id === currentUser?.id) ||
        (message.sender._id === currentUser?.id && message.receiver._id === selectedUser?._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageSent = (message) => {
      if (message.receiver._id === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = ({ senderId, senderName }) => {
      if (senderId === selectedUser?._id) {
        setTypingUsers((prev) => new Set([...prev, senderId]));
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(senderId);
        return newSet;
      });
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageSent(handleMessageSent);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedUser, currentUser]);

  const handleSendMessage = (content) => {
    if (selectedUser && content.trim()) {
      socketService.sendMessage(selectedUser._id, content);
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socketService.startTyping(selectedUser._id);
    }
  };

  const handleStopTyping = () => {
    if (selectedUser) {
      socketService.stopTyping(selectedUser._id);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      const messageDate = format(new Date(message.timestamp), 'yyyy-MM-dd');
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Chat App</h3>
          <p className="text-gray-500">Select a user from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-gray-300 flex items-center">
        <div className="relative">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></div>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
          <p className="text-sm text-gray-500">
            {selectedUser.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {groupMessagesByDate(messages).map((group) => (
              <div key={group.date}>
                {/* Date Header */}
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {group.messages.map((message) => {
                  const isOwnMessage = message.sender._id === currentUser?.id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !loading && (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!selectedUser}
      />
    </div>
  );
};

export default ChatWindow;