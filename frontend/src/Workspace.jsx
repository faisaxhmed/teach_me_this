import { useEffect, useRef, useState } from 'react'
import Markdown from './Markdown.jsx'
import LoadingState from './LoadingState.jsx'
import ThumbsFeedback from './ThumbsFeedback.jsx'
import Dropzone from './Dropzone.jsx'
import { useAccessToken } from './AccessContext.jsx'

const EXPLANATION_LOADING_MESSAGES = [
  'Reading your material...',
  'Thinking it through...',
  'Almost there...'
]

function Workspace() {
  const accessToken = useAccessToken()
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
  // Chat-style thread of {question, answer, feedback} pairs, appended to as the student
  // asks more follow-ups, rather than a single overwritten answer.
  const [followupThread, setFollowupThread] = useState([])
  const [loadingFollowup, setLoadingFollowup] = useState(false)
  // The question the student just sent, shown immediately (before the answer comes back)
  // so the chat feels live instead of waiting until the response resolves.
  const [pendingQuestion, setPendingQuestion] = useState(null)
  // Thumbs up/down on the initial explanation. See ThumbsFeedback.jsx for the "not yet
  // sent to a backend" note — same applies here.
  const [explanationFeedback, setExplanationFeedback] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizResults, setQuizResults] = useState(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [explainResult, setExplainResult] = useState(null)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [followupSelectedAnswer, setFollowupSelectedAnswer] = useState(null)
  const [followupSubmitted, setFollowupSubmitted] = useState(false)

  const threadEndRef = useRef(null)
  const topicsRef = useRef(null)
  const explanationRef = useRef(null)

  function scrollToExplanation() {
    explanationRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToTopics() {
    topicsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (followupThread.length > 0 || pendingQuestion) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [followupThread, pendingQuestion])

  function handleFileSelect(selectedFile) {
    setFile(selectedFile)
    setUploadResult(null)
  }

  function handleFileClear() {
    setFile(null)
    setUploadResult(null)
  }

  async function handleUpload() {
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      headers: { 'X-Access-Token': accessToken },
      body: formData
    })

    const data = await response.json()
    setUploadResult(data)
    setUploading(false)

    setLoadingTopics(true)
    const topicsResponse = await fetch('http://127.0.0.1:8000/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
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
    setExplanationFeedback(null)
    setFollowupThread([])
    setFollowupQuestion('')
    setPendingQuestion(null)
    setQuiz(null)
    setQuizResults(null)

    const response = await fetch('http://127.0.0.1:8000/learn/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
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

    const askedQuestion = followupQuestion
    setPendingQuestion(askedQuestion)
    setLoadingFollowup(true)
    setFollowupQuestion('')

    const response = await fetch('http://127.0.0.1:8000/learn/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
      body: JSON.stringify({
        session_id: sessionId,
        question: askedQuestion
      })
    })
    const data = await response.json()
    setFollowupThread((thread) => [
      ...thread,
      { question: askedQuestion, answer: data.answer, feedback: null }
    ])
    setPendingQuestion(null)
    setLoadingFollowup(false)
  }

  function handleFollowupFeedback(index, value) {
    setFollowupThread((thread) =>
      thread.map((item, i) => (i === index ? { ...item, feedback: value } : item))
    )
  }

  async function handleStartQuiz() {
    setLoadingQuiz(true)
    setQuiz(null)
    setQuizResults(null)
    setSelectedAnswers({})

    const response = await fetch('http://127.0.0.1:8000/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
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

  function handleFollowupSubmit() {
    setFollowupSubmitted(true)
  }

  async function handleSubmitQuiz() {
    setSubmittingQuiz(true)

    const response = await fetch('http://127.0.0.1:8000/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
      body: JSON.stringify({
        quiz_id: quizId,
        answers: selectedAnswers
      })
    })
    const data = await response.json()
    setQuizResults(data)
    setSubmittingQuiz(false)

    if (data.missed_questions_raw && data.missed_questions_raw.length > 0) {
      setLoadingExplain(true)
      const explainResponse = await fetch('http://127.0.0.1:8000/quiz/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Access-Token': accessToken },
        body: JSON.stringify({
          quiz_id: quizId,
          missed_questions: data.missed_questions_raw,
          document_text: uploadResult.text
        })
      })
      const explainData = await explainResponse.json()
      setExplainResult(explainData)
      setFollowupSelectedAnswer(null)
      setFollowupSubmitted(false)
      setLoadingExplain(false)
    }
  }

  return (
    <div className="workspace">
      <div className="card">
        <h2>Upload your material</h2>
        <p>Upload a PDF of your course material to get started.</p>

        <Dropzone
          file={file}
          uploadResult={uploadResult}
          onFileSelect={handleFileSelect}
          onClear={handleFileClear}
        />

        {file && (
          <div className="upload-row">
            <button className="btn btn-sm" onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        )}

        {loadingTopics && <p className="loading-row">Finding topics...</p>}
      </div>

      {topics && (
        <div className="card" ref={topicsRef}>
          <h2>Topics</h2>
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id}>
                <button
                  className={
                    'topic-btn' + (selectedTopic?.id === topic.id ? ' active' : '')
                  }
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadingExplanation && (
        <div className="card">
          <h2>{selectedTopic?.name}</h2>
          <LoadingState messages={EXPLANATION_LOADING_MESSAGES} />
        </div>
      )}

      {explanation && (
        <div className="card" ref={explanationRef}>
          <h2>{selectedTopic.name}</h2>

          <div className="chat-thread">
            <div className="chat-answer">
              <Markdown>{explanation}</Markdown>
              <ThumbsFeedback value={explanationFeedback} onChange={setExplanationFeedback} />
            </div>

            {followupThread.map((item, index) => (
              <div className="chat-turn" key={index}>
                <div className="chat-question">{item.question}</div>
                <div className="chat-answer">
                  <Markdown>{item.answer}</Markdown>
                  <ThumbsFeedback
                    value={item.feedback}
                    onChange={(value) => handleFollowupFeedback(index, value)}
                  />
                </div>
              </div>
            ))}

            {loadingFollowup && (
              <div className="chat-turn">
                <div className="chat-question">{pendingQuestion}</div>
                <div className="chat-answer">
                  <LoadingState messages={EXPLANATION_LOADING_MESSAGES} />
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          <div className="followup-row">
            <input
              type="text"
              className="text-input"
              placeholder="Ask a follow-up question..."
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFollowup()
              }}
            />
            <button className="btn btn-sm" onClick={handleFollowup} disabled={loadingFollowup}>
              {loadingFollowup ? 'Asking...' : 'Ask'}
            </button>
          </div>

          {!quiz && (
            <div style={{ marginTop: 18 }}>
              <button className="btn" onClick={handleStartQuiz} disabled={loadingQuiz}>
                {loadingQuiz ? 'Generating quiz...' : 'Take the quiz'}
              </button>
            </div>
          )}
        </div>
      )}

      {quiz && !quizResults && (
        <div className="card">
          <h2>Quiz: {selectedTopic.name}</h2>
          {quiz.map((q) => (
            <div className="question-block" key={q.id}>
              <p className="question-text">{q.question}</p>
              {q.options.map((option, index) => (
                <label className="option-label" key={index}>
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
          <button className="btn" onClick={handleSubmitQuiz} disabled={submittingQuiz}>
            {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}

      {quizResults && (
        <div className="card">
          <h2>Results</h2>
          <p className="score-line">
            Score: {quizResults.score} / {quizResults.total}
          </p>

          {loadingExplain && <LoadingState messages={EXPLANATION_LOADING_MESSAGES} />}

          {explainResult && (
            <div>
              <h3>What you got wrong</h3>
              {explainResult.explanations.map((item, index) => (
                <div className="explain-item" key={index}>
                  <p>
                    <strong>{item.question}</strong>
                  </p>
                  <Markdown>{item.explanation}</Markdown>
                </div>
              ))}

              <h3>Try this one</h3>
              <div className="followup-quiz">
                <p className="question-text">
                  <strong>{explainResult.followup_question.question}</strong>
                </p>
                {explainResult.followup_question.options.map((option, index) => {
                  const isCorrectOption = index === explainResult.followup_question.correct_index
                  const isSelectedOption = followupSelectedAnswer === index
                  let optionClass = 'option-label'
                  if (followupSubmitted) {
                    if (isCorrectOption) {
                      optionClass += ' answer-correct'
                    } else if (isSelectedOption) {
                      optionClass += ' answer-incorrect'
                    }
                  }
                  return (
                    <label className={optionClass} key={index}>
                      <input
                        type="radio"
                        name={explainResult.followup_question.id}
                        checked={isSelectedOption}
                        disabled={followupSubmitted}
                        onChange={() => setFollowupSelectedAnswer(index)}
                      />
                      {option}
                    </label>
                  )
                })}

                {!followupSubmitted && (
                  <button
                    className="btn btn-sm"
                    onClick={handleFollowupSubmit}
                    disabled={followupSelectedAnswer === null}
                  >
                    Submit
                  </button>
                )}

                {followupSubmitted && (
                  <p className={followupSelectedAnswer === explainResult.followup_question.correct_index ? 'followup-feedback correct' : 'followup-feedback incorrect'}>
                    {followupSelectedAnswer === explainResult.followup_question.correct_index
                      ? "Nice, you've got it!"
                      : 'Not quite — the correct answer is highlighted above.'}
                  </p>
                )}
              </div>

              {followupSubmitted && (
                <div
                  className={
                    'closing-card ' +
                    (followupSelectedAnswer === explainResult.followup_question.correct_index
                      ? 'closing-correct'
                      : 'closing-incorrect')
                  }
                >
                  <p className="closing-message">
                    {followupSelectedAnswer === explainResult.followup_question.correct_index
                      ? "Nice, you've got it! You're ready to keep going to the next topic."
                      : "Not quite, but that's exactly how learning works. Scroll up to revisit the explanation, or ask a follow-up question if anything's still unclear."}
                  </p>
                  <div className="closing-actions">
                    <button className="btn btn-sm" onClick={scrollToExplanation}>
                      Back to explanation
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={scrollToTopics}>
                      Study a different topic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Workspace
