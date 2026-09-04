

---

# 🔍 PulseCheck API

> A lightweight, file-based uptime monitoring API that anyone can use. Track website availability, response times, and history with a simple REST API.

**API Base URL:** `https://pulse-checkerapi.onrender.com`

---

## ✨ Features

- **📊 File-Based Storage** - No database needed, uses JSON files
- **🔓 Public API** - Anyone can use it (CORS enabled)
- **⚡ Simple REST Endpoints** - Easy to integrate
- **🔐 Token Authentication** - Secure monitor management
- **📈 History Tracking** - Stores up to 500 checks per monitor
- **🆓 Completely Free** - Hosted on Render's free tier

---

## 🚀 Quick Start

### Try It Now

```bash
# Get all monitors
curl https://pulse-checkerapi.onrender.com/api/monitors.php

# Create a monitor
curl -X POST https://pulse-checkerapi.onrender.com/api/monitors.php \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Response Example

```json
{
  "success": true,
  "monitor": {
    "id": 1,
    "url": "https://example.com",
    "token": "8f9334bb8127d99f653d01f11500b291b4fe1fefbf7cf34a",
    "status": "pending"
  }
}
```

---

## 📚 API Documentation

### 1. Get All Monitors

**GET** `/api/monitors.php`

Returns all monitors (tokens and history are hidden).

```bash
curl https://pulse-checkerapi.onrender.com/api/monitors.php
```

**Response:**
```json
{
  "success": true,
  "monitors": [
    {
      "id": 1,
      "url": "https://example.com",
      "status": "up",
      "uptime": 99.5,
      "response_time": 125,
      "last_check": "2026-09-04T10:30:00Z",
      "created_at": "2026-09-04T05:58:07-04:00"
    }
  ]
}
```

### 2. Get Specific Monitor

**GET** `/api/monitors.php?id={id}`

```bash
curl https://pulse-checkerapi.onrender.com/api/monitors.php?id=1
```

### 3. Create a Monitor

**POST** `/api/monitors.php`

```bash
curl -X POST https://pulse-checkerapi.onrender.com/api/monitors.php \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

**Response:**
```json
{
  "success": true,
  "monitor": {
    "id": 2,
    "url": "https://google.com",
    "token": "a1b2c3d4e5f67890...",
    "status": "pending"
  }
}
```

⚠️ **IMPORTANT**: Save the `token`! You'll need it to check or delete the monitor.

### 4. Check a Monitor

**POST** `/api/check.php?id={id}`

Requires `X-PulseCheck-Token` header with the monitor's token.

```bash
curl -X POST https://pulse-checkerapi.onrender.com/api/check.php?id=1 \
  -H "X-PulseCheck-Token: YOUR_MONITOR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "monitor_id": 1,
  "status": "up",
  "status_code": 200,
  "response_time": 45,
  "uptime_24h": 99.8,
  "checked_at": "2026-09-04T10:30:00Z"
}
```

### 5. Get Monitor History

**GET** `/api/history.php?id={id}&limit={limit}`

```bash
curl https://pulse-checkerapi.onrender.com/api/history.php?id=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "checks": [
    {
      "status_code": 200,
      "response_time": 45,
      "success": true,
      "error_message": null,
      "checked_at": "2026-09-04T10:30:00Z"
    }
  ]
}
```

### 6. Delete a Monitor

**DELETE** `/api/monitors.php`

Requires `X-PulseCheck-Token` header with the monitor's token.

