import React, { useState } from 'react';

interface LeakDataViewerProps {
  rawData: any;
  isVisible: boolean;
  onClose: () => void;
  censoredFields?: string[];
}

const LeakDataViewer: React.FC<LeakDataViewerProps> = ({ rawData, isVisible, onClose, censoredFields = [] }) => {
  const [showUncensored, setShowUncensored] = useState(false);

  if (!isVisible) return null;

  // Function to censor sensitive data
  const censorValue = (key: string, value: any): any => {
    if (!showUncensored && censoredFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase()) || 
      field === 'all'
    )) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('phone')) {
          return value.substring(0, 3) + '••••' + value.substring(value.length - 2);
        }
        if (value.includes('@')) {
          const [username, domain] = value.split('@');
          return username.substring(0, 2) + '••••@' + domain;
        }
        return value.substring(0, 2) + '•'.repeat(Math.min(6, value.length - 2));
      }
      return '••••••';
    }
    return value;
  };

  // Function to recursively censor object
  const censorObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => censorObject(item));
    }
    if (obj && typeof obj === 'object') {
      const censored: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        censored[key] = censorObject(censorValue(key, value));
      });
      return censored;
    }
    return obj;
  };

  const displayData = showUncensored ? rawData : censorObject(rawData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-400">Full Leak Data</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUncensored(!showUncensored)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            >
              {showUncensored ? 'Show Censored' : 'Show Uncensored'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm text-gray-300 font-mono">
          {JSON.stringify(displayData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LeakDataViewer; 