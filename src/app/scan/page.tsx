'use client';

import React, { useState } from 'react';

interface ScanResult {
  id: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  description: string;
  path: string;
}

export default function ScanPage() {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState<'full' | 'quick'>('full');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const startScan = () => {
    if (!target) return;
    
    setIsScanning(true);
    setResults([]);
    
    // Simulate scan results
    const mockResults: ScanResult[] = [
      { id: 1, severity: 'critical', type: 'SQL Injection', description: 'Possible SQL injection in login form', path: '/login' },
      { id: 2, severity: 'high', type: 'XSS', description: 'Cross-site scripting vulnerability in comment section', path: '/blog/comments' },
      { id: 3, severity: 'medium', type: 'CSRF', description: 'Cross-site request forgery on profile update', path: '/profile/update' },
      { id: 4, severity: 'low', type: 'Information Disclosure', description: 'Server information leakage in HTTP headers', path: '/' },
      { id: 5, severity: 'info', type: 'Outdated Library', description: 'Using outdated version of jQuery (1.8.3)', path: '/static/js/jquery.min.js' }
    ];
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setResults(prev => {
        const nextIndex = prev.length;
        if (nextIndex < mockResults.length) {
          return [...prev, mockResults[nextIndex]];
        } else {
          clearInterval(interval);
          setIsScanning(false);
          return prev;
        }
      });
    }, 1500);
  };

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Scan', href: '/scan', current: true },
    { name: 'Reports', href: '/reports' },
    { name: 'Tools', href: '/tools' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-sky-600 text-white font-bold text-xl">Scan Page</header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">New Security Scan</h1>
          <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-slate-900 shadow">
            <h2 className="text-xl font-semibold mb-4">Target Configuration</h2>
            <div className="space-y-4">
              <input
                className="input flex-1 border p-2 rounded w-full"
                placeholder="https://example.com or 192.168.1.1"
                value={target}
                onChange={e => setTarget(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Scan Type</label>
                <select className="border p-2 rounded" value={scanType} onChange={e => setScanType(e.target.value as 'full' | 'quick')}>
                  <option value="full">Full Scan</option>
                  <option value="quick">Quick Scan</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow"
                  onClick={startScan}
                  disabled={!target || isScanning}
                >
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </button>
              </div>
            </div>
          </div>
          {/* Scan Results */}
          {(isScanning || results.length > 0) && (
            <div className="p-4 border rounded-lg bg-white dark:bg-slate-900 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Scan Results</h2>
                <span className={`px-2 py-1 rounded text-xs font-bold ${isScanning ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                  {isScanning ? 'Scanning...' : 'Completed'}
                </span>
              </div>
              {isScanning && results.length === 0 && (
                <div className="text-center py-8 text-slate-500">Starting scan on {target}...</div>
              )}
              {results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr className="border-b">
                        <th className="px-2 py-3 font-medium">Severity</th>
                        <th className="px-2 py-3 font-medium">Type</th>
                        <th className="px-2 py-3 font-medium">Description</th>
                        <th className="px-2 py-3 font-medium">Path</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-2 py-3">{result.severity}</td>
                          <td className="px-2 py-3">{result.type}</td>
                          <td className="px-2 py-3">{result.description}</td>
                          <td className="px-2 py-3">{result.path}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 