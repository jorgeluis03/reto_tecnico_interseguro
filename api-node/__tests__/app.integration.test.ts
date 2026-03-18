import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /statistics', () => {
  describe('valid payloads', () => {
    it('returns 200 with correct stats for standard matrices', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[1, 2], [3, 4]], R: [[5, 6], [7, 8]] });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        sum: 36,
        max: 8,
        min: 1,
        average: 4.5,
        isDiagonal: { Q: false, R: false },
      });
    });

    it('returns 200 with correct isDiagonal for diagonal matrices', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({
          Q: [[2, 0], [0, 3]],
          R: [[5, 0, 0], [0, 6, 0], [0, 0, 7]],
        });

      expect(res.status).toBe(200);
      expect(res.body.isDiagonal).toEqual({ Q: true, R: true });
    });

    it('returns 200 for empty matrices', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [], R: [] });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        sum: 0,
        max: 0,
        min: 0,
        average: 0,
        isDiagonal: { Q: true, R: true },
      });
    });

    it('returns 200 for single-element matrices', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[10]], R: [[20]] });

      expect(res.status).toBe(200);
      expect(res.body.sum).toBe(30);
      expect(res.body.average).toBe(15);
      expect(res.body.isDiagonal).toEqual({ Q: true, R: true });
    });

    it('handles negative numbers', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[-5, 3]], R: [[0]] });

      expect(res.status).toBe(200);
      expect(res.body.min).toBe(-5);
      expect(res.body.max).toBe(3);
    });
  });

  describe('invalid payloads — 400 responses', () => {
    it('returns 400 when Q is missing', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ R: [[1, 2]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when R is missing', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[1, 2]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when Q contains strings', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [['a', 'b']], R: [[1]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when Q is a flat array instead of 2D', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [1, 2, 3], R: [[1]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when R contains Infinity', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[1]], R: [[Infinity]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when Q contains null values', async () => {
      const res = await request(app)
        .post('/statistics')
        .send({ Q: [[null, 1]], R: [[1]] });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('content-type', () => {
    it('returns 400 or error when body is not JSON', async () => {
      const res = await request(app)
        .post('/statistics')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
