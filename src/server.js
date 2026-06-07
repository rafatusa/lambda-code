/**
 * Local development server entry-point.
 * Not used by Lambda — Lambda uses src/handler.js.
 */
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[server] Listening on http://${HOST}:${PORT}`);
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
});