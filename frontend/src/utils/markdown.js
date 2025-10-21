// Simple markdown parser for basic formatting
export function parseMarkdown(text) {
  if (!text) return '';
  
  // Convert markdown bold (**text** or __text__) to HTML
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Convert markdown italic (*text* or _text_) to HTML
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Convert line breaks to <br>
    .replace(/\n/g, '<br>');
  
  return html;
}

// Extract title from content if it starts with **title**
export function extractTitle(content) {
  if (!content) return { title: '', content: '' };
  
  const titleMatch = content.match(/^\*\*(.*?)\*\*\s*\n\n(.*)$/s);
  if (titleMatch) {
    return {
      title: titleMatch[1],
      content: titleMatch[2]
    };
  }
  
  return { title: '', content };
}

// Render markdown content safely
export function renderMarkdown(text) {
  const html = parseMarkdown(text);
  return { __html: html };
}
