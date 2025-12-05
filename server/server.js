// server/server.js
require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 4242;

// Middleware
// We use raw body for webhooks, and json for other routes
app.use(cors({ origin: process.env.DOMAIN }));

// --- Protected Files Setup (In a real app, this should be a secure folder outside public access)
const PDF_FILE_PATH = path.join(__dirname, 'the_secret_pdf.pdf');
// NOTE: You must create a dummy file named 'the_secret_pdf.pdf' in the server folder for testing.

// Dummy Database (In production, use MongoDB/Postgres)
const fulfilledOrders = new Set(); 

// --- 1. Endpoint to Create Stripe Checkout Session ---
app.post('/create-checkout-session', express.json(), async (req, res) => {
  const { priceId } = req.body; // In a real app, you would validate this priceId against a product database

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SaoeB02Zh2IfMPkMnEpZ2gs', // **TODO: REPLACE WITH YOUR STRIPE PRICE ID**
          quantity: 1,
        },
      ],
      mode: 'payment',
      // The URLs Stripe redirects the user to after payment.
      success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
    });

    res.json({ sessionUrl: session.url }); 
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send({ error: error.message });
  }
});


// --- 2. Stripe Webhook Endpoint (Critical for Fulfillment) ---
// Note: This must be exposed publicly using a tool like ngrok during local development.
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe using the Webhook Secret
    // NOTE: Replace 'whsec_...' with your actual Webhook Secret from Stripe Dashboard
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_TEST_YOUR_WEBHOOK_SECRET');
  } catch (err) {
    // If signature verification fails
    console.log(`⚠️ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // FULFILLMENT LOGIC: This is where you grant access to the PDF
    console.log('✅ Payment successful for session:', session.id);
    
    // 1. Generate a secure, time-limited token/link (for this example, we just store the session ID)
    const sessionId = session.id;
    fulfilledOrders.add(sessionId); // Store the session ID as proof of purchase

    // 2. In a real app, you would now send an email to session.customer_details.email 
    //    with the unique download link: `${process.env.DOMAIN}/download/${sessionId}`

    console.log(`Order fulfilled for customer email: ${session.customer_details.email}`);
  } else {
    // Handle other event types (e.g., failed payment, subscription events)
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 to acknowledge receipt of the event
  res.send();
});


// --- 3. Protected Download Endpoint ---
app.get('/download/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Check if this session ID is in our set of fulfilled orders
  if (fulfilledOrders.has(sessionId)) {
    console.log(`Downloading PDF for authorized session: ${sessionId}`);
    // Use res.download to force the browser to download the file
    res.download(PDF_FILE_PATH, 'YourAwesomeBook.pdf', (err) => {
      if (err) {
        console.error("Error serving file:", err);
        res.status(500).send("Could not download file.");
      }
    });

    // OPTIONAL: Remove the session ID from the set after one use for true one-time download link
    // fulfilledOrders.delete(sessionId); 
  } else {
    res.status(403).send('Access Denied. Invalid or expired download link.');
  }
});

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));