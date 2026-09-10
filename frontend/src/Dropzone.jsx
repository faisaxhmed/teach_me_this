import { useRef, useState } from 'react'

/**
 * Styled PDF dropzone with click-to-browse and drag-and-drop, plus a compact
 * "file selected" confirmation chip. Purely presentational — the actual file
 * state and upload logic stay in Workspace.
 */
function Dropzone({ file, uploadResult, onFileSelect, onClear }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  function pickFile(candidate) {
    if (!candidate) return

    if (candidate.type !== 'application/pdf' && !candidate.name?.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }

    setError(null)
    onFileSelect(candidate)
  }

  function handleInputChange(event) {
    pickFile(event.target.files[0])
  }

  function handleDragEnter(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragOver(event) {
    // Required for onDrop to fire at all — the browser's default action for
    // dragover is to reject the drop.
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    // Child elements inside the dropzone fire their own dragleave as the pointer
    // moves over them, even though the pointer is still within the dropzone. Only
    // clear the active state once the pointer has actually left the dropzone box.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    pickFile(event.dataTransfer.files[0])
  }

  function handleClear(event) {
    event.stopPropagation()
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear()
  }

  if (file) {
    return (
      <div className="file-chip">
        <i className="ti ti-file-type-pdf file-chip-icon" />
        <div className="file-chip-info">
          <span className="file-chip-name">{uploadResult?.filename || file.name}</span>
          {uploadResult && <span className="file-chip-pages">{uploadResult.page_count} pages</span>}
        </div>
        <button type="button" className="file-chip-clear" onClick={handleClear} aria-label="Remove file">
          <i className="ti ti-x" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        className={'dropzone' + (isDragging ? ' dropzone-active' : '')}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <i className="ti ti-cloud-upload dropzone-icon" />
        <p className="dropzone-primary">Drop your PDF here</p>
        <p className="dropzone-secondary">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="dropzone-input"
        />
      </div>
      {error && <p className="dropzone-error">{error}</p>}
    </div>
  )
}

export default Dropzone
