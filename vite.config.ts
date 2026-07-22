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
            const userTargetUrl = baseUrl || 'https://bulksms.oasistech.co.tz/api/sms';
            const sender = (sender_id || '').trim() || 'AHC MKONONI';
            const cleanKey = (apiKey || '').trim() || '39029312930192310239120391203921';

            let formattedPhone = (recipient || '').replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
              formattedPhone = '255' + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('255') && formattedPhone.length === 9) {
              formattedPhone = '255' + formattedPhone;
            }

            // Local 07... format as fallback if needed by provider
            const localPhone = formattedPhone.startsWith('255') 
              ? '0' + formattedPhone.substring(3) 
              : formattedPhone;

            // List of candidate endpoints to attempt if 404/network error occurs
            const candidateUrls = [
              userTargetUrl,
              'https://bulksms.oasistech.co.tz/api/sms',
              'https://bulksms.oasistech.co.tz/api/sms/send',
              'https://api.oasistech.co.tz/v1/sms/send',
              'https://api.oasistech.co.tz/sms/send',
              'https://oasistech.co.tz/api/v1/sms/send'
            ];
            // Remove duplicates while preserving order
            const targetUrls = Array.from(new Set(candidateUrls));

            const requestPayload = {
              sender_id: sender,
              sender: sender,
              from: sender,
              recipient: formattedPhone,
              recipients: [formattedPhone],
              mobile: formattedPhone,
              phone: formattedPhone,
              to: formattedPhone,
              local_phone: localPhone,
              message: message,
              text: message,
              body: message,
              api_key: cleanKey,
              apiKey: cleanKey,
              token: cleanKey
            };

            const requestHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            };

            if (cleanKey) {
              requestHeaders['Authorization'] = `Bearer ${cleanKey}`;
              requestHeaders['api-key'] = cleanKey;
              requestHeaders['X-API-KEY'] = cleanKey;
              requestHeaders['X-Authorization'] = `Bearer ${cleanKey}`;
            }

            let oasisResponse: Response | null = null;
            let lastError: string = '';
            let usedUrl = '';

            for (const url of targetUrls) {
              try {
                usedUrl = url;
                // Append api_key query param as fallback for endpoints expecting URL param
                const fullUrl = cleanKey && !url.includes('api_key') 
                  ? `${url}${url.includes('?') ? '&' : '?'}api_key=${encodeURIComponent(cleanKey)}` 
                  : url;

                const resp = await fetch(fullUrl, {
                  method: 'POST',
                  headers: requestHeaders,
                  body: JSON.stringify(requestPayload),
                });

                // If not 404 or 502/503 bad gateway, keep this response
                if (resp.status !== 404 && resp.status !== 502 && resp.status !== 503) {
                  oasisResponse = resp;
                  break;
                }
                
                // If 404, try next endpoint in loop
                lastError = `HTTP ${resp.status} - Endpoint not found: ${url}`;
              } catch (fetchErr: unknown) {
                lastError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
              }
            }

            if (!oasisResponse) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 502;
              res.end(JSON.stringify({
                success: false,
                error: 'Oasis Endpoint Network Error',
                message: `Imeshindikana kuunganisha na server za Oasis Technology (${usedUrl}). Sababu: ${lastError}`,
                endpoint_attempted: usedUrl
              }));
              return;
            }

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
    plugins: [tailwindcss(), react(), oasisSmsProxyPlugin()],
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
