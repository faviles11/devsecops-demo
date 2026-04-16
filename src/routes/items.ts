import { Router, Request, Response } from 'express';

interface Item {
  id: number;
  name: string;
  description: string;
}

// In-memory store — no database required
const items: Item[] = [
  { id: 1, name: 'Widget A', description: 'A sample widget' },
  { id: 2, name: 'Widget B', description: 'Another widget' },
];
let nextId = 3;

const router = Router();

// GET /api/items — list all items
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ items });
});

// GET /api/items/:id — get one item
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }
  return res.status(200).json({ item });
});

// POST /api/items — create an item
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const newItem: Item = { id: nextId++, name, description: description ?? '' };
  items.push(newItem);
  return res.status(201).json({ item: newItem });
});

// DELETE /api/items/:id — remove an item
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }
  items.splice(index, 1);
  return res.status(204).send();
});

export { router as itemsRouter };
