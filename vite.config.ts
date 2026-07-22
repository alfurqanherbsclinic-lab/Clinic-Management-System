import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function oasisSmsProxyPlugin(): Plugin {
  return {
    name: 'oasis-sms-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sms/send', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const { apiKey, sender_id, recipient, message, baseUrl } = body;

            // Target URL - default to standard Oasis API endpoint or custom provided endpoint
            const targetUrl = baseUrl || 'https://api.oasistech.co.tz/v1/sms/send';
            const sender = (sender_id || '').trim() || 'AHC MKONONI';
            const cleanKey = (apiKey || '').trim();

            let formattedPhone = (recipient || '').replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
              formattedPhone = '255' + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('255') && formattedPhone.length === 9) {
              formattedPhone = '255' + formattedPhone;
            }

            // Forward request from server to Oasis Tech server (Server-to-Server bypasses browser CORS)
            const oasisResponse = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`,
                'api-key': cleanKey,
                'X-API-KEY': cleanKey,
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                sender_id: sender,
                sender: sender,
                recipient: formattedPhone,
                mobile: formattedPhone,
                phone: formattedPhone,
                to: formattedPhone,
                message: message,
                text: message,
                api_key: cleanKey,
                apiKey: cleanKey
              }),
            });

            const dataText = await oasisResponse.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = oasisResponse.status;
            res.end(dataText);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                success: false,
                error: 'Server Proxy Error',
                message: `Shida ya mtandao katika server proxy: ${errorMessage}`,
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), oasisSmsProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
