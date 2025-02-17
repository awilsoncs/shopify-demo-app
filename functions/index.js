// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');

const app = express();

// Initialize Shopify API Context
Shopify.Context.initialize({
  API_KEY: functions.config().shopify.key,         // Set via Firebase config
  API_SECRET_KEY: functions.config().shopify.secret, // Set via Firebase config
  SCOPES: ['read_products'],                         // Adjust scopes as needed
  HOST_NAME: 'your-project-id.web.app',              // Your Firebase Hosting domain (without protocol)
  IS_EMBEDDED_APP: false,                           // Change to true if using embedded app features
  API_VERSION: '2023-04',                           // Use an API version that works for you
});

// Route to initiate OAuth
app.get('/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter.');

  // Generate the auth URL and redirect the user
  try {
    const authRoute = await Shopify.Auth.beginAuth(
      req,
      res,
      shop,
      '/auth/callback',
      false
    );
    return res.redirect(authRoute);
  } catch (error) {
    console.error('Error during OAuth initiation:', error);
    return res.status(500).send(error.message);
  }
});

// OAuth callback route
app.get('/auth/callback', async (req, res) => {
  try {
    const session = await Shopify.Auth.validateAuthCallback(req, res, req.query);
    // Save the session details as needed (e.g., in Firestore)
    return res.send('Shopify app installed successfully!');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send(error.message);
  }
});

// Export the Express app as a Cloud Function named "shopifyApp"
exports.shopifyApp = functions.https.onRequest(app);
