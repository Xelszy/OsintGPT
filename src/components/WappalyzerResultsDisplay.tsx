import React from 'react';

interface Technology {
  name: string;
  version?: string;
  categories: string[];
  confidence?: number;
  website?: string;
  icon?: string;
}

interface WappalyzerResults {
  technologies: Technology[];
  status: string;
  cached: boolean;
  timestamp: number;
}

interface WappalyzerResultsDisplayProps {
  results: WappalyzerResults;
  url: string;
}

const WappalyzerResultsDisplay: React.FC<WappalyzerResultsDisplayProps> = ({ results, url }) => {
  const { technologies, status, cached, timestamp } = results;
  
  // Group technologies by category
  const techByCategory: Record<string, Technology[]> = {};
  
  technologies.forEach(tech => {
    if (tech.categories && tech.categories.length > 0) {
      tech.categories.forEach(category => {
        if (!techByCategory[category]) {
          techByCategory[category] = [];
        }
        techByCategory[category].push(tech);
      });
    } else {
      // If no category, put it in "Other"
      if (!techByCategory['Other']) {
        techByCategory['Other'] = [];
      }
      techByCategory['Other'].push(tech);
    }
  });
  
  // Get category colors
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'JavaScript Frameworks': '#f1dc56',
      'Web Frameworks': '#61dbfb',
      'Web Servers': '#ff6b6b',
      'Programming Languages': '#56c1f1',
      'CMS': '#a4db6a',
      'Ecommerce': '#f194a3',
      'Analytics': '#ad8bf6',
      'JavaScript Libraries': '#f8ba3c',
      'Marketing': '#f47c64',
      'CDN': '#4dc6b5',
      'Payment Processors': '#83d683',
      'Security': '#7c4dff',
      'Other': '#aaaaaa'
    };
    
    return colors[category] || '#dddddd';
  };
  
  if (status === 'scan_failed') {
    return (
      <div style={{
        background: '#121212',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #333',
        marginTop: '12px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#ff5050' }}>Wappalyzer Scan Failed</h3>
        <p style={{ color: '#ccc' }}>
          Unable to scan {url} for technologies. Please try again later or check if the URL is publicly accessible.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#121212',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #333',
      marginTop: '12px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
        Technology Stack for {url}
      </h3>
      
      {Object.entries(techByCategory).map(([category, techs]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <h4 style={{ 
            color: getCategoryColor(category),
            margin: '0 0 8px 0',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {category}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {techs.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                style={{
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '13px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {tech.icon && (
                  <img 
                    src={tech.icon} 
                    alt={`${tech.name} icon`}
                    style={{ width: '16px', height: '16px' }}
                  />
                )}
                <span>{tech.name}</span>
                {tech.version && (
                  <span style={{ color: '#666' }}>{tech.version}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ 
        marginTop: '16px',
        padding: '8px',
        background: '#1e1e1e',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        {cached ? 'Results from cache • ' : ''}
        Last updated: {new Date(timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default WappalyzerResultsDisplay; 