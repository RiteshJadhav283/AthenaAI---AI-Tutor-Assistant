import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Mic, 
  Image, 
  Upload, 
  Copy, 
  Search,
  User,
  Bot,
  Clock,
  MessageSquare,
  Plus,
  X,
  Trash2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './MarkdownTable.css';
import { DoubtsService } from '@/lib/doubtsService';
import { useAuth } from '@/context/AuthContext';

const SUBJECTS = [
  'Physics', 'Chemistry', 'Math', 'Biology', 'Engineering', 'History', 'Geography'
];

export default function Doubts() {
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

  useEffect(() => {
    if (user) {
      fetchDoubtsHistory();
    } else {
      createDefaultChat();
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, chats]);

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
        
        if (formattedHistory.length > 0) {
          loadDoubt(formattedHistory[0].id);
        }
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  const createDefaultChat = () => {
    const defaultChat = {
      id: 'default',
      title: "Physics - Introduction",
      subject: "Physics",
      messages: [
        {
          id: 'welcome',
          type: "ai",
          message: "Hello! I'm your AI tutor. What would you like to learn about today?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
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
          
          if (existingChatIndex >= 0) {
            const updatedChats = [...prevChats];
            updatedChats[existingChatIndex] = chatObj;
            return updatedChats;
          } else {
            return [...prevChats, chatObj];
          }
        });
        
        setActiveChat(doubt.id);
      }
    } catch (error) {
      console.error('Error loading doubt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extractImagePrompt = (content) => {
    // Corrected regex pattern for image prompts
    const imagePromptRegex = /```imagePrompt\s+([\s\S]*?)```/;
    const match = content.match(imagePromptRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  };

  const processAIResponse = async (content) => {
    const convertHtmlTableToMarkdown = (htmlContent) => {
      const tableMatch = htmlContent.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
      if (!tableMatch) return htmlContent;
      
      const tableContent = tableMatch[1];
      
      const headerMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      const headers = [];
      if (headerMatch) {
        const headerRows = headerMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
        if (headerRows) {
          headers.push(...headerRows.map(th => th.replace(/<[^>]*>/g, '').trim()));
        }
      }
      
      const bodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      const rows = [];
      if (bodyMatch) {
        const tableRows = bodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
        if (tableRows) {
          tableRows.forEach(tr => {
            const cells = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
            if (cells) {
              const rowData = cells.map(td => td.replace(/<[^>]*>/g, '').trim());
              rows.push(rowData);
            }
          });
        }
      }
      
      if (headers.length > 0 && rows.length > 0) {
        let markdownTable = '\n\n| ' + headers.join(' | ') + ' |\n';
        markdownTable += '|' + headers.map(() => ' --- ').join('|') + '|\n';
        
        rows.forEach(row => {
          markdownTable += '| ' + row.join(' | ') + ' |\n';
        });
        
        markdownTable += '\n';
        return htmlContent.replace(tableMatch[0], markdownTable);
      }
      
      return htmlContent;
    };

    content = convertHtmlTableToMarkdown(content);
    
    const imagePrompt = extractImagePrompt(content);
    let imageUrl = null;

    if (imagePrompt) {
      try {
        const response = await fetch(`http://localhost:3550/api/image/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        if (!response.ok) {
          throw new Error(`Image generation failed with status: ${response.status}`);
        }

        const data = await response.json();
        imageUrl = data.imageUrl;
        
        // Remove the image prompt block from the content
        content = content.replace(/```image\n[\s\S]*?\n```/g, '').trim();
      } catch (error) {
        console.error('Image generation error:', error);
      }
    }

    content = content.replace(/\|([^|\n]*)\|/g, (match, cell) => {
      return '| ' + cell.trim() + ' |';
    });
    
    content = content.replace(/\|(\s*[-:]+\s*)\|/g, (match, separator) => {
      const cleanSeparator = separator.replace(/[^-:]/g, '');
      return '|' + cleanSeparator + '|';
    });
    
    content = content.split('\n').map(line => {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        return line.trim();
      }
      return line;
    }).join('\n');

    content = content.replace(/\|\n\|/g, '|\n\n|');
    
    return { content: content.trim(), imageUrl };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentChatObj = chats.find(chat => chat.id === activeChat);
    const chatSubject = currentChatObj?.subject || 'General';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      message: message,
      time: currentTime
    };

    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, newUserMessage] }
          : chat
      )
    );

    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3550/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, subject: chatSubject })
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const data = await response.json();
      const aiRawResponse = data.answer || data.response || data.message || JSON.stringify(data);
      
      const { content, imageUrl } = await processAIResponse(aiRawResponse);
      const aiHeading = data.heading || chatSubject + ' Doubt';
      const aiTopic = data.topic || '';

      const newAIMessage = {
        id: Date.now() + 1,
        type: "ai",
        message: content,
        imageUrl: imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat 
            ? { ...chat, messages: [...chat.messages, newAIMessage], heading: aiHeading, topic: aiTopic }
            : chat
        )
      );

      setChatHistory(prevHistory => 
        prevHistory.map(chat => 
          chat.id === activeChat 
            ? { ...chat, preview: userMessage.slice(0, 50) + "...", time: "Just now", heading: aiHeading }
            : chat
        )
      );

      if (user) {
        if (activeChat !== 'default') {
          await DoubtsService.addMessage({
            doubt_id: activeChat,
            message_type: 'user',
            message_content: userMessage
          });
          
          await DoubtsService.addMessage({
            doubt_id: activeChat,
            message_type: 'ai',
            message_content: content,
            image_url: imageUrl
          });
          
          await DoubtsService.updateDoubt(activeChat, {
            preview: userMessage.slice(0, 100),
            title: aiHeading || currentChatObj.title
          });
        } else {
          const newDoubt = await DoubtsService.createDoubt({
            user_id: user.id,
            title: aiHeading,
            subject: chatSubject,
            preview: userMessage.slice(0, 100)
          });
          
          if (newDoubt) {
            await DoubtsService.addMessage({
              doubt_id: newDoubt.id,
              message_type: 'user',
              message_content: userMessage
            });
            
            await DoubtsService.addMessage({
              doubt_id: newDoubt.id,
              message_type: 'ai',
              message_content: content,
              image_url: imageUrl
            });
            
            setActiveChat(newDoubt.id);
            
            setChatHistory(prevHistory => {
              const newHistoryItem = {
                id: newDoubt.id,
                title: aiHeading,
                subject: chatSubject,
                time: "Just now",
                preview: userMessage.slice(0, 50) + "...",
                heading: aiHeading
              };
              
              const filteredHistory = prevHistory.filter(chat => chat.id !== 'default');
              return [newHistoryItem, ...filteredHistory];
            });
            
            setChats(prevChats => {
              const updatedChat = {
                ...currentChatObj,
                id: newDoubt.id,
                title: aiHeading,
                heading: aiHeading
              };
              
              return prevChats.map(chat => 
                chat.id === 'default' ? updatedChat : chat
              );
            });
          }
        }
      }

    } catch (error) {
      console.error('Frontend fetch error:', error);

      const errorMessage = {
        id: Date.now() + 2,
        type: "ai",
        message: "❌ Sorry, I encountered an error while processing your request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat 
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChatClick = () => {
    setShowSubjectModal(true);
  };

  const createNewChat = async () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatTitle = `${selectedSubject} Chat`;
    
    if (user) {
      try {
        const newDoubt = await DoubtsService.createDoubt({
          user_id: user.id,
          title: chatTitle,
          subject: selectedSubject,
          preview: "Start a new conversation..."
        });
        
        if (newDoubt) {
          const welcomeMessage = `Hello! I'm your AI tutor for ${selectedSubject}. What would you like to learn about today?`;
          
          await DoubtsService.addMessage({
            doubt_id: newDoubt.id,
            message_type: 'ai',
            message_content: welcomeMessage
          });
          
          const newChat = {
            id: newDoubt.id,
            title: chatTitle,
            subject: selectedSubject,
            messages: [
              {
                id: Date.now(),
                type: "ai",
                message: welcomeMessage,
                time: currentTime
              }
            ]
          };
          
          const newHistoryItem = {
            id: newDoubt.id,
            title: chatTitle,
            subject: selectedSubject,
            time: "Just now",
            preview: "Start a new conversation...",
            heading: chatTitle
          };
          
          setChats(prevChats => [...prevChats, newChat]);
          setChatHistory(prevHistory => [newHistoryItem, ...prevHistory]);
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
        messages: [
          {
            id: Date.now(),
            type: "ai",
            message: `Hello! I'm your AI tutor for ${selectedSubject}. What would you like to learn about today?`,
            time: currentTime
          }
        ]
      };
      
      const newHistoryItem = {
        id: newChatId,
        title: chatTitle,
        subject: selectedSubject,
        time: "Just now",
        preview: "Start a new conversation...",
        heading: chatTitle
      };
      
      setChats(prevChats => [...prevChats, newChat]);
      setChatHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      setActiveChat(newChatId);
    }
    
    setShowSubjectModal(false);
  };
  
  const deleteDoubt = async (doubtId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this doubt? This action cannot be undone.')) {
      try {
        if (doubtId !== 'default' && user) {
          await DoubtsService.deleteDoubt(doubtId);
        }
        
        setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== doubtId));
        setChats(prevChats => prevChats.filter(chat => chat.id !== doubtId));
        
        if (activeChat === doubtId) {
          const remainingChats = chatHistory.filter(chat => chat.id !== doubtId);
          if (remainingChats.length > 0) {
            setActiveChat(remainingChats[0].id);
          } else {
            createDefaultChat();
          }
        }
      } catch (error) {
        console.error('Error deleting doubt:', error);
      }
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleChatClick = (chatId) => {
    if (chats.some(chat => chat.id === chatId)) {
      setActiveChat(chatId);
    } else {
      loadDoubt(chatId);
    }
  };

  const renderMessageContent = (content) => {
    return (
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
  };

  const currentChat = chats.find(chat => chat.id === activeChat);
  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
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