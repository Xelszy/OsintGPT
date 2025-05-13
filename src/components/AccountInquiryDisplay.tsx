import React from 'react';

interface AccountInquiryData {
  // From the actual API response format
  success?: boolean;
  message?: string;
  data?: {
    account_bank?: string;
    account_number?: string;
    account_holder?: string;
    account_name?: string;
    status?: string;
  };
  // For fallback data structure
  status?: boolean;
}

interface AccountInquiryDisplayProps {
  data: AccountInquiryData;
}

const AccountInquiryDisplay: React.FC<AccountInquiryDisplayProps> = ({ data }) => {
  if (!data) {
    return <div>No account data available</div>;
  }

  console.log("Displaying account data:", data);
  
  const accountData = data.data || {};
  // Check for success using either success or status field
  const isSuccess = data.success === true || data.status === true;
  // Use account_holder or account_name, whichever is available
  const accountName = accountData.account_holder || accountData.account_name;

  return (
    <div style={{ 
      background: '#1a1a1a', 
      borderRadius: 8, 
      padding: 16, 
      border: '1px solid #333',
      marginTop: 12
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0', 
        color: isSuccess ? '#00cc89' : '#ff4d4d', 
        fontSize: 18 
      }}>
        {isSuccess ? '✅ Bank Account Information' : '❌ Account Lookup Failed'}
      </h3>
      
      {isSuccess && accountName ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: 12 }}>
            <div style={{ color: '#888' }}>Bank:</div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>{accountData.account_bank}</div>
            
            <div style={{ color: '#888' }}>Account Number:</div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>{accountData.account_number}</div>
            
            <div style={{ color: '#888' }}>Account Name:</div>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>{accountName}</div>
            
            <div style={{ color: '#888' }}>Status:</div>
            <div style={{ color: '#00cc89', fontWeight: 'bold' }}>{data.message || accountData.status || "Valid"}</div>
          </div>
        </div>
      ) : (
        <div style={{ color: '#ff4d4d', marginBottom: 8 }}>
          {data.message || "Could not retrieve account information"}
        </div>
      )}
      
      {/* Debug section - will help diagnose any issues */}
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        borderTop: '1px solid #333', 
        fontSize: 12, 
        color: '#666' 
      }}>
        <details>
          <summary>Debug Info</summary>
          <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default AccountInquiryDisplay; 