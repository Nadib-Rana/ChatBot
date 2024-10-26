require('dotenv').config({ path: './chatbot.env' });
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Load API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("API key is missing. Please check your .env file.");
  process.exit(1);  // Exit if API key is not found
}

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Define the model with system instructions
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "Your name is Nadib. You are an English teacher. You help students with language skills. You can identify errors in sentences and provide corrections. Your answers should be short and clear."
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (like your HTML file)
app.use(express.static('public'));

// Store the chat session
const chatSessions = {}; // Store sessions by user ID

// Endpoint to handle chat messages
app.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body; // Get message and user ID from request body

    // Initialize chat session for the user if it doesn't exist
    if (!chatSessions[userId]) {
      chatSessions[userId] = model.startChat({});
      // Send introduction message only once per user
      const introMessage = await chatSessions[userId].sendMessage("Hello! I need to introduce myself.");
      return res.json({ response: introMessage.response.text() }); // Send back the introduction response
    }

    // For subsequent messages, send the user message
    const result = await chatSessions[userId].sendMessage(message);
    res.json({ response: result.response.text() }); // Send back the response
  } catch (error) {
    console.error("Error in chat session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
