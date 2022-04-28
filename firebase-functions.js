import { App } from 'astro/app';
import { polyfill } from '@astrojs/webapi';
import functions from 'firebase-functions';

polyfill(globalThis, {
  exclude: 'window document',
});

export const createExports = (manifest) => {
  const app = new App(manifest);

  const handler = functions.https.onRequest(async (req, res) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers)
    });
    
    if (!app.match(request)) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

    const { status, headers, body } = await app.render(request);

    res.writeHead(status, Object.fromEntries(headers.entries()));
    if (body) {
      for await (const chunk of body) {
        res.write(chunk);
      }
    }
    res.end();
  });

  return { handler };
};