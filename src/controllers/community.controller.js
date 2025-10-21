const nostr = require('../services/nostr.service');

// Helper function to validate event signatures
function validateEventSignature(event) {
  try {
    const { getEventHash } = require('nostr-tools');
    const computedId = getEventHash(event);
    return computedId === event.id;
  } catch (e) {
    return false;
  }
}

// Helper function to validate private key matches public key
function validateKeyPair(nsec, expectedPubkey) {
  try {
    const { getPublicKey } = require('nostr-tools');
    const derivedPubkey = getPublicKey(nsec);
    return derivedPubkey === expectedPubkey;
  } catch (e) {
    return false;
  }
}

// Simple content moderation - check for inappropriate content
function moderateContent(content) {
  if (!content || typeof content !== 'string') return { allowed: true };
  
  // Basic spam detection
  if (content.length < 3) return { allowed: false, reason: 'Content too short' };
  
  // Check for excessive repetition (only for longer content)
  if (content.length > 50) {
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const maxRepetition = Math.max(...Object.values(wordCounts));
    // Only flag if there are many words and high repetition
    if (words.length > 10 && maxRepetition > words.length * 0.5) {
      return { allowed: false, reason: 'Excessive repetition detected' };
    }
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /(https?:\/\/[^\s]+){3,}/, // Multiple URLs
    // Removed overly aggressive spam keywords that might block legitimate content
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { allowed: false, reason: 'Spam pattern detected' };
    }
  }
  
  return { allowed: true };
}

exports.generateKeys = async (req, res, next) => {
  try {
    const kp = nostr.generateKeypair();
    res.json({ ok:true, data: kp });
  } catch (err) { next(err); }
};

exports.postQuestion = async (req, res, next) => {
  try {
    const { nsec, title, subject, content, role = 'student' } = req.body;
    console.log('Post question request:', { nsec: nsec ? 'present' : 'missing', title, subject, content: content ? 'present' : 'missing', role });
    console.log('Content length:', content ? content.length : 0);
    console.log('Content preview:', content ? content.substring(0, 100) : 'none');
    
    if (!nsec || !content) {
      console.log('Missing required fields - nsec:', !!nsec, 'content:', !!content);
      return res.status(400).json({ ok:false, error:'Missing required fields' });
    }
    
    // Content moderation
    const moderation = moderateContent(content);
    console.log('Content moderation result:', moderation);
    if (!moderation.allowed) {
      console.log('Content rejected:', moderation.reason);
      return res.status(400).json({ ok:false, error: `Content rejected: ${moderation.reason}` });
    }
    
    // Validate content length to prevent spam
    if (content.length > 10000) {
      return res.status(400).json({ ok:false, error:'Content too long. Maximum 10,000 characters.' });
    }
    
    // Validate title length if provided
    if (title && title.length > 200) {
      return res.status(400).json({ ok:false, error:'Title too long. Maximum 200 characters.' });
    }
    
    const tags = [];
    // Core tags for the new flow
    tags.push(['t', 'blueorb']); // Community scope
    tags.push(['t', 'question']); // Question type
    if (subject) tags.push(['subject', subject]);
    if (role) tags.push(['role', role]);
    
    // Add pubkey tag for author discovery and validation
    try {
      const { getPublicKey } = require('nostr-tools');
      const pub = getPublicKey(nsec);
      console.log('Generated pubkey:', pub ? pub.substring(0, 10) + '...' : 'none');
      tags.push(['p', pub]);
      
      // Validate that the private key matches the derived public key
      const keyPairValid = validateKeyPair(nsec, pub);
      console.log('Key pair validation:', keyPairValid);
      if (!keyPairValid) {
        console.log('Invalid key pair detected');
        return res.status(400).json({ ok:false, error:'Invalid key pair' });
      }
    } catch(e) {
      console.log('Error validating private key:', e.message);
      return res.status(400).json({ ok:false, error:'Invalid private key' });
    }
    
    // Format content with title if provided
    const formattedContent = title ? `**${title}**\n\n${content}` : content;
    console.log('Formatted content length:', formattedContent.length);
    console.log('Tags:', tags);
    
    console.log('Attempting to publish event...');
    const r = await nostr.publishEvent({ kind:1, content: formattedContent, tags, privkey: nsec });
    console.log('Publish result:', r);
    
    // Add a small delay to allow the relay to process the event
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.status(201).json({ ok:true, data: r });
  } catch (err) { next(err); }
};

