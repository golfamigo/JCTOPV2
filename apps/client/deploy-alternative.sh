#!/bin/bash

echo "Alternative Zeabur deployment using development server..."

# Create a simple server.js for production
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from public directory (for assets)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// For SPA routing, serve index.html for all non-asset routes
app.get('*', (req, res) => {
  // In production, we'll use the Expo dev server
  // For now, redirect to the dev server
  res.redirect('http://localhost:8081');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

echo "Created alternative deployment configuration."
echo "This approach uses the Expo development server."