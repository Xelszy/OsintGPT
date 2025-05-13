'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReverseImageSearch from '@/components/ReverseImageSearch';
import ImageUploader from '@/components/ImageUploader';
import ImageSearchResultsDisplay from '@/components/ImageSearchResultsDisplay';
import Link from 'next/link';

export default function ImageSearchPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'reverse'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch('/api/websearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: `serpapi_yandex_images ${searchQuery}` }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform image search');
      }

      if (data.error) {
        setError(data.error);
      } else {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      console.error('Error during image search:', err);
      setError(err.message || 'Failed to perform image search');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                AI Pentest Assistant
              </h1>
            </Link>
          </div>
          
          <h2 className="text-xl font-medium text-white">Image Search Tools</h2>
          
          <div className="flex mt-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Text-based Search
            </button>
            <button
              onClick={() => setActiveTab('reverse')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'reverse'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Reverse Image Search
            </button>
          </div>
        </header>

        {activeTab === 'text' ? (
          <div className="text-search">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 shadow-lg">
              <h3 className="text-lg font-medium text-slate-200 mb-4">
                Search Images By Keywords
              </h3>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keywords to find images..."
                  className="flex-1 bg-slate-800/30 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md bg-blue-600/30 hover:bg-blue-600/40 border border-blue-600/20 transition-colors text-white text-sm font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Searching...
                    </div>
                  ) : (
                    'Search Images'
                  )}
                </motion.button>
              </form>
              
              {error && !isLoading && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mt-4">
                  {error}
                </div>
              )}
            </div>

            {searchResults && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ImageSearchResultsDisplay 
                  results={{
                    ...searchResults,
                    search_parameters: { q: searchQuery },
                  }} 
                />
              </motion.div>
            )}
          </div>
        ) : (
          <ReverseImageSearch />
        )}

        <footer className="mt-10 text-center text-sm text-slate-500 py-4">
          <p>AI Pentest Assistant © 2023</p>
          <p className="mt-1">Image search powered by Yandex Image Search</p>
        </footer>
      </div>
    </div>
  );
} 