exports.listQuestions = async (req, res, next) => {
  try {
    const { subject, author } = req.query;
    const filters = [{ kinds:[1], limit:50 }];
    
    // Always require the BlueOrb tag and question tag
    filters[0]['#t'] = ['blueorb', 'question'];
    if (subject) filters[0]['#subject'] = [subject];
    if (author) filters[0]['#p'] = [author];
    
    let events = await nostr.fetchEvents(filters, 3000);
    
    // Filter out deleted events (only check deletions from the same authors)
    const authorIds = new Set((events || []).map(ev => ev.pubkey));
    const deletedIds = new Set();
    
    if (authorIds.size > 0) {
      const deleteFilters = Array.from(authorIds).map(author => ({
        kinds: [5],
        authors: [author],
        limit: 50
      }));
      
      const deletes = await nostr.fetchEvents(deleteFilters, 2000);
      (deletes||[]).forEach(d => (d.tags||[]).forEach(t=>{ 
        if (t && t[0]==='e' && t[1]) deletedIds.add(t[1]); 
      }));
    }
    
    events = (events || []).filter(ev => !deletedIds.has(ev.id));
    
    // Sort by most recent first
    events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    
    res.json({ ok:true, data: events });
  } catch (err) { next(err); }
};

exports.postReply = async (req, res, next) => {
  try {
    const { nsec, content, parentId, role = 'teacher', tags: extraTags } = req.body;
    if (!nsec || !content || !parentId) return res.status(400).json({ ok:false, error:'Missing required fields' });
    
    // Content moderation
    const moderation = moderateContent(content);
    if (!moderation.allowed) {
      return res.status(400).json({ ok:false, error: `Content rejected: ${moderation.reason}` });
    }
    
    // Validate content length to prevent spam
    if (content.length > 10000) {
      return res.status(400).json({ ok:false, error:'Content too long. Maximum 10,000 characters.' });
    }
    
    const tags = [
      ['e', parentId], // Parent question ID
      ['t', 'blueorb'], // Community scope
      ['t', 'reply'] // Reply type - NOT 'question'
    ];
    
    if (role) tags.push(['role', role]);
    
    // Add pubkey tag for author discovery and validation
    try {
      const { getPublicKey } = require('nostr-tools');
      const pub = getPublicKey(nsec);
      tags.push(['p', pub]);
      
      // Validate that the private key matches the derived public key
      if (!validateKeyPair(nsec, pub)) {
        return res.status(400).json({ ok:false, error:'Invalid key pair' });
      }
    } catch(e) {
      return res.status(400).json({ ok:false, error:'Invalid private key' });
    }
    
    if (Array.isArray(extraTags)) {
      extraTags.forEach(t=>{ if (Array.isArray(t) && t.length>=2) tags.push(t); });
    }
    
    const r = await nostr.publishEvent({ kind:1, content, tags, privkey: nsec });
    res.status(201).json({ ok:true, data: r });
  } catch (err) { next(err); }
};

exports.listReplies = async (req, res, next) => {
  try {
    const parentId = req.query.parentId;
    if (!parentId) return res.status(400).json({ ok:false, error:'Missing parentId' });
    
    const filters = [{ 
      kinds:[1], 
      limit:50, 
      '#e':[parentId], 
      '#t':['blueorb', 'reply'] 
    }];
    
    let events = await nostr.fetchEvents(filters, 3000);
    
    // Filter out deleted events (only check deletions from the same authors)
    const authorIds = new Set((events || []).map(ev => ev.pubkey));
    const deletedIds = new Set();
    
    if (authorIds.size > 0) {
      const deleteFilters = Array.from(authorIds).map(author => ({
        kinds: [5],
        authors: [author],
        limit: 50
      }));
      
      const deletes = await nostr.fetchEvents(deleteFilters, 2000);
      (deletes||[]).forEach(d => (d.tags||[]).forEach(t=>{ 
        if (t && t[0]==='e' && t[1]) deletedIds.add(t[1]); 
      }));
    }
    
    events = (events||[]).filter(ev => !deletedIds.has(ev.id));
    
    // Sort by most recent first
    events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    
    res.json({ ok:true, data: events });
  } catch (err) { next(err); }
};

