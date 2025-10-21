const rateLimit = require('express-rate-limit');

const adminLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: parseInt(process.env.ADMIN_RATE_LIMIT || '200'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok:false, error: 'Too many requests' }
});

// Community rate limiting
const communityLimiter = rateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: parseInt(process.env.COMMUNITY_RATE_LIMIT || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok:false, error: 'Too many community requests' }
});

// Strict rate limiting for posting
const postLimiter = rateLimit({
  windowMs: 5*60*1000, // 5 minutes
  max: parseInt(process.env.POST_RATE_LIMIT || '10'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok:false, error: 'Too many posts. Please wait before posting again.' }
});

// Key generation rate limiting
const keyGenLimiter = rateLimit({
  windowMs: 60*1000, // 1 minute
  max: parseInt(process.env.KEY_GEN_RATE_LIMIT || '5'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok:false, error: 'Too many key generation requests' }
});

module.exports = { 
  adminLimiter, 
  communityLimiter, 
  postLimiter, 
  keyGenLimiter 
};
