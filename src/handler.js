const serverless = require('serverless-http');
const app = require('./app');

/**
 * AWS Lambda handler.
 * serverless-http wraps the Express app so it can handle
 * API Gateway (REST & HTTP API) proxy events.
 */
const handler = serverless(app);

module.exports = { handler };