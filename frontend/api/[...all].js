import { request } from 'http';
import { request as requestHttps } from 'https';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  const backendUrl = process.env.BACKEND_API_URL || process.env.BACKEND_URL;
  if (!backendUrl) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Configuration Error',
        message: 'BACKEND_API_URL environment variable is missing on Vercel.',
      }),
    );
    return;
  }

  // req.url matches the full original request path (e.g. /api/auth/register?query=val)
  const targetUrl = backendUrl.replace(/\/$/, '') + req.url;
  const parsedUrl = new URL(targetUrl);

  const isHttps = parsedUrl.protocol === 'https:';
  const reqFn = isHttps ? requestHttps : request;

  const options = {
    method: req.method,
    headers: { ...req.headers },
  };
  // Delete host header to avoid host mismatch issues on the backend
  delete options.headers.host;

  const proxyReq = reqFn(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Vercel API Proxy error:', err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }));
  });

  req.pipe(proxyReq);
}
