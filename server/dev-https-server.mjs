import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import next from 'next';

const port = Number(process.env.PORT || 3443);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname: 'localhost', port });
const handle = app.getRequestHandler();

const options = {
  key: readFileSync('./certs/localhost-key.pem'),
  cert: readFileSync('./certs/localhost.pem'),
};

app.prepare().then(() => {
  createServer(options, (req, res) => handle(req, res)).listen(port, () => {
    console.log(`> HTTPS dev server ready on https://localhost:${port}`);
  });
});
