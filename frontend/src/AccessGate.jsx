import { useState } from 'react'
import { AccessContext } from './AccessContext.jsx'
import { API_URL } from './api.js'

// Gates the Workspace behind the shared access password. The token lives only in this
// component's state (not localStorage), so it clears whenever the tab is closed or
// reloaded and the visitor has to unlock again.
function AccessGate({ children }) {
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!password.trim()) return

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/access/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || 'Incorrect password.')
        setVerifying(false)
        return
      }

      const data = await response.json()
      setToken(data.access_token)
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setVerifying(false)
  }

  if (token) {
    return <AccessContext.Provider value={token}>{children}</AccessContext.Provider>
  }

  return (
    <div className="access-gate">
      <div className="card access-card">
        <span className="badge">Portfolio demo</span>
        <h2>This project is password protected</h2>
        <p>
          TeachMeThis is a portfolio project, not a public product. A password keeps hosting
          and API costs manageable while it's live. If you're reviewing this project and don't
          have the password, it's included in my CV or portfolio site. Feel free to reach out
          if you can't find it.
        </p>
        <form onSubmit={handleSubmit} className="access-form">
          <input
            type="password"
            className="text-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <button className="btn btn-sm" type="submit" disabled={verifying || !password.trim()}>
            {verifying ? 'Checking...' : 'Unlock'}
          </button>
        </form>
        {error && <p className="access-error">{error}</p>}
      </div>
    </div>
  )
}

export default AccessGate
