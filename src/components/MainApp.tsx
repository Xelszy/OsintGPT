import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccountInquiryDisplay from './AccountInquiryDisplay';
import WappalyzerResultsDisplay from './WappalyzerResultsDisplay';
import ChatImageSearchResults from './ChatImageSearchResults';

type MainAppProps = {
  initialQuery?: string;
  initialMode?: 'search' | 'research';
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isAccountInquiry?: boolean;
  accountInquiryData?: {
    success?: boolean;
    message?: string;
    data?: {
      account_bank?: string;
      account_number?: string;
      account_holder?: string;
      account_name?: string;
      status?: string;
    };
    status?: boolean;
  };
  isTechStack?: boolean;
  wappalyzerData?: {
    technologies: Array<{
      name: string;
      version?: string;
      categories: string[];
    }>;
    status: string;
    cached: boolean;
    timestamp: number;
  };
  url?: string;
  isImageSearch?: boolean;
  imageSearchResults?: {
    images_results?: Array<{
      thumbnail?: string;
      original?: string;
      link?: string;
      title?: string;
      source?: string;
    }>;
    similar_images?: Array<{
      thumbnail?: string;
      original?: string;
      link?: string;
      title?: string;
    }>;
    search_parameters?: {
      engine?: string;
      url?: string;
      q?: string;
    };
    vision_text?: string;
    success?: boolean;
    image_url?: string;
  };
}

interface ApiResponse {
  response?: string;
  error?: string;
  isAccountInquiry?: boolean;
  accountInquiryData?: Message['accountInquiryData'];
  isTechStack?: boolean;
  wappalyzerData?: Message['wappalyzerData'];
  url?: string;
  isImageSearch?: boolean;
  imageSearchResults?: Message['imageSearchResults'];
  metadata?: {
    imageSearch?: boolean;
    searchResults?: any;
    imageUrl?: string;
  };
}

const MainApp: React.FC<MainAppProps> = ({ initialQuery, initialMode = 'search' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const helpMessage: Message = {
      sender: 'ai',
      text: `# Welcome to the AI Pentest & OSINT Assistant

I can help you with various cybersecurity tasks using natural language. Try any of these commands:

- **Domain Intelligence**: "Who owns example.com?" or "What technologies does facebook.com use?"
- **Data Leaks**: "Find leaks for john@example.com" (add "censor sensitive info" to protect privacy)
- **Security Checks**: "Check if github.com has a WAF" or "Find subdomains of mozilla.org"
- **Web Research**: "Search for recent ransomware attacks" or "Find images of network diagrams"

Just type your request in natural language, and I'll use the appropriate tools to help you.`,
      timestamp: new Date()
    };
    
    setMessages([helpMessage]);

    if (initialQuery) {
      handleInitialQuery(initialQuery, initialMode);
    }
  }, [initialQuery, initialMode]);

  const handleInitialQuery = async (query: string, mode: 'search' | 'research') => {
    const userMsg: Message = { 
      sender: 'user', 
      text: query,
      timestamp: new Date()
    };
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, mode })
      });

      if (!res.ok) throw new Error('API call failed');

      const data: ApiResponse = await res.json();
      
      // Create a single AI message with all the data
      const aiMsg: Message = { 
        sender: 'ai',
        text: data.response || '',
        timestamp: new Date()
      };

      // Only add additional data if it exists
      if (data.isAccountInquiry && data.accountInquiryData) {
        aiMsg.isAccountInquiry = true;
        aiMsg.accountInquiryData = data.accountInquiryData as Message['accountInquiryData'];
      }
      
      if (data.isTechStack && data.wappalyzerData) {
        aiMsg.isTechStack = true;
        aiMsg.wappalyzerData = data.wappalyzerData;
        aiMsg.url = data.url;
      }
      
      // Handle image search results - use a single consistent format
      if (data.isImageSearch && data.imageSearchResults) {
        aiMsg.isImageSearch = true;
        aiMsg.imageSearchResults = data.imageSearchResults;
      }
      
      // Remove the old metadata-based format to avoid duplication
      // and possible display of tool commands in the UI

      // Only add the message if there's content or special data
      if (aiMsg.text || aiMsg.isAccountInquiry || aiMsg.isTechStack || aiMsg.isImageSearch) {
        setMessages(msgs => [...msgs, aiMsg]);
      }
    } catch (error: any) {
      const errorMsg: Message = {
        sender: 'ai',
        text: `Error: ${error.message || error}`,
        timestamp: new Date()
      };
      setMessages(msgs => [...msgs, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleInitialQuery(input.trim(), 'search');
    setInput('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
  };

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.sender === 'user';
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`message-group ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div className={`message-avatar ${isUser ? 'message-avatar-user' : 'message-avatar-ai'}`}>
          {isUser ? 'U' : 'AI'}
        </div>
        
        <div className={`message-content ${isUser ? 'message-content-user' : 'message-content-ai'}`}>
          {msg.isAccountInquiry && msg.accountInquiryData ? (
            <AccountInquiryDisplay data={msg.accountInquiryData} />
          ) : msg.isTechStack && msg.wappalyzerData ? (
            <WappalyzerResultsDisplay results={msg.wappalyzerData} url={msg.url || ''} />
          ) : msg.isImageSearch && msg.imageSearchResults && 
               ((msg.imageSearchResults.images_results && msg.imageSearchResults.images_results.length > 0) || 
                (msg.imageSearchResults.similar_images && msg.imageSearchResults.similar_images.length > 0)) ? (
            <div className="image-search-results">
              {msg.text && (
                <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap mb-3" 
                     dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
              )}
              <ChatImageSearchResults results={msg.imageSearchResults} />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap" 
                 dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
          )}
          {msg.timestamp && (
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
            AI Pentest & OSINT Assistant
          </h1>
          <div className="text-sm text-gray-400 mt-1">Powerful cybersecurity tools through natural language</div>
        </div>
      </header>

      <main className="chat-messages-container">
        <div className="messages-wrapper">
          <AnimatePresence mode="popLayout">
            {messages.map(renderMessage)}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="typing-indicator"
            >
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      <footer className="chat-input-container">
        <div className="chat-input-content">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-send-button"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;