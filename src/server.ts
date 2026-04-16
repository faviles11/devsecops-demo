import { app } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Bind to 0.0.0.0 so the port is reachable from outside the Docker container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
