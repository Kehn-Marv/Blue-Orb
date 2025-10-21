const router = require('express').Router();
const ctrl = require('../controllers/community.controller');
const { communityLimiter, postLimiter, keyGenLimiter } = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(communityLimiter);

// Community (Nostr) endpoints
router.post('/questions', postLimiter, ctrl.postQuestion);
router.get('/questions', ctrl.listQuestions);
router.post('/replies', postLimiter, ctrl.postReply);
router.get('/replies', ctrl.listReplies);
router.get('/replies-by-author', ctrl.listRepliesByAuthor);
router.post('/replies/edit', postLimiter, ctrl.editReply);
router.post('/replies/delete', postLimiter, ctrl.deleteEvent);
router.post('/delete', postLimiter, ctrl.deleteEvent);
router.post('/clear-all', postLimiter, ctrl.clearAllData);

// New endpoints for the updated flow
router.post('/questions/cache', postLimiter, ctrl.cacheQuestion);
router.post('/replies/cache', postLimiter, ctrl.cacheReply);
router.get('/feed', ctrl.getFeed);
router.post('/profile/sync', postLimiter, ctrl.syncProfile);

// Optional: key generation helper
router.get('/keys', keyGenLimiter, ctrl.generateKeys);

// Test endpoint
router.get('/test-relay', ctrl.testRelay);

module.exports = router;


