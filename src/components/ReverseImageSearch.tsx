import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from './ImageUploader';
import ImageSearchResultsDisplay from './ImageSearchResultsDisplay';

interface ReverseImageSearchProps {
  onBack?: () => void;
}

const ReverseImageSearch: React.FC<ReverseImageSearchProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageSelected = async (imageData: { url: string; file?: File }) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    setSearchQuery(imageData.url);

    try {
      // For file uploads, we'd need to upload to a server first
      // For now we'll just handle URLs
      const response = await fetch('/api/reverse-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageData.url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform reverse image search');
      }

      if (data.error) {
        setError(data.error);
      } else if (data.no_matches) {
        setError('No matching images found. Try with a different image or add keywords.');
      } else {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      console.error('Error during reverse image search:', err);
      setError(err.message || 'Failed to perform reverse image search');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Reverse Image Search</h1>
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 bg-slate-800 rounded-md text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              ← Back
            </motion.button>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-medium text-slate-200 mb-4">
            Find similar images or identify the source of an image
          </h2>
          
          <ImageUploader 
            onImageSelected={handleImageSelected} 
            isProcessing={isLoading} 
          />
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
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
                image_url: searchQuery,
              }} 
            />
          </motion.div>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Powered by Yandex Image Search API</p>
          <p className="mt-1">Search engines may have different image recognition capabilities</p>
        </div>
      </div>
    </div>
  );
};

export default ReverseImageSearch; 