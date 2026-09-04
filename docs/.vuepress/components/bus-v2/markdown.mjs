const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

function inlineMarkdown(value) {
  let html = escapeHtml(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return html.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

/** Deliberately small Markdown subset: text, paragraphs, headings, emphasis, code and http(s) links. */
export function renderNoticeMarkdown(markdown) {
  return String(markdown || '').replace(/\r/g, '').split(/\n{2,}/).filter(Boolean).map((block) => {
    const heading = block.match(/^(#{1,3})\s+(.+)$/)
    if (heading) return `<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`
    return `<p>${inlineMarkdown(block).replace(/\n/g, '<br>')}</p>`
  }).join('')
}
