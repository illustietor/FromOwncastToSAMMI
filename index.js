const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Environment configuration
const sammiIP = process.env.SAMMI_IP || '127.0.0.1';
const sammiPort = process.env.SAMMI_PORT || '9450';
const SAMMI_URL = `http://${sammiIP}:${sammiPort}/webhook`;

const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || '';
const SAMMI_API_KEY = process.env.SAMMI_API_KEY || '';
const PORT = 3000;

// Owncast → SAMMI event handlers
const eventHandlers = {
  CHAT: (data) => ({
    trigger: "chatEvent",
    customData: data.eventData.rawBody || "",
    customObjectData: {
      userId: data.eventData.user.id,
      userName: data.eventData.user.displayName,
      timestamp: data.eventData.timestamp
    },
    customArrayData: []
  }),
  USER_JOINED: (data) => ({
    trigger: "userJoined",
    customData: data.eventData.user.displayName,
    customObjectData: {
      userId: data.eventData.user.id,
      joinedAt: data.eventData.timestamp
    },
    customArrayData: []
  }),
  NAME_CHANGE: (data) => ({
    trigger: "nameChanged",
    customData: data.eventData.user.displayName,
    customObjectData: {
      userId: data.eventData.user.id,
      previousNames: data.eventData.user.previousNames || [],
      changedAt: data.eventData.timestamp
    },
    customArrayData: []
  }),
  STREAM_STARTED: (data) => ({
    trigger: "streamStarted",
    customData: "Stream started",
    customObjectData: {
      streamId: data.eventData.streamId || "unknown",
      startedAt: data.eventData.timestamp
    },
    customArrayData: []
  }),
  STREAM_STOPPED: (data) => ({
    trigger: "streamStopped",
    customData: "Stream stopped",
    customObjectData: {
      streamId: data.eventData.streamId || "unknown",
      stoppedAt: data.eventData.timestamp
    },
    customArrayData: []
  }),
  STREAM_TITLE_UPDATED: (data) => ({
    trigger: "streamTitleUpdated",
    customData: data.eventData.title || "",
    customObjectData: {
      streamId: data.eventData.streamId || "unknown",
      updatedAt: data.eventData.timestamp
    },
    customArrayData: []
  }),
  "VISIBILITY-UPDATE": (data) => ({
    trigger: "visibilityUpdate",
    customData: data.eventData.visibility || "",
    customObjectData: {
      updatedAt: data.eventData.timestamp
    },
    customArrayData: []
  })
};

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const token = req.query.token;

    if (WEBHOOK_TOKEN && token !== WEBHOOK_TOKEN) {
      console.warn(`🔐 Unauthorized access attempt from ${req.ip} with token: ${token}`);
      return res.status(401).send('Unauthorized');
    }

    const data = req.body;

    if (!data || typeof data !== 'object' || !data.type) {
      console.warn(`⚠️ Malformed webhook received from ${req.ip}`);
      return res.status(400).send("Invalid webhook payload");
    }

    console.log(`📨 Webhook received: type ${data.type} from ${req.ip}`);

    const handler = eventHandlers[data.type];
    if (!handler) {
      console.warn(`⚠️ Unsupported event type: ${data.type}`);
      return res.status(400).send(`Unsupported event type: ${data.type}`);
    }

    const payload = handler(data);

    const axiosConfig = {};
    if (SAMMI_API_KEY) {
      axiosConfig.headers = {
        'Authorization': SAMMI_API_KEY
      };
    }

    await axios.post(SAMMI_URL, payload, axiosConfig);
    console.log(`✅ Webhook forwarded to SAMMI: ${data.type}`);
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Error processing webhook:', error.stack || error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Global error handling
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught exception:', err.stack || err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled rejection:', reason);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}, forwarding to ${SAMMI_URL}`);
});