```bash
curl -X DELETE https://pulse-checkerapi.onrender.com/api/monitors.php \
  -H "X-PulseCheck-Token: YOUR_MONITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

---

## 🎯 Use Cases

### Frontend Dashboard
Build a dashboard to display monitor statuses and history. The API includes CORS headers for cross-origin requests.

### Slack/Email Alerts
Set up automated alerts when a monitor goes down. Check status via the API and trigger notifications.

### Status Page
Create a public status page showing uptime for all your services.

### Custom Analytics
Track response times and uptime trends for your websites.

---

## 🔒 Authentication

Monitors are secured with individual tokens:
- Tokens are generated on creation
- Required for checking and deleting monitors
- Never stored in the API (only in JSON files)
- Store tokens securely on the client side

---

## 📦 Storage

The API uses **file-based storage** - no database needed!

```
monitors/
├── monitor_1.json
├── monitor_2.json
└── monitor_*.json
```

Each JSON file contains:
- Monitor URL
- Token
- Status history (last 500 checks)
- Uptime statistics

---

## 🤖 Cron Job for Auto-Checks

To automatically check all monitors every 5 minutes, set up a cron job:

**Endpoint:** `/cron.php?secret=YOUR_CRON_SECRET`

Set the `PULSECHECK_CRON_SECRET` environment variable in Render.

```bash
curl https://pulse-checkerapi.onrender.com/cron.php?secret=YOUR_CRON_SECRET
```

**Set up on cron-job.org:**
```
URL: https://pulse-checkerapi.onrender.com/cron.php?secret=YOUR_SECRET
Interval: Every 5 minutes
```

---

## 🌐 CORS Support

CORS is fully enabled for all endpoints:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, X-PulseCheck-Token`

---

## 🏗️ Self-Hosting

### Deploy to Render

1. Fork the repository
2. Create a new Web Service on Render
3. Use these settings:
   - **Environment**: Docker
   - **Build Command**: (leave default)
   - **Start Command**: (leave default)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PULSECHECK_CRON_SECRET` | Secret for cron endpoint (required for auto-checks) |

---

## 📡 API Status

Check if the API is online:
```bash
curl https://pulse-checkerapi.onrender.com/
```

**Response:**
```json
{
  "name": "PulseCheck API",
  "version": "2.0.0",
  "storage": "file-based",
  "status": "online"
}
```

---

## 🛠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthorized (missing token) |
| 403 | Invalid token |
| 404 | Monitor not found |
| 405 | Method not allowed |
| 422 | Invalid input |
| 500 | Server error |

---

## 💻 Examples

### JavaScript (Frontend)

```javascript
// Create a monitor
const response = await fetch('https://pulse-checkerapi.onrender.com/api/monitors.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
});

const data = await response.json();
console.log('Monitor created:', data.monitor);

// Check the monitor (with token from response)
const checkResponse = await fetch(`https://pulse-checkerapi.onrender.com/api/check.php?id=${data.monitor.id}`, {
    method: 'POST',
    headers: { 'X-PulseCheck-Token': data.monitor.token }
});

const checkData = await checkResponse.json();
console.log('Status:', checkData.status);
```

### Python

```python
import requests

# Create a monitor
response = requests.post(
    'https://pulse-checkerapi.onrender.com/api/monitors.php',
    json={'url': 'https://example.com'}
)
data = response.json()
monitor = data['monitor']

# Check the monitor
check_response = requests.post(
    f'https://pulse-checkerapi.onrender.com/api/check.php?id={monitor["id"]}',
    headers={'X-PulseCheck-Token': monitor['token']}
)
print(check_response.json())
```

### React Native

```javascript
const checkMonitor = async (id, token) => {
  const response = await fetch(
    `https://pulse-checkerapi.onrender.com/api/check.php?id=${id}`,
    {
      method: 'POST',
      headers: { 'X-PulseCheck-Token': token }
    }
  );
  return await response.json();
};
```

---

## 📝 License

MIT License - Free to use and modify.

---

## 🙏 Credits

Built with:
- **PHP** - Backend logic
- **cURL** - Website checking
- **JSON** - Data storage
- **Render** - Hosting platform

---

## 🔗 Links

- **API URL:** https://pulse-checkerapi.onrender.com
- **Repository:** [Your GitHub Repo]
- **Issue Tracker:** [Your Issues Link]

---

*Made for developers who need simple, reliable uptime monitoring* 🚀
