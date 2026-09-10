import ReactMarkdown from 'react-markdown'

// Claude's responses often open with their own "# Topic Name" markdown heading, which
// duplicates the app's own controlled <h2> above it. Strip only that leading heading line
// (if present) so the rest of the markdown renders untouched.
function stripLeadingHeading(text) {
  if (!text) return text

  const lines = text.split('\n')
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim() !== '')
  if (firstNonEmptyIndex === -1) return text

  if (/^#{1,6}\s/.test(lines[firstNonEmptyIndex].trim())) {
    lines.splice(firstNonEmptyIndex, 1)
    return lines.join('\n').replace(/^\n+/, '')
  }

  return text
}

/** Renders Claude-generated markdown text using the app's design system styles. */
function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown>{stripLeadingHeading(children)}</ReactMarkdown>
    </div>
  )
}

export default Markdown
