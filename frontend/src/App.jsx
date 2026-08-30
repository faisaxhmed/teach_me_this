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
  const [quiz, setQuiz] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizResults, setQuizResults] = useState(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

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
    setQuiz(null)
    setQuizResults(null)

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

  async function handleStartQuiz() {
    setLoadingQuiz(true)
    setQuiz(null)
    setQuizResults(null)
    setSelectedAnswers({})

    const response = await fetch('http://127.0.0.1:8000/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_name: selectedTopic.name,
        document_text: uploadResult.text
      })
    })
    const data = await response.json()
    setQuiz(data.questions)
    setQuizId(data.quiz_id)
    setLoadingQuiz(false)
  }

  function handleAnswerSelect(questionId, optionIndex) {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex })
  }

  async function handleSubmitQuiz() {
    setSubmittingQuiz(true)

    const response = await fetch('http://127.0.0.1:8000/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quizId,
        answers: selectedAnswers
      })
    })
    const data = await response.json()
    setQuizResults(data)
    setSubmittingQuiz(false)
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

      {explanation && !quiz && (
        <button onClick={handleStartQuiz} disabled={loadingQuiz}>
          {loadingQuiz ? 'Generating quiz...' : 'Take the quiz'}
        </button>
      )}

      {quiz && !quizResults && (
        <div>
          <h2>Quiz: {selectedTopic.name}</h2>
          {quiz.map((q) => (
            <div key={q.id}>
              <p>{q.question}</p>
              {q.options.map((option, index) => (
                <label key={index} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={selectedAnswers[q.id] === index}
                    onChange={() => handleAnswerSelect(q.id, index)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmitQuiz} disabled={submittingQuiz}>
            {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}

      {quizResults && (
        <div>
          <h2>Results</h2>
          <p>Score: {quizResults.score} / {quizResults.total}</p>
        </div>
      )}
    </div>
  )
}

export default App