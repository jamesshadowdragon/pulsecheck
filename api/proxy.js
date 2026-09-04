// api/proxy.js - Vercel Serverless Function

export default async function handler(req, res) {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PulseCheck-Token');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Your Render API URL
    const API_URL = 'https://pulse-checkerapi.onrender.com';
    
    // Determine which endpoint to call
    const path = req.query.path || 'monitors';
    let targetPath = '';
    
    switch (path) {
        case 'monitors':
            targetPath = '/api/monitors.php';
            break;
        case 'check':
            targetPath = '/api/check.php';
            break;
        case 'history':
            targetPath = '/api/history.php';
            break;
        default:
            targetPath = '/api/monitors.php';
    }
    
    // Build the target URL
    let targetUrl = API_URL + targetPath;
    
    // Forward query parameters
    const params = { ...req.query };
    delete params.path;
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
        targetUrl += '?' + queryString;
    }
    
    try {
        // Forward the request to Render
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        // Forward X-PulseCheck-Token if present
        if (req.headers['x-pulsecheck-token']) {
            fetchOptions.headers['X-PulseCheck-Token'] = req.headers['x-pulsecheck-token'];
        }
        
        // Forward body for POST/DELETE
        if (req.method === 'POST' || req.method === 'DELETE') {
            fetchOptions.body = JSON.stringify(req.body);
        }
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();
        
        // Return the response
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
}
