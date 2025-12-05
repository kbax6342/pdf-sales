// client/src/ProductPage.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// **TODO: REPLACE WITH YOUR STRIPE PUBLIC KEY**
const stripePromise = loadStripe('pk_test_51SanoE02Zh2IfMPkIr6KufuZqq5u6KPA20YbIaYIEjYs3TDsDVD38eB0fvUPh5IIRJvIIl1ydldZhfCBjiKObw15002QPDvqms');

const PDF_PRICE_ID = 'prod_TXuTzIKjTianwX'; // **TODO: MATCH THE PRICE ID IN SERVER.JS**

function ProductPage() {
  const handleBuyClick = async () => {
    try {
      // 1. Get Stripe instance
      const stripe = await stripePromise;

      // 2. Call your backend to create a Checkout Session
      const response = await fetch('http://localhost:4242/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PDF_PRICE_ID }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session.');
      }

      const { sessionUrl } = await response.json();
      
      if (sessionUrl) {
        window.location.href = sessionUrl;
    } else {
        throw new Error("Missing session URL from server response.");
    }

      // 3. Redirect to Stripe Checkout
      // const result = await stripe.redirectToCheckout({
      //   sessionId: session.id,
      // });

      // if (result.error) {
      //   // Display error message to your user
      //   console.error(result.error.message);
      // }
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>📘 The Ultimate PDF Guide to Selling PDFs</h1>
      <p>A comprehensive, 50-page guide on e-commerce for digital products.</p>
      <h2>$19.99</h2>
      <button 
        onClick={handleBuyClick} 
        style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#6772E5', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Buy Now (Pay with Stripe)
      </button>
    </div>
  );
}

export default ProductPage;