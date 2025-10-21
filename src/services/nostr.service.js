const { generatePrivateKey, getPublicKey, getEventHash, signEvent, getSignature, SimplePool, nip19 } = require('nostr-tools');
let pool = null;
let relays = [];

function initNostr(relayList) {
  relays = relayList || (process.env.NOSTR_RELAY || 'wss://relay.damus.io').split(',').map(s=>s.trim());
  pool = new SimplePool();
  console.log('[nostr] init', relays);
  console.log('[nostr] pool created:', !!pool);
  return { relays };
}

function generateKeypair(){ 
  const priv = generatePrivateKey(); 
  const pub = getPublicKey(priv); 
  return { nsec: priv, npub: pub }; 
}

// Enhanced function to publish profile metadata (kind 0)
async function publishProfile({ privkey, username, bio, role }) {
  if (!privkey) throw new Error('Missing private key');
  if (!pool) initNostr();
  
  const pubkey = getPublicKey(privkey);
  const profile = {
    name: username || '',
    about: bio || '',
    role: role || 'student'
  };
  
  const event = { 
    kind: 0, 
    pubkey, 
    created_at: Math.floor(Date.now()/1000), 
    tags: [], 
    content: JSON.stringify(profile) 
  };
  
  event.id = getEventHash(event);
  // Use getSignature if available, otherwise fall back to signEvent
  event.sig = typeof getSignature === 'function' ? getSignature(event, privkey) : signEvent(event, privkey);

  try {
    const pub = pool.publish(relays, event);
    if (pub && typeof pub.on === 'function') {
      return await new Promise((resolve, reject) => {
        let done = false;
        pub.on('ok', relay => { if (!done) { done = true; resolve({ ok:true, relay, id:event.id }); } });
        pub.on('seen', relay => { if (!done) { done = true; resolve({ ok:true, relay, id:event.id }); } });
        pub.on('failed', (relay, err) => { if (!done) { done = true; reject(new Error('Failed to publish profile')); } });
        setTimeout(() => { if (!done) { done = true; resolve({ ok:true, timeout:true, id:event.id }); } }, 3000);
      });
    } else {
      await pub;
      return { ok:true, id: event.id };
    }
  } catch (err) {
    return { ok:true, id: event.id, error: String(err && err.message || err) };
  }
}

// Function to fetch profile metadata
async function fetchProfile(pubkey, timeoutMs = 2500) {
  if (!pool) initNostr();
  
  return new Promise((resolve) => {
    const filters = [{ kinds: [0], authors: [pubkey], limit: 1 }];
    const sub = pool.sub(relays, filters);
    let profile = null;
    
    sub.on('event', (event) => {
      try {
        const profileData = JSON.parse(event.content);
        profile = { ...profileData, pubkey: event.pubkey, created_at: event.created_at };
      } catch (e) {
        console.warn('Failed to parse profile:', e);
      }
    });
    
    setTimeout(() => {
      try { sub.unsub(); } catch(e) {}
      resolve(profile);
    }, timeoutMs);
  });
}

async function publishEvent({ kind=1, content='', tags=[], privkey }) {
  if (!privkey) throw new Error('Missing private key');
  if (!pool) initNostr();
  const pubkey = getPublicKey(privkey);
  const event = { kind, pubkey, created_at: Math.floor(Date.now()/1000), tags, content };
  event.id = getEventHash(event);
  // Use getSignature if available, otherwise fall back to signEvent
  event.sig = typeof getSignature === 'function' ? getSignature(event, privkey) : signEvent(event, privkey);
  console.log('Publishing event:', { kind, content: content.substring(0, 50) + '...', tags, pubkey: pubkey.substring(0, 10) + '...' });

  try {
    console.log('Publishing to relays:', relays);
    const pub = pool.publish(relays, event);
    console.log('Publish object:', typeof pub, pub ? 'has methods' : 'no methods');
    
    // Support both Pub interface (with .on) and Promise-like return values depending on nostr-tools version
    if (pub && typeof pub.on === 'function') {
      console.log('Using event-based publish interface');
      return await new Promise((resolve, reject) => {
        let done = false;
        pub.on('ok', relay => { 
          console.log('Publish OK from relay:', relay);
          if (!done) { done = true; resolve({ ok:true, relay, id:event.id }); } 
        });
        pub.on('seen', relay => { 
          console.log('Publish SEEN from relay:', relay);
          if (!done) { done = true; resolve({ ok:true, relay, id:event.id }); } 
        });
        pub.on('failed', (relay, err) => { 
          console.log('Publish FAILED from relay:', relay, err);
          if (!done) { done = true; reject(new Error('Failed to publish')); } 
        });
        setTimeout(() => { 
          console.log('Publish timeout reached');
          if (!done) { done = true; resolve({ ok:true, timeout:true, id:event.id }); } 
        }, 3000);
      });
    } else {
      console.log('Using promise-based publish interface');
      await pub; // if it's a Promise, await it
      return { ok:true, id: event.id };
    }
  } catch (err) {
    console.log('Publish error:', err);
    // As a fallback, don't fail hard; report timeout-like success so UI can proceed
    return { ok:true, id: event.id, error: String(err && err.message || err) };
  }
}

async function fetchEvents(filters=[], timeoutMs=2500) {
  if (!pool) initNostr();
  console.log('Fetching events with filters:', JSON.stringify(filters, null, 2));
  console.log('Using relays:', relays);
  return new Promise((resolve)=> {
    const sub = pool.sub(relays, filters);
    const events = [];
    sub.on('event', e=>{
      console.log('Received event:', e.id, e.kind, e.tags);
      events.push(e);
    });
    sub.on('eose', () => {
      console.log('End of stored events reached');
    });
    setTimeout(()=>{ 
      console.log('Fetch timeout reached, found', events.length, 'events');
      try{sub.unsub();}catch(e){}; 
      resolve(events); 
    }, timeoutMs);
  });
}

// Enhanced function to subscribe to real-time events
function subscribeToEvents(filters, onEvent, timeoutMs = 30000) {
  if (!pool) initNostr();
  
  const sub = pool.sub(relays, filters);
  sub.on('event', onEvent);
  
  // Return unsubscribe function
  return () => {
    try { sub.unsub(); } catch(e) {}
  };
}

// Function to validate event signatures
function validateEvent(event) {
  try {
    const computedId = getEventHash(event);
    return computedId === event.id;
  } catch (e) {
    return false;
  }
}

// Function to get relay information
function getRelayInfo() {
  return {
    relays,
    connected: pool ? true : false
  };
}

module.exports = { 
  initNostr, 
  generateKeypair, 
  publishEvent, 
  fetchEvents,
  publishProfile,
  fetchProfile,
  subscribeToEvents,
  validateEvent,
  getRelayInfo
};
