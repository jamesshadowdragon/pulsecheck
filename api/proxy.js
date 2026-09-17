export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PulseCheck-Token');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const API_URL = process.env.PULSECHECK_API_URL || 'https://pulsecheckapi.eu.cc';
    const routes = {
        monitors: '/api/monitors.php',
        check: '/api/check.php',
        history: '/api/history.php'
    };

    const path = typeof req.query?.path === 'string' ? req.query.path : 'monitors';
    const targetPath = routes[path];
    if (!targetPath) return res.status(400).json({ error: 'Invalid API path.' });

    const targetUrl = new URL(targetPath, `${API_URL.replace(/\/$/, '')}/`);
    for (const [key, value] of Object.entries(req.query || {})) {
        if (key === 'path' || value === undefined) continue;
        if (Array.isArray(value)) value.forEach(item => targetUrl.searchParams.append(key, String(item)));
        else targetUrl.searchParams.set(key, String(value));
    }

    const headers = { Accept: 'application/json' };
    const token = req.headers['x-pulsecheck-token'];
    if (token) headers['X-PulseCheck-Token'] = token;

    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (hasBody) headers['Content-Type'] = req.headers['content-type'] || 'application/json';

    try {
        const upstream = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: hasBody ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})) : undefined
        });
        const raw = await upstream.text();
        const contentType = upstream.headers.get('content-type') || 'application/json';
        res.status(upstream.status).setHeader('Content-Type', contentType);
        if (contentType.includes('application/json')) {
            try { return res.json(raw ? JSON.parse(raw) : {}); }
            catch { return res.json({ error: 'API returned invalid JSON', raw }); }
        }
        return res.send(raw);
    } catch (error) {
        console.error('Proxy request failed:', error);
        return res.status(502).json({ error: 'Unable to reach API server' });
    }
}