exports.listRepliesByAuthor = async (req, res, next) => {
  try {
    const { author } = req.query;
    if (!author) return res.status(400).json({ ok:false, error:'Missing author' });
    
    const filters = [{ 
      kinds:[1], 
      limit:100, 
      authors: [author], 
      '#t':['blueorb', 'reply'] 
    }];
    
    let events = await nostr.fetchEvents(filters, 3000);
    
    // Filter out deleted events (only check deletions from the same authors)
    const authorIds = new Set((events || []).map(ev => ev.pubkey));
    const deletedIds = new Set();
    
    if (authorIds.size > 0) {
      const deleteFilters = Array.from(authorIds).map(author => ({
        kinds: [5],
        authors: [author],
        limit: 50
      }));
      
      const deletes = await nostr.fetchEvents(deleteFilters, 2000);
      (deletes||[]).forEach(d => (d.tags||[]).forEach(t=>{ 
        if (t && t[0]==='e' && t[1]) deletedIds.add(t[1]); 
      }));
    }
    
    events = events.filter(ev => !deletedIds.has(ev.id));
    
    // Sort by most recent first
    events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    
    res.json({ ok:true, data: events });
  } catch (err) { next(err); }
};

exports.editReply = async (req, res, next) => {
  try {
    const { nsec, replyId, content, tags: extraTags } = req.body;
    if (!nsec || !replyId || !content) return res.status(400).json({ ok:false, error:'Missing required fields' });
    
    // Content moderation
    const moderation = moderateContent(content);
    if (!moderation.allowed) {
      return res.status(400).json({ ok:false, error: `Content rejected: ${moderation.reason}` });
    }
    
    // Validate content length to prevent spam
    if (content.length > 10000) {
      return res.status(400).json({ ok:false, error:'Content too long. Maximum 10,000 characters.' });
    }
    
    const tags = [
      ['e', replyId], // Reference to the original reply
      ['t', 'blueorb'], // Community scope
      ['t', 'reply'], // Reply type
      ['t', 'edit'] // Edit marker
    ];
    
    // Add pubkey tag for author discovery and validation
    try {
      const { getPublicKey } = require('nostr-tools');
      const pub = getPublicKey(nsec);
      tags.push(['p', pub]);
      
      // Validate that the private key matches the derived public key
      if (!validateKeyPair(nsec, pub)) {
        return res.status(400).json({ ok:false, error:'Invalid key pair' });
      }
    } catch(e) {
      return res.status(400).json({ ok:false, error:'Invalid private key' });
    }
    
    if (Array.isArray(extraTags)) {
      extraTags.forEach(t=>{ if (Array.isArray(t) && t.length>=2) tags.push(t); });
    }
    
    const r = await nostr.publishEvent({ kind:1, content, tags, privkey: nsec });
    res.status(201).json({ ok:true, data: r });
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { nsec, eventId } = req.body;
    if (!nsec || !eventId) return res.status(400).json({ ok:false, error:'Missing' });
    const tags = [['e', eventId]];
    const r = await nostr.publishEvent({ kind:5, content:'', tags, privkey: nsec });
    res.status(201).json({ ok:true, data: r });
  } catch (err) { next(err); }
};

