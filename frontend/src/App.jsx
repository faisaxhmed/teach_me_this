import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [topics, setTopics] = useState(null)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [followupQuestion, setFollowupQuestion] = useState('')
  const [followupAnswer, setFollowupAnswer] = useState(null)
  const [loadingFollowup, setLoadingFollowup] = useState(false)

  function handleFileChange(event) {
    setFile(event.target.files[0])
  }

  async function handleUpload() {
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    setUploadResult(data)
    setUploading(false)

    setLoadingTopics(true)
    const topicsResponse = await fetch('http://127.0.0.1:8000/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data.text })
    })
    const topicsData = await topicsResponse.json()
    setTopics(topicsData.topics)
    setLoadingTopics(false)
  }

  async function handleTopicClick(topic) {
    setSelectedTopic(topic)
    setLoadingExplanation(true)
    setExplanation(null)
    setFollowupAnswer(null)

    const response = await fetch('http://127.0.0.1:8000/learn/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_id: topic.id,
        topic_name: topic.name,
        document_text: uploadResult.text
      })
    })
    const data = await response.json()
    setExplanation(data.explanation)
    setSessionId(data.session_id)
    setLoadingExplanation(false)
  }

  async function handleFollowup() {
    if (!followupQuestion.trim()) return

    setLoadingFollowup(true)

    const response = await fetch('http://127.0.0.1:8000/learn/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        question: followupQuestion
      })
    })
    const data = await response.json()
    setFollowupAnswer(data.answer)
    setLoadingFollowup(false)
    setFollowupQuestion('')
  }

  return (
    <div className="app">
      <h1>TeachMeThis</h1>
      <p>Upload your course material to get started.</p>

      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>

      {uploadResult && (
        <div>
          <p>Uploaded: {uploadResult.filename}</p>
          <p>Pages: {uploadResult.page_count}</p>
        </div>
      )}

      {loadingTopics && <p>Finding topics...</p>}

      {topics && (
        <div>
          <h2>Topics</h2>
          <ul>
            {topics.map((topic) => (
              <li key={topic.id}>
                <button onClick={() => handleTopicClick(topic)}>{topic.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingExplanation && <p>Loading explanation...</p>}

      {explanation && (
        <div>
          <h2>{selectedTopic.name}</h2>
          <p>{explanation}</p>

          <input
            type="text"
            placeholder="Ask a follow-up question..."
            value={followupQuestion}
            onChange={(e) => setFollowupQuestion(e.target.value)}
          />
          <button onClick={handleFollowup} disabled={loadingFollowup}>
            {loadingFollowup ? 'Asking...' : 'Ask'}
          </button>

          {followupAnswer && <p>{followupAnswer}</p>}
        </div>
      )}
    </div>
  )
}

export default App