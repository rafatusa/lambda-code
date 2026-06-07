const { Router } = require('express');

const router = Router();

/**
 * GET /health
 * Returns a simple health check payload.
 */
router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;