exports.clearAllData = async (req, res, next) => {
  try {
    const { nsec } = req.body;
    if (!nsec) return res.status(400).json({ ok:false, error:'Missing private key' });
    
    // Fetch all questions and replies
    const questionFilters = [{ kinds:[1], limit:1000, '#t':['blueorb'] }];
    const allEvents = await nostr.fetchEvents(questionFilters, 5000);
    
    if (!allEvents || allEvents.length === 0) {
      return res.json({ ok:true, data: { message: 'No data found to clear', deletedCount: 0 } });
    }
    
    // Create deletion events for all found events
    const deletionPromises = allEvents.map(event => {
      const tags = [['e', event.id]];
      return nostr.publishEvent({ kind:5, content:'', tags, privkey: nsec });
    });
    
    // Execute all deletions
    const results = await Promise.allSettled(deletionPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    res.json({ 
      ok:true, 
      data: { 
        message: `Cleared ${successful} events successfully${failed > 0 ? `, ${failed} failed` : ''}`, 
        deletedCount: successful,
        failedCount: failed,
        totalFound: allEvents.length
      } 
    });
  } catch (err) { 
    console.error('Clear all data error:', err);
    next(err); 
  }
};

// New controller methods for updated flow
exports.cacheQuestion = async (req, res, next) => {
  try {
    const { event, signature } = req.body;
    if (!event || !signature) return res.status(400).json({ ok:false, error:'Missing event or signature' });
    
    // Validate the event structure
    if (!event.kind || !event.content || !event.tags) {
      return res.status(400).json({ ok:false, error:'Invalid event structure' });
    }
    
    // Verify it's a question (has t=question tag)
    const questionTag = event.tags.find(t => t[0] === 't' && t[1] === 'question');
    if (!questionTag) {
      return res.status(400).json({ ok:false, error:'Not a question event' });
    }
    
    // Store in database for caching (you can implement actual DB storage here)
    // For now, just validate and return success
    res.status(201).json({ ok:true, data: { cached: true, id: event.id } });
  } catch (err) { 
    next(err); 
  }
};

exports.cacheReply = async (req, res, next) => {
  try {
    const { event, signature } = req.body;
    if (!event || !signature) return res.status(400).json({ ok:false, error:'Missing event or signature' });
    
    // Validate the event structure
    if (!event.kind || !event.content || !event.tags) {
      return res.status(400).json({ ok:false, error:'Invalid event structure' });
    }
    
    // Verify it's a reply (has t=reply tag and e tag for parent)
    const replyTag = event.tags.find(t => t[0] === 't' && t[1] === 'reply');
    const parentTag = event.tags.find(t => t[0] === 'e');
    if (!replyTag || !parentTag) {
      return res.status(400).json({ ok:false, error:'Not a reply event' });
    }
    
    // Store in database for caching
    res.status(201).json({ ok:true, data: { cached: true, id: event.id } });
  } catch (err) { 
    next(err); 
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const { subject, role, limit = 50 } = req.query;
    
    // First, fetch all blueorb questions without additional filters
    const filters = [{ kinds:[1], limit: parseInt(limit) * 2, '#t': ['blueorb', 'question'] }];
    
    console.log('Feed filters:', JSON.stringify(filters, null, 2));
    let events = await nostr.fetchEvents(filters, 10000);
    console.log('Raw events found:', events ? events.length : 0);
    
    // Debug: Log the first few events to see their structure
    if (events && events.length > 0) {
      console.log('Sample events:');
      events.slice(0, 3).forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event.id,
          content: event.content.substring(0, 50) + '...',
          tags: event.tags,
          created_at: event.created_at
        });
      });
    }
    
    // Manual filtering in JavaScript
    if (events && events.length > 0) {
      events = events.filter(event => {
        // Check if it has blueorb and question tags
        const hasBlueorb = event.tags.some(tag => tag[0] === 't' && tag[1] === 'blueorb');
        const hasQuestion = event.tags.some(tag => tag[0] === 't' && tag[1] === 'question');
        
        if (!hasBlueorb || !hasQuestion) return false;
        
        // Check subject filter
        if (subject) {
          const hasSubject = event.tags.some(tag => tag[0] === 'subject' && tag[1] === subject);
          if (!hasSubject) return false;
        }
        
        // Check role filter
        if (role) {
          const hasRole = event.tags.some(tag => tag[0] === 'role' && tag[1] === role);
          if (!hasRole) return false;
        }
        
        return true;
      });
    }
    
    console.log('Events after manual filtering:', events ? events.length : 0);
    
    // Filter out deleted events (only check deletions from the same authors)
    const authorIds = new Set((events || []).map(ev => ev.pubkey));
    const deletedIds = new Set();
    
    if (authorIds.size > 0) {
      const deleteFilters = Array.from(authorIds).map(author => ({
        kinds: [5],
        authors: [author],
        limit: 50
      }));
      
      const deletes = await nostr.fetchEvents(deleteFilters, 2000);
      (deletes||[]).forEach(d => (d.tags||[]).forEach(t=>{ 
        if (t && t[0]==='e' && t[1]) deletedIds.add(t[1]); 
      }));
    }
    
    events = (events||[]).filter(ev => !deletedIds.has(ev.id));
    console.log('Events after filtering deleted:', events.length);
    
    // Sort by most recent first
    events.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    
    // Limit results
    events = events.slice(0, parseInt(limit));
    
    console.log('Returning events:', events.length);
    res.json({ ok:true, data: events });
  } catch (err) { 
    next(err); 
  }
};

