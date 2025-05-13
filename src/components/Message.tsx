import React from 'react';
import { motion } from 'framer-motion';

interface MessageProps {
  message: {
    sender: 'user' | 'ai';
    text: string;
    isAccountInquiry?: boolean;
    accountInquiryData?: any;
    isTechStack?: boolean;
    wappalyzerData?: any;
    url?: string;
    isImageSearch?: boolean;
    imageSearchResults?: any;
  };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Filter out tool commands from the message text
  const filteredText = message.text.replace(/TOOL:.*$/gm, '').trim();
  
  return (
    <motion.div 
      className="w-full mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Message author */}
      <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-center gap-2 ${isUser ? 'text-cyan-400' : 'text-gray-400'}`}>
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-white text-xs">
              AI
            </div>
          )}
          <div className="text-sm">{isUser ? 'You' : 'Perplexity'}</div>
        </div>
      </div>
      
      {/* Message content */}
      <div className={`message-content ${isUser ? 'message-content-user' : 'message-content-ai'}`}>
        {/* We could have specific components for different message types */}
        <div 
          className="prose prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: filteredText.replace(/\n/g, '<br/>') }} 
        />

        {/* Citations (AI responses only) */}
        {!isUser && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="text-xs bg-[#333] hover:bg-[#444] text-gray-300 px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Accurate</span>
            </button>
            <button className="text-xs bg-[#333] hover:bg-[#444] text-gray-300 px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Inaccurate</span>
            </button>
            <button className="text-xs bg-[#333] hover:bg-[#444] text-gray-300 px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;