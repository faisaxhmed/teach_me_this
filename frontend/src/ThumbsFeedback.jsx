// Frontend-only answer-quality feedback. Selecting up/down just updates local component
// state for now — nothing is sent to the backend yet. Wire this up to a real endpoint
// (e.g. POST /learn/feedback) once one exists; the `value`/`onChange` shape here is meant
// to make that a drop-in change later.
function ThumbsFeedback({ value, onChange }) {
  function toggle(next) {
    onChange(value === next ? null : next)
  }

  return (
    <div className="thumbs-row">
      <button
        type="button"
        className={'thumb-btn' + (value === 'up' ? ' thumb-up-active' : '')}
        onClick={() => toggle('up')}
        aria-label="Helpful answer"
        aria-pressed={value === 'up'}
      >
        <i className="ti ti-thumb-up" />
      </button>
      <button
        type="button"
        className={'thumb-btn' + (value === 'down' ? ' thumb-down-active' : '')}
        onClick={() => toggle('down')}
        aria-label="Unhelpful answer"
        aria-pressed={value === 'down'}
      >
        <i className="ti ti-thumb-down" />
      </button>
    </div>
  )
}

export default ThumbsFeedback
