# From Owncast to SAMMI (Webhook Bridge)

A lightweight Node.js server that listens for webhooks from an [Owncast](https://owncast.online/) instance, transforms the event data, and forwards it to a local [SAMMI](https://sammi.solutions/) client.

This allows you to automate SAMMI buttons and actions based on events from your Owncast stream — such as chat messages, stream status, or user activity.

---

## ✨ Features

- Receives JSON webhooks from Owncast
- Parses and transforms event data
- Forwards events to a local SAMMI instance via HTTP POST
- Supports optional security:
  - Token authentication for Owncast → server
  - API key authentication for server → SAMMI
- Docker-ready and easy to deploy

---

## 📦 Requirements

- Node.js 18+ **(if running manually)**
- Docker & Docker Compose **(recommended)**
- Owncast configured to send webhooks
- SAMMI client running on the same network

---

## 🚀 How to Use

### 🔧 With Docker Compose

1. Clone the repository and go to the project folder.
2. Edit the `docker-compose.yml` file to set your own values for:

```yaml
WEBHOOK_TOKEN: "your_secure_token_here"
SAMMI_IP: "127.0.0.1"
SAMMI_PORT: "9450"
SAMMI_API_KEY: "your_sammi_api_key"
```

3. Start the server:
```bash
docker-compose up -d
```

---

### 🧪 Manual Test

You can test the server with curl:

```bash
curl -X POST "http://localhost:3000/webhook?token=your_secure_token_here" \
  -H "Content-Type: application/json" \
  -d '{"type":"CHAT","eventData":{"rawBody":"Test message","user":{"id":"abc123","displayName":"TestUser"},"timestamp":1234567890}}'
```

---

## 🔁 Supported Owncast Events

- CHAT → Chat message

- USER_JOINED → New viewer joins

- NAME_CHANGED → Viewer changes name

- STREAM_STARTED → Stream goes live

- STREAM_STOPPED → Stream ends

- STREAM_TITLE_UPDATED → Title of stream changes

- VISIBILITY-UPDATE → Visibility mode changes (e.g. unlisted/public)

---

## 🔒 Security
- Requests from Owncast must include a token as a query parameter:
Example: http://your-server.com/webhook?token=your_secure_token

- Requests to SAMMI may include an API key (if enabled) in the Authorization header.

---

## 📄 License

This project is licensed under the MIT License.
