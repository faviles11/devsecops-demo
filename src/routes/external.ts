import { Router, Request, Response } from 'express';
import axios from 'axios';

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

const router = Router();

// GET /api/external/posts — proxy a public API to demonstrate outbound HTTP via axios
router.get('/posts', async (_req: Request, res: Response) => {
  try {
    const response = await axios.get<Post[]>(`${JSONPLACEHOLDER_BASE_URL}/posts`, {
      timeout: 5000,
    });
    return res.status(200).json({ posts: response.data });
  } catch (err) {
    console.error('Failed to fetch external posts:', err);
    return res.status(502).json({ error: 'Upstream service unavailable' });
  }
});

export { router as externalRouter };
