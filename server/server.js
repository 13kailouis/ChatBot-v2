// server/server.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'llama-3.1-70b-versatile',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null,
      }),
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();
    console.log('Response text:', text);

    if (contentType && contentType.includes('application/json')) {
      const data = JSON.parse(text);
      res.json({ reply: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'Format respons nggak sesuai harapan' });
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    res.status(500).json({ error: 'Gagal memproses permintaan' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => console.log(`Server jalan di port ${port}`));
