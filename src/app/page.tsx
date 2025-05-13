'use client';
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ImageSearchResultsDisplay from '../components/ImageSearchResultsDisplay';
import WappalyzerResultsDisplay from '../components/WappalyzerResultsDisplay';
import AccountInquiryDisplay from '../components/AccountInquiryDisplay';
import LeakDataViewer from '../components/LeakDataViewer';

// Dynamic import components to prevent SSR issues
const SearchPage = dynamic(() => import('../components/SearchPage'), { ssr: false });
const MainApp = dynamic(() => import('../components/MainApp'), { ssr: false });

// Helper functions for processing data
function formatWhois(json: any) {
  if (!json || typeof json !== 'object') return String(json);
  // Convert UNIX timestamps to readable dates if present
  const dateFields = ['creation_date', 'expiration_date', 'updated_date'];
  const formatted = { ...json };
  dateFields.forEach((field) => {
    if (typeof formatted[field] === 'number') {
      const date = new Date(formatted[field] * 1000);
      formatted[field + '_str'] = date.toISOString();
    }
  });
  return JSON.stringify(formatted, null, 2);
}

// Function to detect if a response is from LeakOsint
function isLeakOsintResponse(text: string): boolean {
  // Check if response starts with typical LeakOsint formatted response pattern
  return (text.startsWith('I searched for information about') || text.includes('=== Database:')) && 
         text.includes('--- Original Data ---');
}

// Function to format the LeakOsint response text to parse into component parts
function parseLeakOsintResponse(text: string): { 
  conversation: string; 
  originalJson: any | null;
} {
  try {
    // Check for the marker for original data
    if (text.includes('--- Original Data ---')) {
      // Split the response at the marker for original data
      const parts = text.split('--- Original Data ---');
      
      if (parts.length < 2) {
        console.warn("Could not split response at marker", text);
        return { conversation: text, originalJson: null };
      }
      
      const conversation = parts[0].trim();
      
      // Extract JSON string from the code block
      const jsonMatch = parts[1].match(/```json\n([\s\S]*?)\n```/);
      let originalJson: any = null;
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const jsonStr = jsonMatch[1].trim();
          console.log("Found JSON data, length:", jsonStr.length);
          originalJson = JSON.parse(jsonStr);
          console.log("Successfully parsed JSON with keys:", originalJson ? Object.keys(originalJson) : []);
          
          // Verify the structure
          if (originalJson && originalJson.List) {
            console.log("Databases in the response:", Object.keys(originalJson.List));
          } else {
            console.warn("No List property in parsed JSON");
          }
        } catch (e) {
          console.error("Failed to parse LeakOsint JSON:", e);
        }
      } else {
        console.warn("No JSON code block found in the response", parts[1]);
      }
      
      return { conversation, originalJson };
    } else {
      console.log("No '--- Original Data ---' marker found in the response");
      return { conversation: text, originalJson: null };
    }
  } catch (e) {
    console.error("Error parsing LeakOsint response:", e);
    return { conversation: text, originalJson: null };
  }
}

// Format title from different possible structures
const formatTitle = (title: any): string => {
  if (typeof title === 'string') {
    return title;
  }
  
  if (title && typeof title === 'object') {
    // Check if it has english, japanese, pretty properties
    if (title.english) return title.english;
    if (title.pretty) return title.pretty;
    if (title.japanese) return title.japanese;
    
    // Return any other string property if available
    const stringProps = Object.values(title).filter(val => typeof val === 'string');
    if (stringProps.length > 0) return stringProps[0];
  }
  
  // Fallback
  return 'Untitled';
};

