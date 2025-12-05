// client/src/CancelPage.js
import React from 'react';

function CancelPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
      <h1>❌ Payment Canceled</h1>
      <p>Your payment was not completed. Please try again or contact support.</p>
    </div>
  );
}
export default CancelPage;