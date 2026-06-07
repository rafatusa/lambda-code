const request = require('supertest');
const app = require('../app');

describe('GET /api/info', () => {
  beforeEach(() => {
    process.env.APP_NAME = 'test-app';
    process.env.APP_VERSION = '0.0.1';
  });

  afterEach(() => {
    delete process.env.APP_NAME;
    delete process.env.APP_VERSION;
  });

  it('returns 200 with app info', async () => {
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'test-app',
      version: '0.0.1',
      db: 'none',
    });
  });
});

describe('GET /unknown-route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});