exports.syncProfile = async (req, res, next) => {
  try {
    const { npub, username, bio, role } = req.body;
    if (!npub) return res.status(400).json({ ok:false, error:'Missing npub' });
    
    // Store profile data in database
    // For now, just validate and return success
    // You can implement actual database storage here
    
    res.json({ 
      ok:true, 
      data: { 
        synced: true, 
        npub, 
        username: username || '', 
        bio: bio || '', 
        role: role || 'student' 
      } 
    });
  } catch (err) { 
    next(err); 
  }
};

// Admin moderation methods
exports.getFlaggedContent = async (req, res, next) => {
  try {
    // This would typically query a database for flagged content
    // For now, return empty array
    res.json({ ok:true, data: [] });
  } catch (err) { 
    next(err); 
  }
};

exports.flagContent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    
    // This would typically store the flag in a database
    // For now, just return success
    res.json({ ok:true, data: { flagged: true, eventId, reason } });
  } catch (err) { 
    next(err); 
  }
};

exports.unflagContent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // This would typically remove the flag from database
    // For now, just return success
    res.json({ ok:true, data: { unflagged: true, eventId } });
  } catch (err) { 
    next(err); 
  }
};

exports.adminDeleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Admin can delete any event by publishing a deletion event
    // This would typically use a special admin key
    const adminNsec = process.env.ADMIN_NOSTR_KEY;
    if (!adminNsec) {
      return res.status(500).json({ ok:false, error:'Admin key not configured' });
    }
    
    const tags = [['e', eventId]];
    const r = await nostr.publishEvent({ kind:5, content:'Admin deletion', tags, privkey: adminNsec });
    
    res.json({ ok:true, data: r });
  } catch (err) { 
    next(err); 
  }
};

exports.getCommunityStats = async (req, res, next) => {
  try {
    // Get basic community statistics
    const questionFilters = [{ kinds:[1], limit:1000, '#t':['blueorb', 'question'] }];
    const replyFilters = [{ kinds:[1], limit:1000, '#t':['blueorb', 'reply'] }];
    
    const [questions, replies] = await Promise.all([
      nostr.fetchEvents(questionFilters, 5000),
      nostr.fetchEvents(replyFilters, 5000)
    ]);
    
    const stats = {
      totalQuestions: questions?.length || 0,
      totalReplies: replies?.length || 0,
      activeUsers: new Set([
        ...(questions || []).map(q => q.pubkey),
        ...(replies || []).map(r => r.pubkey)
      ]).size,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ ok:true, data: stats });
  } catch (err) { 
    next(err); 
  }
};

// Test endpoint to check if events are being stored
exports.testRelay = async (req, res, next) => {
  try {
    console.log('Testing relay connection...');
    
    // Try to fetch any events with blueorb tag
    const testFilters = [{ kinds:[1], limit:10, '#t':['blueorb'] }];
    const events = await nostr.fetchEvents(testFilters, 10000);
    
    console.log('Test events found:', events ? events.length : 0);
    if (events && events.length > 0) {
      console.log('Sample event:', {
        id: events[0].id,
        content: events[0].content.substring(0, 100),
        tags: events[0].tags,
        created_at: events[0].created_at
      });
    }
    
    res.json({ 
      ok: true, 
      data: { 
        eventsFound: events ? events.length : 0,
        sampleEvent: events && events.length > 0 ? {
          id: events[0].id,
          content: events[0].content.substring(0, 100),
          tags: events[0].tags
        } : null
      } 
    });
  } catch (err) { 
    next(err); 
  }
};