// Main component
export default function Home() {
  const [messages, setMessages] = useState<{
    role: string;
    content: string;
    isLeakOsint?: boolean;
    leakOsintJson?: any;
    censored?: boolean;
    censoredFields?: string[];
    rawLeakData?: any;
  }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchState, setSearchState] = useState<{
    isSearched: boolean;
    query: string;
    mode: 'search' | 'research';
  }>({
    isSearched: false,
    query: '',
    mode: 'search'
  });
  const [showSecurityTools, setShowSecurityTools] = useState<boolean>(false);

  // Handler for search from SearchPage
  const handleSearch = (query: string, mode: 'search' | 'research') => {
    setSearchState({
      isSearched: true,
      query,
      mode
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    // Extract the main query without censoring instructions
    const cleanQuery = input.replace(/\s*\b(?:censored|censor|hide|mask)\s+(?:phone|email|address|all|everything)\b\s*/gi, '').trim();
    // Extract what needs to be censored
    const censorMatches = input.match(/\b(?:censored|censor|hide|mask)\s+(\w+)\b/i);
    const censorField = censorMatches ? censorMatches[1].toLowerCase() : null;
    
    // Add user message with original input
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanQuery }) // Send clean query without censoring instructions
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant message with metadata and censoring info
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        isLeakOsint: data.metadata?.isLeakOsint || false,
        leakOsintJson: data.metadata?.leakData,
        censored: !!censorField,
        censoredFields: censorField ? [censorField] : [],
        rawLeakData: data.metadata?.rawLeakData
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Security tools info component
  const SecurityToolsInfo = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-400">Security & OSINT Tools</h2>
        <button 
          onClick={() => setShowSecurityTools(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <p className="mb-4">
        Our AI can understand natural language commands for various security tools. Just ask in English or Indonesian.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">WHOIS Lookup</h3>
          <p className="text-sm mb-2">Get domain registration info</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "who owns example.com"<br/>
            "whois information for google.com"
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">OSINT Leaks</h3>
          <p className="text-sm mb-2">Search for leaked credentials</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "find leaks for email@example.com"<br/>
            "search osint data for username"
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">WAF Detection</h3>
          <p className="text-sm mb-2">Detect web application firewalls</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "check if example.com has a WAF"<br/>
            "detect firewall on example.com"
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">Subdomain Discovery</h3>
          <p className="text-sm mb-2">Find subdomains of a domain</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "find subdomains of example.com"<br/>
            "enumerate subdomains for google.com"
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">Tech Stack Detection</h3>
          <p className="text-sm mb-2">Identify technologies used by a website</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "what technology is used by example.com"<br/>
            "detect tech stack on github.com"
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="font-bold text-green-400 mb-2">Bank Account Verification</h3>
          <p className="text-sm mb-2">Verify Indonesian bank accounts</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono">
            "check account number 12345678 at BCA"<br/>
            "verify rekening BNI 87654321"
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        <p className="font-bold">Advanced Usage:</p>
        <p>You can also use direct tool syntax: <span className="font-mono bg-gray-900 px-1 rounded">TOOL: toolname parameters</span></p>
        <p className="mt-2">Example: <span className="font-mono bg-gray-900 px-1 rounded">TOOL: whois google.com</span></p>
      </div>
    </motion.div>
  );

  // Sidebar component
  const Sidebar = () => (
    <div className="sidebar">
      {/* Logo */}
      <div className="mb-8">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <title>AI Pentest & OSINT Assistant</title>
      </div>

      {/* Nav Icons */}
      <Link href="/" className="sidebar-icon active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>
      <Link href="/image-search" className="sidebar-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </Link>
      <a href="#" className="sidebar-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </a>
      <a href="#" className="sidebar-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </a>
    </div>
  );

  // Footer component
  const Footer = () => (
    <div className="w-full flex justify-center py-5 text-xs text-gray-500 gap-4 mt-auto">
      <a href="#" className="hover:text-gray-300">Pro</a>
      <a href="#" className="hover:text-gray-300">Enterprise</a>
      <a href="#" className="hover:text-gray-300">API</a>
      <a href="#" className="hover:text-gray-300">Blog</a>
      <a href="#" className="hover:text-gray-300">Careers</a>
      <a href="#" className="hover:text-gray-300">Store</a>
      <a href="#" className="hover:text-gray-300">Finance</a>
      <div className="flex items-center gap-1">
        <span>English</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );

  // If no search has been performed yet, show the search page with sidebar
  if (!searchState.isSearched) {
    return (
      <div className="flex min-h-screen bg-[#121212]">
        <Sidebar />
        <div className="content-with-sidebar flex flex-col w-full">
          <div className="flex-grow flex items-center justify-center">
            <SearchPage onSearch={handleSearch} />
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // We have performed a search, show the main app
  return (
    <div className="flex min-h-screen bg-[#121212]">
      <Sidebar />
      <div className="content-with-sidebar flex flex-col w-full">
        {/* Security Tools Info Button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowSecurityTools(!showSecurityTools)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Security Tools
          </button>
        </div>
        
        {/* Conditionally render the tools info */}
        {showSecurityTools && <SecurityToolsInfo />}
        
        <MainApp initialQuery={searchState.query} initialMode={searchState.mode} />
        <Footer />
      </div>
    </div>
  );
} 