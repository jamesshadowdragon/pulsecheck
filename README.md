# 📊 PulseCheck Dashboard

> A beautiful, real-time uptime monitoring dashboard for tracking website availability, response times, and performance history. This frontend connects to the public PulseCheck API.

**Live Demo:** [https://pulsecheck-umber.vercel.app](https://pulsecheck-umber.vercel.app)

---

## ✨ Features

- **📈 Real-time Monitoring** - Track uptime and response times for all your websites
- **🟢 Status Indicators** - Visual status badges (Online/Offline/Pending)
- **⚡ Instant Checks** - Manually trigger checks or rely on automated cron jobs
- **📊 History Tracking** - View detailed check history for each monitor
- **🔐 Secure Token Storage** - Tokens stored in browser localStorage, never exposed
- **🎨 Dark Theme** - Beautiful, modern dark interface optimized for monitoring
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/logicnestxvoidlure/pulse-checker)

Or manually:

```bash
# Clone the repository
git clone https://github.com/logicnestxvoidlure/pulse-checker
cd pulse-checker/frontend

# Deploy to Vercel
vercel --prod
```

### Manual Deployment

Just upload these three files to any static hosting service:

```
index.html    # Main dashboard
styles.css    # Dark theme styles
app.js        # Full JavaScript application
```

---

## 🔧 Configuration

### Using the Default API (Recommended)

The dashboard is pre-configured to use the public PulseCheck API:

```
https://pulseapi-production-3976.up.railway.app/
```

### Using Your Own API

To use a different API backend:

1. Open `app.js`
2. Find this line:
   ```javascript
   const API = "/api/proxy.js";
   ```
3. Replace with your API URL:
   ```javascript
   const API = "https://your-api-domain.com";
   ```

### Using the Vercel Proxy (Optional)

If you want to use the Vercel proxy to avoid CORS issues:

1. Open `api/proxy.js`
2. Find this line:
   ```javascript
   const API_URL = 'https://pulseapi-production-3976.up.railway.app/';
   ```
3. Replace with your API URL:
   ```javascript
   const API_URL = 'https://your-api-domain.com';
   ```

---

## 📁 Project Structure

```
frontend/
├── index.html          # Main HTML page
├── styles.css          # Dark theme styles
├── app.js              # Full JavaScript application
└── api/                # Vercel proxy (optional)
    └── proxy.js        # CORS proxy for API requests
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Dark theme with CSS variables
- **JavaScript (ES6+)** - Vanilla JS, no dependencies
- **Vercel** - Frontend deployment (optional proxy)
- **LocalStorage** - Secure token storage

---

## 🔐 Security

- **Tokens**: Stored in browser localStorage only
- **API Keys**: Never exposed in client-side code
- **CORS**: Fully supported by the public API
- **CSRF**: Tokens required for all write operations

---

## 📡 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/monitors.php` | GET | List all monitors |
| `/api/monitors.php` | POST | Create new monitor |
| `/api/monitors.php` | DELETE | Delete monitor |
| `/api/check.php` | POST | Check a monitor |
| `/api/history.php` | GET | Get check history |

All endpoints require the `X-PulseCheck-Token` header for write operations.

---

## 🎨 Dashboard Preview

```
┌──────────────────────────────────────────────────────────┐
│ ● PulseCheck                    API online ✅          │
│                                                        │
│ UPTIME MONITORING                                      │
│ Know when your                                         │
│ site goes down.                                       │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │  New monitor                                     │  │
│ │  Website URL                                      │  │
│ │  [https://example.com]                           │  │
│ │  [Add monitor →]                                 │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │Total     │ │Online    │ │Offline   │ │Avg. resp │ │
│ │   5      │ │   4      │ │   1      │ │ 125 ms   │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │  YOUR MONITORS                    [Refresh]     │  │
│ │                                                    │  │
│ │ ● google.com            🟢 Online  45 ms          │  │
│ │   https://google.com     [History][Check][Delete] │  │
│ │                                                    │  │
│ │ ● example.com           🔴 Offline  —             │  │
│ │   https://example.com    [History][Check][Delete] │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### CORS Errors
The public API has CORS enabled. If you're using your own API, ensure CORS headers are configured:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-PulseCheck-Token');
```

### API Unavailable
- Verify the API URL in `app.js`
- Check if the API is running
- Test the API directly in your browser

### Monitors Always "Pending"
- The cron job on the backend isn't running
- Manually click "Check now" to test
- Contact the API provider about auto-checking

---

## 🔗 Links

- **Live Demo:** https://pulsecheck-umber.vercel.app
- **Backend API:** https://pulseapi-production-3976.up.railway.app/
- **Repository:** https://github.com/logicnestxvoidlure/pulse-checker
- **API Documentation:** [API Docs](https://pulsecheck-umber.vercel.app/apidocs.html)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **PulseCheck API** - Backend monitoring service by [logicnestxvoidlure](https://github.com/logicnestxvoidlure)
- **Vercel** - Frontend hosting platform

---

*Built with ❤️ for reliable uptime monitoring*

**Star ⭐ the repo if you find it useful!**
