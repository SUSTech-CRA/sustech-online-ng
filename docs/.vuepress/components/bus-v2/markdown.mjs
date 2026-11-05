import { Marked } from 'marked'

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const safeUrl = (value) => {
  try { return ['http:', 'https:'].includes(new URL(value, 'https://notice.invalid/').protocol) } catch { return false }
}
const noticeMarkdown = new Marked({
  breaks: true,
  renderer: {
    html({ text }) { return escapeHtml(text) },
    link({ href, title, tokens }) {
      const content = this.parser.parseInline(tokens)
      if (!safeUrl(href)) return content
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''} target="_blank" rel="noopener noreferrer">${content}</a>`
    },
    image({ href, title, text }) {
      if (!safeUrl(href)) return escapeHtml(text)
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">`
    },
  },
})

export function renderNoticeMarkdown(markdown) {
  return noticeMarkdown.parse(String(markdown || ''))
}
