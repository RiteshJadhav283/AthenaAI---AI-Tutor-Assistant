import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Send, Mic, Image, Upload, Copy, Search, User, Bot, 
  Clock, MessageSquare, Plus, X, Trash2, Loader2 
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { DoubtsService } from '@/lib/doubtsService';
import { useAuth } from '@/context/AuthContext';
import './MarkdownTable.css';

const SUBJECTS = [
  'Physics', 'Chemistry', 'Math', 'Biology', 
  'Engineering', 'History', 'Geography'
];

export default function Doubts() {
  // State management
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-doubts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'doubts_messages'
      }, (payload) => {
        if (payload.new.doubt_id === activeChat) {
          loadDoubt(activeChat);
        }
        fetchDoubtsHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChat]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchDoubtsHistory();
    } else {
      createDefaultChat();
      setIsLoading(false);
    }
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Data fetching functions
  const fetchDoubtsHistory = async () => {
    setIsLoading(true);
    try {
      const doubtsHistory = await DoubtsService.getDoubtsHistory();
      
      if (doubtsHistory.length > 0) {
        const formattedHistory = doubtsHistory.map(doubt => ({
          id: doubt.id,
          title: doubt.title,
          subject: doubt.subject,
          time: formatTimeAgo(new Date(doubt.updated_at)),
          preview: doubt.preview || "No preview available",
          heading: doubt.title
        }));
        
        setChatHistory(formattedHistory);
        loadDoubt(formattedHistory[0].id);
      } else {
        createDefaultChat();
      }
    } catch (error) {
      console.error('Error fetching doubts history:', error);
      createDefaultChat();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoubt = async (doubtId) => {
    setIsLoading(true);
    try {
      const doubt = await DoubtsService.getDoubtWithMessages(doubtId);
      
      if (doubt) {
        const formattedMessages = doubt.messages.map(msg => ({
          id: msg.id,
          type: msg.message_type,
          message: msg.message_content,
          imageUrl: msg.image_url,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        const chatObj = {
          id: doubt.id,
          title: doubt.title,
          subject: doubt.subject,
          messages: formattedMessages
        };
        
        setChats(prevChats => {
          const existingChatIndex = prevChats.findIndex(c => c.id === doubt.id);
          return existingChatIndex >= 0 
            ? prevChats.map(c => c.id === doubt.id ? chatObj : c)
            : [...prevChats, chatObj];
        });
        
        setActiveChat(doubt.id);
      }
    } catch (error) {
      console.error('Error loading doubt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat creation functions
  const createDefaultChat = useCallback(() => {
    if (chats.some(chat => chat.id === 'default')) return;

    const defaultChat = {
      id: 'default',
      title: "Physics - Introduction",
      subject: "Physics",
      messages: [{
        id: 'welcome',
        type: "ai",
        message: "Hello! I'm your AI tutor. What would you like to learn about today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    };
    
    setChats([defaultChat]);
    setActiveChat('default');
    setChatHistory([{
      id: 'default',
      title: "Physics - Introduction",
      subject: "Physics",
      time: "Just now",
      preview: "Start a new conversation...",
      heading: "Physics - Introduction"
    }]);
  }, [chats]);

  const createNewChat = async () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatTitle = `${selectedSubject} Chat`;
    const welcomeMessage = `Hello! I'm your AI tutor for ${selectedSubject}. What would you like to learn about today?`;
    
    if (user) {
      try {
        const newDoubt = await DoubtsService.createDoubt({
          user_id: user.id,
          title: chatTitle,
          subject: selectedSubject,
          preview: "Start a new conversation..."
        });
        
        if (newDoubt) {
          await DoubtsService.addMessage({
            doubt_id: newDoubt.id,
            message_type: 'ai',
            message_content: welcomeMessage
          });
          
          const newChat = {
            id: newDoubt.id,
            title: chatTitle,
            subject: selectedSubject,
            messages: [{
              id: Date.now(),
              type: "ai",
              message: welcomeMessage,
              time: currentTime
            }]
          };
          
          const newHistoryItem = {
            id: newDoubt.id,
            title: chatTitle,
            subject: selectedSubject,
            time: "Just now",
            preview: "Start a new conversation...",
            heading: chatTitle
          };
          
          setChats(prev => [...prev, newChat]);
          setChatHistory(prev => [newHistoryItem, ...prev]);
          setActiveChat(newDoubt.id);
        }
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    } else {
      const newChatId = `local-${Date.now()}`;
      const newChat = {
        id: newChatId,
        title: chatTitle,
        subject: selectedSubject,
        messages: [{
          id: Date.now(),
          type: "ai",
          message: welcomeMessage,
          time: currentTime
        }]
      };
      
      setChats(prev => [...prev, newChat]);
      setChatHistory(prev => [{
        id: newChatId,
        title: chatTitle,
        subject: selectedSubject,
        time: "Just now",
        preview: "Start a new conversation...",
        heading: chatTitle
      }, ...prev]);
      setActiveChat(newChatId);
    }
    
    setShowSubjectModal(false);
  };

  // Message handling
  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const currentChat = chats.find(c => c.id === activeChat);
    if (!currentChat) return;

    // Save user message
    const userMsg = {
      id: Date.now(),
      type: "user",
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI update
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [...chat.messages, userMsg] }
        : chat
    ));
    
    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      // Save to database if logged in
      if (user && activeChat !== 'default') {
        await DoubtsService.addMessage({
          doubt_id: activeChat,
          message_type: 'user',
          message_content: userMessage
        });
      }

      // Get AI response
      const response = await fetch("http://localhost:3550/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage, 
          subject: currentChat.subject 
        })
      });

      if (!response.ok) throw new Error(response.statusText);
      
      const data = await response.json();
      const aiResponse = data.answer || data.response || JSON.stringify(data);
      const aiHeading = data.heading || currentChat.title;
      
      // Process AI response (markdown, images, etc.)
      const { content, imageUrl } = await processAIResponse(aiResponse);

      // Create AI message
      const aiMsg = {
        id: Date.now() + 1,
        type: "ai",
        message: content,
        imageUrl: imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Update UI
      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { 
              ...chat, 
              messages: [...chat.messages, aiMsg],
              title: aiHeading
            }
          : chat
      ));

      // Update history preview
      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { 
              ...chat, 
              preview: userMessage.slice(0, 50) + "...", 
              time: "Just now", 
              title: aiHeading 
            }
          : chat
      ));

      // Save to database if logged in
      if (user) {
        if (activeChat === 'default') {
          // Migrate default chat to real doubt
          const newDoubt = await DoubtsService.createDoubt({
            user_id: user.id,
            title: aiHeading,
            subject: currentChat.subject,
            preview: userMessage.slice(0, 100)
          });

          if (newDoubt) {
            await Promise.all([
              DoubtsService.addMessage({
                doubt_id: newDoubt.id,
                message_type: 'user',
                message_content: userMessage
              }),
              DoubtsService.addMessage({
                doubt_id: newDoubt.id,
                message_type: 'ai',
                message_content: content,
                image_url: imageUrl
              })
            ]);

            // Update state with new doubt ID
            setActiveChat(newDoubt.id);
            setChatHistory(prev => [
              {
                id: newDoubt.id,
                title: aiHeading,
                subject: currentChat.subject,
                time: "Just now",
                preview: userMessage.slice(0, 50) + "...",
                heading: aiHeading
              },
              ...prev.filter(chat => chat.id !== 'default')
            ]);
          }
        } else {
          // Save AI message to existing doubt
          await DoubtsService.addMessage({
            doubt_id: activeChat,
            message_type: 'ai',
            message_content: content,
            image_url: imageUrl
          });

          // Update doubt title if changed
          if (currentChat.title !== aiHeading) {
            await DoubtsService.updateDoubt(activeChat, {
              title: aiHeading,
              preview: userMessage.slice(0, 100)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { 
              ...chat, 
              messages: [...chat.messages, {
                id: Date.now() + 2,
                type: "ai",
                message: "❌ Sorry, I encountered an error. Please try again.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]
            }
          : chat
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // Helper functions
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return "Just now";
  };

  const processAIResponse = async (content) => {
    // Image prompt extraction
    const imagePrompt = content.match(/```imagePrompt\s+([\s\S]*?)```/)?.[1]?.trim();
    let imageUrl = null;

    if (imagePrompt) {
      try {
        const response = await fetch(`http://localhost:3550/api/image/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.imageUrl;
          content = content.replace(/```imagePrompt[\s\S]*?```/g, '').trim();
        }
      } catch (error) {
        console.error('Image generation error:', error);
      }
    }

    // Markdown table formatting
    content = content.replace(/\|([^|\n]*)\|/g, '| $1 |')
                    .replace(/\|(\s*[-:]+\s*)\|/g, '|$1|')
                    .split('\n')
                    .map(line => line.trim().startsWith('|') && line.trim().endsWith('|') 
                      ? line.trim() 
                      : line)
                    .join('\n');

    return { content, imageUrl };
  };

  const deleteDoubt = async (doubtId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat permanently?')) return;

    try {
      if (doubtId !== 'default' && user) {
        await DoubtsService.deleteDoubt(doubtId);
      }
      
      setChatHistory(prev => prev.filter(chat => chat.id !== doubtId));
      setChats(prev => prev.filter(chat => chat.id !== doubtId));
      
      if (activeChat === doubtId) {
        const remainingChats = chatHistory.filter(chat => chat.id !== doubtId);
        setActiveChat(remainingChats[0]?.id || 'default');
      }
    } catch (error) {
      console.error('Error deleting doubt:', error);
    }
  };

  // Memoized values
  const currentChat = useMemo(() => 
    chats.find(chat => chat.id === activeChat), 
    [chats, activeChat]
  );

  const filteredHistory = useMemo(() => 
    chatHistory.filter(chat =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [chatHistory, searchTerm]
  );

  // Render functions
  const renderMessageContent = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed text-foreground" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-primary mb-4 mt-6 pb-2 border-b border-primary/30" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-primary mb-3 mt-5 pb-1 border-b border-primary/20" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-primary mb-2 mt-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-md font-semibold text-foreground mb-2 mt-3" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-sm font-semibold text-foreground mb-2 mt-3" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-sm font-medium text-muted-foreground mb-2 mt-3" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const isInline = inline;
            const language = className?.replace('language-', '') || '';
            
            return isInline ? (
              <code 
                className="px-2 py-1 bg-muted/80 text-primary rounded text-sm font-mono border border-muted" 
                {...props}
              >
                {children}
              </code>
            ) : (
              <code 
                className="block p-4 bg-muted/60 rounded-lg text-sm font-mono overflow-x-auto border border-muted text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted/40 border border-muted" {...props}>
              {children}
            </pre>
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4 text-foreground" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 ml-4 text-foreground" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-2" {...props} />
          ),
          a: ({ node, href, ...props }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary-glow underline decoration-primary/50 hover:decoration-primary transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary bg-primary/5 pl-4 py-2 italic mb-4 rounded-r-lg text-foreground" 
              {...props} 
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-card-border shadow-lg">
              <table className="w-full border-collapse bg-card/50 min-w-full" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-primary/15 border-b-2 border-primary/30" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-card-border/60" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-muted/30 transition-colors duration-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 text-left text-sm font-bold text-primary uppercase tracking-wider border-r border-primary/20 last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm text-foreground whitespace-normal break-words border-r border-card-border/30 last:border-r-0" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-primary/30" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-primary" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-muted-foreground opacity-75" {...props} />
          ),
          kbd: ({ node, ...props }) => (
            <kbd className="px-2 py-1 bg-muted border border-muted-foreground rounded text-xs font-mono" {...props} />
          ),
          mark: ({ node, ...props }) => (
            <mark className="bg-yellow-200/30 text-foreground px-1 rounded" {...props} />
          ),
          input: ({ node, type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  className="mr-2 text-primary focus:ring-primary rounded accent-primary"
                  disabled
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
          img: ({ node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-card-border"
              {...props}
            />
          ),
          details: ({ node, ...props }) => (
            <details className="mb-4 bg-card/30 rounded-lg border border-card-border" {...props} />
          ),
          summary: ({ node, ...props }) => (
            <summary className="p-4 font-medium text-foreground cursor-pointer hover:bg-muted/20 rounded-t-lg" {...props} />
          ),
        }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="flex h-screen">
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl border border-card-border max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Select Subject</h3>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`p-3 rounded-lg border transition-colors text-left ${
                      selectedSubject === subject
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-card-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-card-border text-foreground hover:bg-muted/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewChat}
                  className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col" style={{ width: '895px' }}>
          <div className="h-16 border-b border-card-border bg-sidebar flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search doubts..."
                  className="pl-10 pr-4 py-2 bg-input border border-card-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {currentChat?.subject && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-primary text-sm font-medium">{currentChat.subject}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewChatClick}
                className="btn-neon flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              currentChat?.messages.map((chat) => (
                <div key={chat.id}>
                  <div className={`flex gap-3 ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                    {chat.type === "ai" && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl p-4 rounded-xl glass-card ${
                        chat.type === "user"
                          ? "bg-primary/10 border-primary/20"
                          : "border-card-border"
                      }`}
                    >
                      <div className="mb-2">
                        {chat.type === "ai" ? renderMessageContent(chat.message) : (
                          <p className="text-foreground">{chat.message}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                        <button
                          onClick={() => copyMessage(chat.message)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {chat.type === "user" && (
                      <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-secondary" />
                      </div>
                    )}
                  </div>
                  
                  {chat.type === "ai" && chat.imageUrl && (
                    <div className="flex justify-start mt-4">
                      <div className="max-w-2xl ml-11">
                        <div className="glass-card p-4 rounded-xl border-card-border bg-card">
                          <div className="flex items-center gap-2 mb-3 text-sm text-primary font-medium">
                            <Image className="h-4 w-4" />
                            <span>Generated Diagram</span>
                          </div>
                          <div className="relative rounded-lg overflow-hidden bg-muted/50">
                            <img
                              src={chat.imageUrl}
                              alt="Generated diagram"
                              className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/ffffff?text=Image+Could+Not+Load';
                                e.target.alt = 'Image could not be loaded';
                              }}
                              style={{
                                minHeight: '100px',
                                backgroundColor: 'rgba(255,255,255,0.05)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="glass-card p-4 rounded-xl border-card-border">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-muted-foreground text-sm ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-card-border p-6">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask your doubt here..."
                    className="w-full bg-transparent border-0 resize-none text-foreground placeholder-muted-foreground focus:outline-none min-h-[60px] max-h-32"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <Upload className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <Image className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-card-border bg-sidebar/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat History
            </h3>
            {isLoading && chatHistory.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`glass-card rounded-lg p-4 interactive cursor-pointer transition-colors ${
                      activeChat === chat.id ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                    }`}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground mb-1">{chat.heading || chat.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium">{chat.subject}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{chat.preview}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{chat.time}</span>
                        </div>
                      </div>
                      {chat.id !== 'default' && (
                        <button
                          onClick={(e) => deleteDoubt(chat.id, e)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Delete doubt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}