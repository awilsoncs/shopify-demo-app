// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');

const app = express();

// Initialize Shopify API Context with your config
Shopify.Context.initialize({
  API_KEY: functions.config().shopify.key, // set via Firebase functions:config:set
  API_SECRET_KEY: functions.config().shopify.secret,
  SCOPES: ['read_products'], // Adjust scopes as needed
  HOST_NAME: 'your-app-url.web.app', // Update with your Firebase Hosting domain (no protocol)
  IS_EMBEDDED_APP: false, // Change to true if you’re building an embedded app
  API_VERSION: '2023-04', // Use current API version
});

// Route to initiate OAuth
app.get('/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter.');

  // Generate the auth URL and redirect the user
  const authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    shop,
    '/auth/callback',
    false
  );
  return res.redirect(authRoute);
});

// OAuth callback route
app.get('/auth/callback', async (req, res) => {
  try {
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query
    );
    // Here, you’d typically store the session data (e.g., in Firestore)
    return res.send('Shopify app installed successfully!');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send(error.message);
  }
});

// Expose the Express API as a single Cloud Function:
exports.shopifyApp = functions.https.onRequest(app);
