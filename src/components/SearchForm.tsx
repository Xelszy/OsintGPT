import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchForm from './SearchForm';
import FeatureButtons from './FeatureButtons';
import AppPromo from './AppPromo';

interface SearchPageProps {
  onSearch: (query: string, mode: 'search' | 'research') => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'research'>('search');

  const handleSubmit = (submittedQuery: string, selectedMode: 'search' | 'research') => {
    if (submittedQuery.trim()) {
      onSearch(submittedQuery, selectedMode);
    }
  };

  return (
    <div className="search-container flex flex-col items-center justify-center min-h-screen px-4">
      {/* App Logo/Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-normal mb-12 tracking-tight text-white"
      >
        perplexity
      </motion.h1>

      {/* Search Form Component */}
      <SearchForm 
        query={query}
        setQuery={setQuery}
        mode={mode}
        setMode={setMode}
        onSubmit={handleSubmit}
      />

      {/* Feature Buttons Component */}
      <FeatureButtons />

      {/* App Promo Component */}
      <AppPromo />
    </div>
  );
};

export default SearchPage;