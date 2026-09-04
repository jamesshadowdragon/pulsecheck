export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PulseCheck-Token');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const API_URL = 'https://pulse-checkerapi.onrender.com';
    
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
    
    let targetUrl = API_URL + targetPath;
    
    const params = { ...req.query };
    delete params.path;
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
        targetUrl += '?' + queryString;
    }
    
    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (req.headers['x-pulsecheck-token']) {
            fetchOptions.headers['X-PulseCheck-Token'] = req.headers['x-pulsecheck-token'];
        }
        
        if (req.method === 'POST' || req.method === 'DELETE') {
            fetchOptions.body = JSON.stringify(req.body);
        }
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();
        
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
}
