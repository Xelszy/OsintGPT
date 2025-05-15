import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatImageSearchResultsProps {
  results: {
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
      source?: string;
    }>;
    suggested_searches?: Array<{
      name?: string;
      link?: string;
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

const ChatImageSearchResults: React.FC<ChatImageSearchResultsProps> = ({ results }) => {
  const [selectedTab, setSelectedTab] = useState<'similar' | 'vision'>('similar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Combine images_results and similar_images for display
  const allResults = [
    ...(results.images_results || []),
    ...(results.similar_images || [])
  ];

  const displayResults = showAll ? allResults : allResults.slice(0, 4);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder.png';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/50 rounded-lg p-4 shadow-lg">
      {/* Original image if this is a reverse image search */}
      {results.image_url && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="text-sm font-medium text-slate-300 mb-2">Original Image:</div>
          <img 
            src={results.image_url} 
            alt="Original" 
            className="w-full h-48 object-contain rounded-md"
            onError={handleImageError}
          />
        </div>
      )}

      {/* Search query if this is a text search */}
      {results.search_parameters?.q && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="text-sm font-medium text-slate-300">Search Query:</div>
          <div className="text-slate-400">{results.search_parameters.q}</div>
        </div>
      )}

      {/* Suggested searches */}
      {results.suggested_searches && results.suggested_searches.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-300 mb-2">Suggested Searches:</div>
          <div className="flex flex-wrap gap-2">
            {results.suggested_searches.map((suggestion, i) => (
              <div 
                key={i}
                className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedTab('similar')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'similar'
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Similar Images
        </button>
        <button
          onClick={() => setSelectedTab('vision')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'vision'
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Vision Analysis
        </button>
      </div>

      {selectedTab === 'similar' ? (
        <>
          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {displayResults.map((result, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div 
                  className="aspect-square bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                  onClick={() => handleImageClick(result.original || result.link || result.thumbnail || '')}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title || 'Search result'}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                {result.title && (
                  <div className="mt-2 text-xs text-slate-400 truncate">
                    {result.title}
                  </div>
                )}
                {result.source && (
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-400 hover:text-blue-300 truncate block"
                  >
                    {result.source}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Show more/less button */}
          {allResults.length > 4 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-3 flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-md transition-colors hover:bg-slate-700/50"
            >
              {showAll ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show more ({allResults.length - 4} more)
                </>
              )}
            </button>
          )}
        </>
      ) : (
        /* Vision Analysis Tab */
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
          {results.vision_text ? (
            <div className="text-sm text-slate-300 whitespace-pre-wrap">
              {results.vision_text}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic">
              No image analysis available
            </div>
          )}
        </div>
      )}

      {/* Source footer */}
      <div className="text-xxs text-slate-400 mt-3 flex items-center justify-between">
        <span>Powered by Yandex Image Search</span>
        <span className="text-slate-500">•</span>
        <span>{allResults.length} results found</span>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatImageSearchResults; 