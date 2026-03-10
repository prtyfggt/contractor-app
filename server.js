// 1. Import the Express library
const express = require('express');

// 2. Initialize the app
const app = express();

// 3. Set the port number
const PORT = 3000;

// 4. Middleware: This allows the app to read JSON data sent from a frontend
app.use(express.json());

// 5. Create a "Home" route
app.get('/', (req, res) => {
    res.send('The Contractor App backend is officially running for Ryan Freeman!');
});

// 6. Start the server
app.listen(PORT, () => {
    console.log(`✅ Success! Your server is running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});