const { handler } = require('../handler');

describe('Lambda handler', () => {
  it('exports a callable handler function', () => {
    expect(typeof handler).toBe('function');
  });

  it('responds to a simulated API Gateway GET /health event', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/health',
      headers: {},
      queryStringParameters: null,
      body: null,
      isBase64Encoded: false,
    };

    const context = {
      callbackWaitsForEmptyEventLoop: false,
    };

    const response = await handler(event, context);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ status: 'ok' });
  });
});