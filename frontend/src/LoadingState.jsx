import { useEffect, useState } from 'react'

/**
 * A skeleton placeholder + rotating friendly message, shown while waiting on a
 * slower Claude call (e.g. generating a topic explanation).
 */
function LoadingState({ messages }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    setMessageIndex(0)
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length)
    }, 1700)
    return () => clearInterval(interval)
  }, [messages])

  return (
    <div className="loading-state">
      <p className="loading-message">{messages[messageIndex]}</p>
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-short" />
    </div>
  )
}

export default LoadingState
