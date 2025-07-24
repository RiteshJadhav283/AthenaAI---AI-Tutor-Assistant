import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEllipsisVertical, faTimes,
  faSearch, faPaperPlane, faComments, faImage
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import styles from './ChatSection.module.css';

const ChatSection = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState([
    {
      id: 1,
      title: 'Understanding Quantum Mechanics Basics',
      date: 'Today',
      preview: 'I\'m having trouble understanding the Heisenberg Uncertainty Principle...',
      subject: 'Physics',
      messages: [
        {
          sender: 'AI',
          content: 'Hello! Here\'s an explanation:\n\n```math\nΔx * Δp ≥ ħ/2\n```\n\nWhere:\n- `Δx` is position uncertainty\n- `Δp` is momentum uncertainty\n- `ħ` is reduced Planck constant',
          time: '10:30 AM'
        }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const selectChat = (chatId) => {
    setActiveChat(chatId);
    setSidebarCollapsed(true);
  };

  const extractImagePrompt = (content) => {
    const imagePromptRegex = /```imagePrompt\s*([\s\S]*?)\s*```/;
    const match = content.match(imagePromptRegex);
    return match ? match[1] : null;
  };

  const processAIResponse = async (content) => {
    const imagePrompt = extractImagePrompt(content);
    let imageUrl = null;

    if (imagePrompt) {
      try {
        const response = await fetch(`http://localhost:3549/api/image/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        if (!response.ok) throw new Error('Image generation failed');

        const data = await response.json();
        imageUrl = data.imageUrl;
        content = content.replace(/```imagePrompt\n[\s\S]*?\n```/, '');
      } catch (error) {
        console.error('Image generation error:', error);
      }
    }

    return { content, imageUrl };
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const newMessage = {
      sender: 'You',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = chats.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, newMessage], preview: message.slice(0, 50), date: 'Today' }
        : chat
    );

    setChats(updatedChats);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3549/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message })
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const data = await response.json();
      const aiRawResponse = data.answer || data.response || data.message || JSON.stringify(data);
      const { content, imageUrl } = await processAIResponse(aiRawResponse);

      const aiMessage = {
        sender: 'AI',
        content,
        imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedChatsWithAI = updatedChats.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      );

      setChats(updatedChatsWithAI);
    } catch (error) {
      console.error('❌ Frontend fetch error:', error);

      const errorMessage = {
        sender: 'AI',
        content: "❌ Error occurred while fetching response.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedChatsWithError = updatedChats.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      );

      setChats(updatedChatsWithError);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    const newChatId = Math.max(...chats.map(c => c.id), 0) + 1;
    const newChat = {
      id: newChatId,
      title: `New Chat ${newChatId}`,
      date: 'Today',
      preview: 'Start a new conversation...',
      subject: 'General',
      messages: [
        {
          sender: 'AI',
          content: 'Hello! I\'m your AI tutor. Ask me anything you\'re curious about!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChatId);
  };

  const filteredChats = chats.filter(chat => {
    const s = searchTerm.toLowerCase();
    return chat.title.toLowerCase().includes(s) ||
           chat.preview.toLowerCase().includes(s) ||
           chat.subject.toLowerCase().includes(s);
  });

  const currentChat = chats.find(chat => chat.id === activeChat);

  const renderMessageContent = (content) => (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => <p className={styles.messageParagraph} {...props} />,
        code: ({ node, inline, ...props }) => (
          <code className={inline ? styles.inlineCode : styles.codeBlock} {...props} />
        ),
        pre: ({ node, ...props }) => <pre className={styles.preBlock} {...props} />,
        ul: ({ node, ...props }) => <ul className={styles.list} {...props} />,
        ol: ({ node, ...props }) => <ol className={styles.list} {...props} />,
        li: ({ node, ...props }) => <li className={styles.listItem} {...props} />,
        a: ({ node, ...props }) => (
          <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props}>
            {props.children || '🔗 Link'}
          </a>
        ),
        blockquote: ({ node, ...props }) => <blockquote className={styles.blockquote} {...props} />,
        table: ({ node, ...props }) => (
          <div className={styles.tableWrapper}>
            <table className={styles.table} {...props} />
          </div>
        ),
        th: ({ node, ...props }) => <th className={styles.tableHeader} {...props} />,
        td: ({ node, ...props }) => <td className={styles.tableCell} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          <h1 className={styles.title}>Doubts</h1>
        </div>
        <div className={styles.searchContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search your doubts..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Your Doubts</h2>
            <button className={styles.closeButton} onClick={() => setSidebarCollapsed(true)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className={styles.chatList}>
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`${styles.chatItem} ${activeChat === chat.id ? styles.activeChat : ''}`}
                onClick={() => selectChat(chat.id)}
              >
                <div className={styles.chatHeader}>
                  <div className={styles.chatTitle}>{chat.title}</div>
                  <div className={styles.chatDate}>{chat.date}</div>
                </div>
                <div className={styles.chatPreview}>{chat.preview}</div>
                <div className={styles.chatSubject}>{chat.subject}</div>
              </div>
            ))}
          </div>
          <button className={styles.newChatButton} onClick={startNewChat}>
            <FontAwesomeIcon icon={faPlus} />
            <span>New Doubt</span>
          </button>
        </div>

        <div className={styles.chatArea}>
          {!activeChat ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faComments} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No Doubt Selected</h3>
              <p className={styles.emptyText}>Select a doubt from the sidebar or start a new conversation.</p>
              <button className={styles.emptyButton} onClick={startNewChat}>
                <FontAwesomeIcon icon={faPlus} />
                <span>New Doubt</span>
              </button>
            </div>
          ) : (
            <>
              <div className={styles.messagesContainer}>
                {currentChat?.messages.map((msg, index) => (
                  <React.Fragment key={index}>
                    <div className={`${styles.message} ${msg.sender === 'You' ? styles.userMessage : styles.aiMessage}`}>
                      <div className={styles.messageHeader}>
                        <div className={styles.avatar}>{msg.sender === 'You' ? 'U' : 'AI'}</div>
                        <div className={styles.senderName}>{msg.sender === 'You' ? 'You' : 'AI Tutor'}</div>
                        <div className={styles.messageTime}>{msg.time}</div>
                      </div>
                      <div className={styles.messageContent}>
                        {msg.sender === 'AI'
                          ? renderMessageContent(msg.content)
                          : msg.content.split('\n').map((p, i) => (
                              <p key={i} className={styles.messageParagraph}>{p}</p>
                            ))}
                      </div>
                    </div>

                    {msg.sender === 'AI' && msg.imageUrl && (
                      <div className={styles.imageContainer}>
                        <div className={styles.imageHeader}>
                          <FontAwesomeIcon icon={faImage} className={styles.imageIcon} />
                          <span>Generated Diagram</span>
                        </div>
                        <img
                          src={msg.imageUrl}
                          alt="Generated diagram"
                          className={styles.generatedImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {isTyping && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot} style={{ animationDelay: '0.2s' }}></div>
                    <div className={styles.typingDot} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.messageInputContainer}>
                <textarea
                  className={styles.messageInput}
                  placeholder="Type your doubt here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;