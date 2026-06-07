const { Router } = require('express');

const router = Router();

/**
 * GET /api/info
 * Returns application metadata.
 */
router.get('/info', (_req, res) => {
  res.status(200).json({
    name: process.env.APP_NAME || 'my-api-lambda',
    version: process.env.APP_VERSION || '1.0.0',
    db: 'none',
  });
});

module.exports = router;