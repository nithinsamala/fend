// ChatPage.jsx (React + Vite)
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

  // Big prompt template (you can edit it)
  const bigPromptTemplate = `Please analyze the provided document content and produce a structured Markdown response:
- Title
- Summary (2-3 bullets)
- Key Points (bullet list)
- If relevant: Step-by-step / Procedure
- Action Items (clear steps)
- One-line TL;DR
Strictly use only the provided document text. If not present, reply: "Answer not found in the provided document."`;

  // Quick prompts
  const quickPrompts = [
    'Help me write an email',
    'Explain quantum computing',
    'Create a marketing plan',
    'Debug this code issue',
    'Generate creative ideas',
    'Summarize this article',
  ];

  // welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "Hello! I'm your AI assistant. I can help you with writing, analysis, problem-solving, and much more. What would you like to explore today?",
      sender: 'assistant',
      timestamp: getCurrentTime(),
    };
    const saved = localStorage.getItem('chatHistory');
    setMessages([welcomeMessage]);
    if (saved) setChatHistory(JSON.parse(saved));
  }, []);

  // Save chatHistory to localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Scroll on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send message (normal)
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = { id: Date.now().toString(), text: inputMessage, sender: 'user', timestamp: getCurrentTime() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    await generateAIResponse(inputMessage, false);
  };

  // Generate AI response (structured flag toggles server prompt)
  const generateAIResponse = async (userInput, structured = false) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { message: userInput, structured },
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
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "❌ AI failed to respond",
        sender: "assistant",
        timestamp: getCurrentTime()
      }]);
      setIsTyping(false);
    }
  };

  // Generate structured output (button)
  const handleGenerateStructured = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = { id: Date.now().toString(), text: inputMessage, sender: 'user', timestamp: getCurrentTime() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    await generateAIResponse(userMessage.text, true);
  };

  // Insert big prompt template into input
  const useBigPrompt = () => {
    setInputMessage(bigPromptTemplate);
  };

  // File upload
  const handleFileUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileMessage = {
      id: Date.now().toString(),
      text: `📎 Attached file: ${file.name}`,
      sender: 'user',
      timestamp: getCurrentTime(),
      isFile: true,
      fileName: file.name
    };
    setMessages(prev => [...prev, fileMessage]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `${API_URL}/api/uploads`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      // success message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `✅ File "${file.name}" uploaded successfully. You can now ask questions about it.`,
        sender: 'assistant',
        timestamp: getCurrentTime()
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "❌ File upload failed. Please try again.",
        sender: 'assistant',
        timestamp: getCurrentTime()
      }]);
      setIsTyping(false);
    }
  };

  // Voice (transcription) — small fallback
  const toggleVoiceRecording = () => {
    if (!voiceRecording) {
      setVoiceRecording(true);
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
        recognition.onerror = () => setVoiceRecording(false);
        recognition.onend = () => setVoiceRecording(false);
      } else {
        // fallback simulated transcript
        setTimeout(() => {
          setInputMessage("This is a simulated voice transcription.");
          setVoiceRecording(false);
        }, 1200);
      }
    } else {
      setVoiceRecording(false);
    }
  };

  // New chat (save old chat to history)
  const handleNewChat = () => {
    if (messages.length > 1) {
      const firstUser = messages.find(m => m.sender === 'user');
      const title = firstUser ? (firstUser.text.substring(0, 30) + (firstUser.text.length > 30 ? '...' : '')) : 'Conversation';
      const newHistory = {
        id: Date.now().toString(),
        title,
        time: new Date().toLocaleString(),
        messages: [...messages]
      };
      setChatHistory(prev => [newHistory, ...prev].slice(0, 20));
    }
    setMessages([{
      id: Date.now().toString(),
      text: "Hi there! I'm ready for a fresh conversation. What would you like to discuss today?",
      sender: 'assistant',
      timestamp: getCurrentTime()
    }]);
    setActiveChat('current');
  };

  // Click history item
  const handleHistoryItemClick = (chatId) => {
    setActiveChat(chatId);
    const sel = chatHistory.find(c => c.id === chatId);
    if (sel) setMessages(sel.messages);
    if (window.innerWidth <= 768) setShowSidebar(false);
  };

  // Delete a history item
  const deleteHistoryItem = (chatId) => {
    if (!window.confirm('Delete this saved conversation?')) return;
    setChatHistory(prev => prev.filter(h => h.id !== chatId));
    if (activeChat === chatId) handleNewChat();
  };

  // Clear all history
  const clearAllHistory = () => {
    if (!window.confirm('Clear all saved conversations?')) return;
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    handleNewChat();
  };

  // Retry message (same as earlier)
  const handleRetryMessage = (messageId) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;
    const msg = messages[index];
    if (msg.sender === 'user') {
      const newMsgs = messages.slice(0, index + 1);
      setMessages(newMsgs);
      setIsTyping(true);
      setTimeout(() => generateAIResponse(msg.text, false), 500);
    } else {
      // assistant: find previous user msg
      const prevUser = messages.slice(0, index).reverse().find(m => m.sender === 'user');
      if (prevUser) {
        const newMsgs = messages.slice(0, index);
        setMessages(newMsgs);
        setIsTyping(true);
        setTimeout(() => generateAIResponse(prevUser.text, false), 500);
      }
    }
  };

  // Edit message
  const handleEditMessage = (messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && msg.sender === 'user') {
      setEditingMessageId(messageId);
      setEditText(msg.text);
    }
  };

  const handleSaveEdit = (messageId) => {
    if (!editText.trim()) return;
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;
    const updated = [...messages];
    updated[idx] = { ...updated[idx], text: editText, edited: true, timestamp: getCurrentTime() };
    setMessages(updated);
    setEditingMessageId(null);
    setEditText('');
    // regenerate assistant response
    setIsTyping(true);
    setTimeout(() => generateAIResponse(updated[idx].text, false), 500);
  };

  const handleCancelEdit = () => { setEditingMessageId(null); setEditText(''); };

  // Clear conversation (alias new chat)
  const handleClearConversation = () => {
    if (!window.confirm('Clear current conversation?')) return;
    handleNewChat();
  };

  // Text-to-speech: read assistant message
  const readAloud = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser doesn't support text-to-speech.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  // Key press (enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
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
            <button className="mobile-toggle" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? '✕' : '☰'}
            </button>
            <button className="icon-btn" title="New chat" onClick={handleNewChat}>＋</button>
            <button className="icon-btn" title="Clear saved history" onClick={clearAllHistory}>🗑️</button>
            <button className="user-btn" onClick={() => navigate('/profile')}>👤</button>
          </div>
        </div>
      </nav>

      <div className={`mobile-overlay ${showSidebar ? 'active' : ''}`} onClick={() => setShowSidebar(false)} />

      <div className="chat-container">
        <div className={`chat-sidebar ${showSidebar ? 'active' : ''}`}>
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
                <div key={chat.id} className={`history-item ${activeChat === chat.id ? 'active' : ''}`}>
                  <div onClick={() => handleHistoryItemClick(chat.id)}>
                    <div className="history-item-title">{chat.title}</div>
                    <div className="history-item-time">{chat.time}</div>
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                    <button className="message-action" onClick={() => handleHistoryItemClick(chat.id)}>Open</button>
                    <button className="message-action" onClick={() => deleteHistoryItem(chat.id)}>Delete</button>
                  </div>
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

        <div className="chat-main">
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
              <button className="icon-btn" title="Clear conversation" onClick={handleClearConversation}>🗑️</button>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">🤖</div>
                <h2 className="welcome-title">How can I help you today?</h2>
                <p className="welcome-subtitle">
                  Ask anything or try a prompt:
                </p>
                <div className="quick-prompts">
                  {quickPrompts.map((p, i) => (
                    <button className="prompt-btn" key={i} onClick={() => setInputMessage(p)}>{p}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">{message.sender === 'user' ? '👤' : '🤖'}</div>
                <div className="message-content">
                  {editingMessageId === message.id && message.sender === 'user' ? (
                    <>
                      <textarea className="edit-message-input" value={editText} onChange={(e) => setEditText(e.target.value)} rows="3" />
                      <div className="edit-actions">
                        <button className="edit-cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                        <button className="edit-save-btn" onClick={() => handleSaveEdit(message.id)}>Save</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="message-bubble">
                        <div className="message-text" dangerouslySetInnerHTML={{ __html: linkifyAndMarkdownToHtml(message.text) }} />
                        {message.edited && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>(edited)</div>}
                        {message.isFile && <div className="file-info"><span>📎 {message.fileName}</span></div>}
                      </div>

                      <div className="message-time">{message.timestamp}</div>

                      <div className="message-actions">
                        {message.sender === 'user' && (
                          <>
                            <button className="message-action" onClick={() => handleEditMessage(message.id)}>✏️ Edit</button>
                            <button className="message-action" onClick={() => handleRetryMessage(message.id)}>🔄 Retry</button>
                            <button className="message-action" onClick={() => { setInputMessage(message.text); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>↺ Use</button>
                          </>
                        )}
                        {message.sender === 'assistant' && (
                          <>
                            <button className="message-action" onClick={() => handleRetryMessage(message.id)}>🔄 Retry</button>
                            <button className="message-action" onClick={() => readAloud(stripHtml(message.text))}>🔊 Read</button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

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

          <div className="input-area">
            <div className="input-container">
              <div className="message-input-wrapper">
                <textarea
                  className="message-input"
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for newline)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows="1"
                />
                <div className="input-actions">
                  <button className="action-icon" onClick={handleFileUpload} title="Attach file">📎</button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                  <button className={`action-icon ${voiceRecording ? 'active' : ''}`} onClick={toggleVoiceRecording} title="Voice input">
                    {voiceRecording ? <div className="recording-indicator"><span className="recording-dot" /></div> : '🎤'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="send-button" onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} title="Send">➤</button>
                <button className="icon-btn" title="Format & generate structured output" onClick={handleGenerateStructured}>📑</button>
                <button className="icon-btn" title="Use Big Prompt" onClick={useBigPrompt}>📝</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Small helpers
   - linkifyAndMarkdownToHtml: naive markdown -> html for simple bold/italics + newlines & links
   - stripHtml: remove HTML for speechSynthesis
------------------------- */
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function linkifyAndMarkdownToHtml(text = "") {
  if (!text) return "";
  // basic escape
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
  let out = escapeHtml(text);
  // convert simple markdown-style headers, bold, bullets, newlines
  out = out.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  out = out.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  out = out.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  out = out.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  out = out.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  out = out.replace(/^\s*-\s+(.*)/gim, '<li>$1</li>');
  out = out.replace(/\n/g, '<br/>');
  // wrap stray <li> in ul
  if (out.includes('<li>')) out = out.replace(/(?:<br\/>)*((?:<li>.*<\/li>)+)(?:<br\/>)*/g, '<ul>$1</ul>');
  // linkify URLs
  out = out.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return out;
}
