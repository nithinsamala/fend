import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


export default function ChatPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // States
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState('current');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Quick prompts
  const quickPrompts = [
    'Help me write an email',
    'Explain quantum computing',
    'Create a marketing plan',
    'Debug this code issue',
    'Generate creative ideas',
    'Summarize this article',
  ];
  
  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "Hello! I'm your AI assistant. I can help you with writing, analysis, problem-solving, and much more. What would you like to explore today?",
      sender: 'assistant',
      timestamp: getCurrentTime(),
    };
    setMessages([welcomeMessage]);
    
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Helper function to get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle sending messages
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: getCurrentTime(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      generateAIResponse(inputMessage);
    }, 1000);
  };
  
  // Generate AI response
const generateAIResponse = async (userInput) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/chat`,
      { message: userInput },
      { withCredentials: true }
    );

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      text: res.data.reply,
      sender: 'assistant',
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

  } catch (err) {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: "❌ AI failed to respond",
      sender: "assistant",
      timestamp: getCurrentTime()
    }]);
    setIsTyping(false);
  }
};

  
  // Handle quick prompt click
  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
 const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1️⃣ Show file message in UI (KEEP YOUR EXISTING LOGIC)
  const fileMessage = {
    id: Date.now().toString(),
    text: `📎 Attached file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    sender: 'user',
    timestamp: getCurrentTime(),
    isFile: true,
    fileName: file.name,
    fileSize: file.size,
  };

  setMessages(prev => [...prev, fileMessage]);
  setIsTyping(true);

  try {
    // 2️⃣ ACTUAL FILE UPLOAD TO BACKEND
    const formData = new FormData();
    formData.append("file", file); // ⚠️ MUST be "file"

    const res = await axios.post(
      `${API_URL}/api/uploads/upload`,

      formData,
      { withCredentials: true } // ⚠️ REQUIRED FOR COOKIE AUTH
    );

    // 3️⃣ Show success response
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        text: `✅ File "${file.name}" uploaded successfully. I can now analyze it.`,
        sender: 'assistant',
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);

  } catch (error) {
    console.error("Upload failed:", error);

    setTimeout(() => {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: "❌ File upload failed. Please try again.",
        sender: 'assistant',
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
    }, 1000);
  }
};

  
  // Handle voice recording
  const toggleVoiceRecording = () => {
    if (!voiceRecording) {
      setVoiceRecording(true);
      
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.start();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setVoiceRecording(false);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setVoiceRecording(false);
        };
        
        recognition.onend = () => {
          setVoiceRecording(false);
        };
      } else {
        // Fallback simulation
        setTimeout(() => {
          const transcribedText = "This is a simulated voice transcription. You can speak naturally and I'll convert it to text.";
          setInputMessage(transcribedText);
          setVoiceRecording(false);
        }, 3000);
      }
    } else {
      setVoiceRecording(false);
    }
  };
  
  // Handle new chat
  const handleNewChat = () => {
    // Save current conversation to history if it has messages (excluding welcome message)
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.sender === 'user');
      const chatTitle = firstUserMessage ? 
        (firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '')) : 
        'New Conversation';
      
      const newHistoryItem = {
        id: Date.now().toString(),
        title: chatTitle,
        time: 'Now',
        messages: [...messages],
      };
      
      setChatHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10 chats
    }
    
    // Clear current conversation
    setMessages([]);
    setActiveChat('current');
    
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now().toString(),
        text: "Hi there! I'm ready for a fresh conversation. What would you like to discuss today?",
        sender: 'assistant',
        timestamp: getCurrentTime(),
      };
      setMessages([welcomeMessage]);
    }, 500);
  };
  
  // Handle chat history item click
  const handleHistoryItemClick = (chatId) => {
    setActiveChat(chatId);
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle retry message
  const handleRetryMessage = (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const messageToRetry = messages[messageIndex];
    
    // If it's a user message, regenerate bot response
    if (messageToRetry.sender === 'user') {
      // Remove messages after this one
      const newMessages = messages.slice(0, messageIndex + 1);
      setMessages(newMessages);
      setIsTyping(true);
      
      setTimeout(() => {
        generateAIResponse(messageToRetry.text);
      }, 1000);
    }
    // If it's a bot message, regenerate it
    else if (messageToRetry.sender === 'assistant') {
      // Find the previous user message
      const previousUserMessage = messages.slice(0, messageIndex).reverse().find(m => m.sender === 'user');
      if (previousUserMessage) {
        // Remove messages including and after this bot message
        const newMessages = messages.slice(0, messageIndex);
        setMessages(newMessages);
        setIsTyping(true);
        
        setTimeout(() => {
          generateAIResponse(previousUserMessage.text);
        }, 1000);
      }
    }
  };
  
  // Handle edit message
  const handleEditMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditText(message.text);
    }
  };
  
  // Handle save edited message
  const handleSaveEdit = (messageId) => {
    if (!editText.trim()) return;
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      text: editText,
      timestamp: getCurrentTime(),
      edited: true,
    };
    
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setEditText('');
    
    // If editing a user message, regenerate bot response
    if (updatedMessages[messageIndex].sender === 'user') {
      // Remove messages after this one
      const finalMessages = updatedMessages.slice(0, messageIndex + 1);
      setMessages(finalMessages);
      setIsTyping(true);
      
      setTimeout(() => {
        generateAIResponse(editText);
      }, 1000);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };
  
  // Handle clear conversation
  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      handleNewChat();
    }
  };
  
  return (
    <div className="chat-page">
      {/* Chat Navigation */}
      <nav className="chat-nav">
        <div className="nav-container">
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo-icon">S</div>
            <div className="logo-text">
              <div className="logo-primary">SmartBot</div>
              <div className="logo-secondary">AI Assistant</div>
            </div>
          </div>
          
          <div className="chat-status">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>AI Assistant Online</span>
            </div>
          </div>
          
          <div className="chat-actions">
            <button 
              className="mobile-toggle" 
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? '✕' : '☰'}
            </button>
            <button className="icon-btn" title="Settings" onClick={() => navigate('/settings')}>
              ⚙️
            </button>
            <button className="user-btn" onClick={() => navigate('/profile')}>
              👤
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${showSidebar ? 'active' : ''}`}
        onClick={() => setShowSidebar(false)}
      ></div>
      
      {/* Main Chat Container */}
      <div className="chat-container">
        {/* Sidebar */}
        <div className={`chat-sidebar ${showSidebar ? 'active' : ''}`}>
          {/* Chat History */}
          <div className="chat-history">
            <div className="history-header">
              <h3 className="history-title">Chat History</h3>
            </div>
            
            <button className="new-chat-btn" onClick={handleNewChat}>
              <span>+</span>
              <span>New Chat</span>
            </button>
            
            <div className="history-list">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  className={`history-item ${activeChat === chat.id ? 'active' : ''}`}
                  onClick={() => handleHistoryItemClick(chat.id)}
                >
                  <div className="history-item-title">{chat.title}</div>
                  <div className="history-item-time">{chat.time}</div>
                </div>
              ))}
              
              {chatHistory.length === 0 && (
                <div className="empty-history">
                  <p>No previous chats</p>
                  <p className="empty-history-sub">Start a new conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-avatar">🤖</div>
              <div className="bot-details">
                <div className="bot-name">SmartBot Assistant</div>
                <div className="bot-status">
                  <span className="status-dot"></span>
                  <span>{isTyping ? 'Typing...' : 'Online'}</span>
                </div>
              </div>
            </div>
            
            <div className="chat-controls">
              <button 
                className="icon-btn" 
                title="Clear conversation"
                onClick={handleClearConversation}
              >
                🗑️
              </button>
            </div>
          </div>
          
          {/* Messages Container */}
          <div className="messages-container">
            {/* Welcome message when no conversation */}
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">🤖</div>
                <h2 className="welcome-title">How can I help you today?</h2>
                <p className="welcome-subtitle">
                  I'm your AI assistant. I can help with writing, analysis, problem-solving, 
                  and much more. Ask me anything or try one of these prompts:
                </p>
                <div className="quick-prompts">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="prompt-btn"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {editingMessageId === message.id && message.sender === 'user' ? (
                    <>
                      <textarea
                        className="edit-message-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        rows="3"
                      />
                      <div className="edit-actions">
                        <button 
                          className="edit-cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                        <button 
                          className="edit-save-btn"
                          onClick={() => handleSaveEdit(message.id)}
                        >
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="message-bubble">
                        <div className="message-text">{message.text}</div>
                        {message.edited && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            (edited)
                          </div>
                        )}
                        {message.isFile && (
                          <div className="file-info">
                            <span>📎 {message.fileName}</span>
                          </div>
                        )}
                      </div>
                      <div className="message-time">{message.timestamp}</div>
                      
                      {/* Message Actions */}
                      <div className="message-actions">
                        {message.sender === 'user' && (
                          <>
                            <button 
                              className="message-action"
                              onClick={() => handleEditMessage(message.id)}
                              title="Edit message"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                            <button 
                              className="message-action"
                              onClick={() => handleRetryMessage(message.id)}
                              title="Regenerate response"
                            >
                              <span>🔄</span>
                              <span>Retry</span>
                            </button>
                          </>
                        )}
                        {message.sender === 'assistant' && (
                          <button 
                            className="message-action"
                            onClick={() => handleRetryMessage(message.id)}
                            title="Regenerate response"
                          >
                            <span>🔄</span>
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <div className="message-input-wrapper">
                <textarea
                  className="message-input"
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows="1"
                />
                <div className="input-actions">
                  <button 
                    className="action-icon"
                    onClick={handleFileUpload}
                    title="Attach file"
                  >
                    📎
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <button 
                    className={`action-icon ${voiceRecording ? 'active' : ''}`}
                    onClick={toggleVoiceRecording}
                    title="Voice input"
                  >
                    {voiceRecording ? (
                      <div className="recording-indicator">
                        <span className="recording-dot"></span>
                      </div>
                    ) : '🎤'}
                  </button>
                </div>
              </div>
              
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                title="Send message"
              >
                {isTyping ? <div className="loading"></div> : '➤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}