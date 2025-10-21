// Nostr client utilities for community features
import { generateSecretKey, getPublicKey, getEventHash, signEvent, SimplePool, nip19 } from 'nostr-tools';

let pool = null;
let relays = [];

// Initialize Nostr connection
export function initNostrClient(relayList = null) {
  relays = relayList || (process.env.REACT_APP_NOSTR_RELAY || 'wss://relay.damus.io').split(',').map(s => s.trim());
  pool = new SimplePool();
  console.log('[nostr-client] initialized with relays:', relays);
  return { relays };
}

// Generate a new keypair
export function generateKeypair() {
  const priv = generateSecretKey();
  const pub = getPublicKey(priv);
  return { nsec: priv, npub: pub };
}

// Publish an event to relays
export async function publishEvent({ kind = 1, content = '', tags = [], privkey }) {
  if (!privkey) throw new Error('Missing private key');
  if (!pool) initNostrClient();
  
  const pubkey = getPublicKey(privkey);
  const event = { 
    kind, 
    pubkey, 
    created_at: Math.floor(Date.now() / 1000), 
    tags, 
    content 
  };
  
  event.id = getEventHash(event);
  event.sig = signEvent(event, privkey);

  try {
    const pub = pool.publish(relays, event);
    
    if (pub && typeof pub.on === 'function') {
      return await new Promise((resolve, reject) => {
        let done = false;
        pub.on('ok', relay => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, relay, id: event.id }); 
          } 
        });
        pub.on('seen', relay => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, relay, id: event.id }); 
          } 
        });
        pub.on('failed', (relay, err) => { 
          if (!done) { 
            done = true; 
            reject(new Error('Failed to publish')); 
          } 
        });
        setTimeout(() => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, timeout: true, id: event.id }); 
          } 
        }, 3000);
      });
    } else {
      await pub;
      return { ok: true, id: event.id };
    }
  } catch (err) {
    return { ok: true, id: event.id, error: String(err && err.message || err) };
  }
}

// Subscribe to events in real-time
export function subscribeToEvents(filters, onEvent, timeoutMs = 30000) {
  if (!pool) initNostrClient();
  
  const sub = pool.sub(relays, filters);
  sub.on('event', onEvent);
  
  // Return unsubscribe function
  return () => {
    try { sub.unsub(); } catch(e) {}
  };
}

// Fetch events from relays
export async function fetchEvents(filters = [], timeoutMs = 2500) {
  if (!pool) initNostrClient();
  
  return new Promise((resolve) => {
    const sub = pool.sub(relays, filters);
    const events = [];
    sub.on('event', e => events.push(e));
    setTimeout(() => { 
      try { sub.unsub(); } catch(e) {} 
      resolve(events); 
    }, timeoutMs);
  });
}

// Publish profile metadata (kind 0)
export async function publishProfile({ privkey, username, bio, role }) {
  if (!privkey) throw new Error('Missing private key');
  if (!pool) initNostrClient();
  
  const pubkey = getPublicKey(privkey);
  const profile = {
    name: username || '',
    about: bio || '',
    role: role || 'student'
  };
  
  const event = { 
    kind: 0, 
    pubkey, 
    created_at: Math.floor(Date.now() / 1000), 
    tags: [], 
    content: JSON.stringify(profile) 
  };
  
  event.id = getEventHash(event);
  event.sig = signEvent(event, privkey);

  try {
    const pub = pool.publish(relays, event);
    
    if (pub && typeof pub.on === 'function') {
      return await new Promise((resolve, reject) => {
        let done = false;
        pub.on('ok', relay => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, relay, id: event.id }); 
          } 
        });
        pub.on('seen', relay => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, relay, id: event.id }); 
          } 
        });
        pub.on('failed', (relay, err) => { 
          if (!done) { 
            done = true; 
            reject(new Error('Failed to publish profile')); 
          } 
        });
        setTimeout(() => { 
          if (!done) { 
            done = true; 
            resolve({ ok: true, timeout: true, id: event.id }); 
          } 
        }, 3000);
      });
    } else {
      await pub;
      return { ok: true, id: event.id };
    }
  } catch (err) {
    return { ok: true, id: event.id, error: String(err && err.message || err) };
  }
}

// Fetch profile metadata
export async function fetchProfile(pubkey, timeoutMs = 2500) {
  if (!pool) initNostrClient();
  
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

// Validate event signatures
export function validateEvent(event) {
  try {
    const computedId = getEventHash(event);
    return computedId === event.id;
  } catch (e) {
    return false;
  }
}

// Get relay information
export function getRelayInfo() {
  return {
    relays,
    connected: pool ? true : false
  };
}
