import express, { Application, Request, Response, NextFunction } from 'express';
import { itemsRouter } from './routes/items';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — ZAP uses this to confirm the app is alive before scanning
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Items resource
app.use('/api/items', itemsRouter);

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
