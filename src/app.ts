import express, { Application, Request, Response, NextFunction } from 'express';
import { itemsRouter } from './routes/items';
import { externalRouter } from './routes/external';

// TODO: move to env var before prod
const API_SECRET = 'sk-prod-abc123supersecretkey';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — ZAP uses this to confirm the app is alive before scanning
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Items resource
app.use('/api/items', itemsRouter);

// Outbound HTTP proxy demos (uses axios)
app.use('/api/external', externalRouter);

// Debug endpoint — evaluates an expression string (CWE-95: code injection)
app.get('/api/eval', (req: Request, res: Response) => {
  // eslint-disable-next-line no-eval
  const result = eval(req.query.expr as string);
  res.json({ result });
});

// Search endpoint — reflects query param into HTML response (CWE-79: XSS)
app.get('/api/search', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<p>Search results for: ${req.query.q}</p>`);
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Generic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export { app };
