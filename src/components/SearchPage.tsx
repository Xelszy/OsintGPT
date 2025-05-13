import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FeatureButtons from './FeatureButtons';

interface SearchPageProps {
  onSearch: (query: string, mode: 'search' | 'research') => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'research'>('search');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, mode);
    }
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === 'scan') {
      setQuery('scan teknologi dari website tokopedia.com');
      onSearch('scan teknologi dari website tokopedia.com', 'search');
    } else if (feature === 'account') {
      setQuery('check account 1234567890');
      onSearch('check account 1234567890', 'search');
    }
  };

// Improved feature buttons with better icons
  const featureButtons = [
    { 
      name: "People", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      name: "Location", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      name: "Business", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 7H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      name: "Social", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 8C18.6569 8 20 6.65685 20 5C20 3.34315 18.6569 2 17 2C15.3431 2 14 3.34315 14 5C14 6.65685 15.3431 8 17 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 15C8.65685 15 10 13.6569 10 12C10 10.3431 8.65685 9 7 9C5.34315 9 4 10.3431 4 12C4 13.6569 5.34315 15 7 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 22C18.6569 22 20 20.6569 20 19C20 17.3431 18.6569 16 17 16C15.3431 16 14 17.3431 14 19C14 20.6569 15.3431 22 17 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.5 13.5L14.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14.5 6.5L9.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      name: "Deep Search", 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    }
  ];

  return (
    <div className="search-container flex flex-col items-center">
      {/* App Logo/Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-normal mb-12 tracking-tight"
      >
         Perplexity
      </motion.h1>

      {/* Search Form */}
      <motion.form 
        onSubmit={handleSubmit}
        className={`w-full max-w-2xl transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          {/* Search Input */}
          <div className={`flex items-center rounded-full bg-gray-900 border ${isFocused ? 'border-red-500' : 'border-white/10'} transition-colors duration-200`}>
            {/* Input Field */}
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:outline-none py-3 px-5 text-white placeholder-gray-500"
              placeholder="Search for intel..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
            />

            {/* Right tools */}
            <div className="flex items-center gap-1 pr-2">
              {/* Search Mode Toggle */}
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setMode('search')}
                  className={`rounded-l-full px-3 py-1 text-sm font-medium ${
                    mode === 'search' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Quick
                </button>
                <button
                  type="button"
                  onClick={() => setMode('research')}
                  className={`rounded-r-full px-3 py-1 text-sm font-medium ${
                    mode === 'research' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Deep
                </button>
              </div>
              
              {/* Additional buttons */}
              <button type="button" className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button type="button" className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button type="button" className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button type="submit" className="btn-icon bg-red-600 text-white hover:bg-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.form>

      {/* Feature Buttons */}
      <div className="mt-6">
        <FeatureButtons onFeatureClick={handleFeatureClick} />
      </div>

      {/* App Promo */}
      <motion.div 
        className="mt-8 bg-gray-900 rounded-md border border-white/10 p-3 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div>
          <p className="text-sm text-gray-300">Introducing OSINT GPT</p>
          <p className="text-xs text-gray-500">The World in your hand</p>
        </div>
        <div className="w-8 h-8 text-red-500">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M0,0L9.5,1.15V11.5H0V0z M10.5,1.3L24,3V11.5H10.5V1.3z M0,12.5H9.5V22.85L0,24V12.5z M10.5,12.5H24V21L10.5,22.7V12.5z"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchPage;