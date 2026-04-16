import request from 'supertest';
import { app } from '../src/app';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Items API', () => {
  it('GET /api/items returns item array', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('GET /api/items/:id returns 200 for existing item', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.item.id).toBe(1);
  });

  it('GET /api/items/:id returns 404 for missing item', async () => {
    const res = await request(app).get('/api/items/9999');
    expect(res.status).toBe(404);
  });

  it('POST /api/items creates an item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item', description: 'Created in test' });
    expect(res.status).toBe(201);
    expect(res.body.item.name).toBe('Test Item');
    expect(typeof res.body.item.id).toBe('number');
  });

  it('POST /api/items returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/items').send({});
    expect(res.status).toBe(400);
  });

  it('DELETE /api/items/:id returns 204', async () => {
    const created = await request(app)
      .post('/api/items')
      .send({ name: 'To Delete' });
    const id = created.body.item.id as number;
    const res = await request(app).delete(`/api/items/${id}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/items/:id returns 404 for missing item', async () => {
    const res = await request(app).delete('/api/items/9999');
    expect(res.status).toBe(404);
  });

  it('GET unknown route returns 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
