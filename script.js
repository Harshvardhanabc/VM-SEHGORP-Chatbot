const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const startChatBtn = document.getElementById('start-chat-btn');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Your actual Google Gemini API Key
const apiKey = 'AIzaSyAlpZ_o1PT86KTMnU0LO2oi5PN7bENHtbA';
const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

// Show Chat Screen and hide Welcome Screen
startChatBtn.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  addMessage('Hello! How can I assist you?', 'bot');
});

// Handle Send Button click
sendBtn.addEventListener('click', () => {
  let message = userInput.value;
  if (message) {
    message = removeAsterisks(message); // Remove asterisks before sending
    addMessage(message, 'user');
    userInput.value = ''; // Clear input box
    setTimeout(() => {
      botReply(message); // Send message after a delay
    }, 1000);
  }
});

// Function to remove asterisks from the message
function removeAsterisks(message) {
  return message.replace(/\*/g, ''); // Regular expression to replace all * with an empty string
}

// Add message to chat box
function addMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.innerText = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom of chat box
}

// Bot Reply with API
async function botReply(userMessage) {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage,  // The user input sent to the API
              }
            ]
          }
        ]
      }),
    });

    const rawResponse = await response.text(); // Capture raw response text
    console.log('Raw API Response:', rawResponse);  // Log raw response

    let data;
    try {
      data = JSON.parse(rawResponse); // Parse JSON response
    } catch (e) {
      console.error('Error parsing JSON:', e);
      addMessage('Error: Received an invalid response format from the API.', 'bot');
      return;
    }

    // Log the parsed JSON data for inspection
    console.log('Parsed API Response:', data);

    if (response.ok) {
      // Check for the expected structure in the API response
      if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        const botMessage = data.candidates[0].content.parts[0].text.trim(); // Extract bot's message
        addMessage(botMessage, 'bot'); // Show the bot's response
      } else {
        // Fallback message if the structure is not as expected
        addMessage('I don’t have an answer for that right now.', 'bot');
        console.error('Unexpected response format:', data);
      }
    } else {
      addMessage('Oops! Something went wrong. Please try again.', 'bot');
      console.error('API Error - Status:', response.status, 'Response:', data);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    addMessage('Error in fetching response. Please try again.', 'bot');
  }
}
