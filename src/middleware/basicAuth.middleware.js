module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const envUser = process.env.ADMIN_USER;
  const envPass = process.env.ADMIN_PASS;
  
  if (!envUser || !envPass) {
    console.error('Admin credentials not configured. Please set ADMIN_USER and ADMIN_PASS environment variables.');
    return res.status(500).json({ ok: false, error: 'Server configuration error' });
  }
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ ok:false, error:'Unauthorized' });
  }
  const b64 = authHeader.split(' ')[1];
  const creds = Buffer.from(b64, 'base64').toString('utf8');
  const [user, pass] = creds.split(':');
  if (user === envUser && pass === envPass) return next();
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).json({ ok:false, error:'Unauthorized' });
};
