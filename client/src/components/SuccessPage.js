// client/src/SuccessPage.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function SuccessPage() {
  const location = useLocation();
  const [downloadLink, setDownloadLink] = useState(null);
  
  // Extract the session ID from the URL query parameter
  const sessionId = new URLSearchParams(location.search).get('session_id');

  useEffect(() => {
    if (sessionId) {
      // NOTE: In the real, secure flow, you would NOT expose the session ID 
      // directly to the client. The server would have already EMAILED the
      // secure link to the customer via the webhook.
      
      // For this simple example, we construct the direct download link 
      // using the session ID provided by Stripe's redirect URL.
      setDownloadLink(`http://localhost:4242/download/${sessionId}`);
    }
  }, [sessionId]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'green' }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your purchase. Your payment has been confirmed.</p>
      
      {downloadLink ? (
        <>
          <p>Click the link below to download your guide:</p>
          <a href={downloadLink} target="_blank" rel="noopener noreferrer"
             style={{ fontSize: '18px', color: '#6772E5' }}>
            Download Your PDF
          </a>
          <p>A confirmation email with this link has been sent (simulated).</p>
        </>
      ) : (
        <p>Confirming your order...</p>
      )}
    </div>
  );
}
export default SuccessPage;