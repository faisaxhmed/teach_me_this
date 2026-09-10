import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <section className="hero">
        <span className="badge">Grounded in your own notes</span>
        <h1>Rereading your notes isn't studying.</h1>
        <p className="hero-sub">
          TeachMeThis turns your lecture notes into real explanations and quizzes that
          target exactly what you don't know yet.
        </p>
        <Link className="btn" to="/app">
          Upload your notes
        </Link>
      </section>

      <section className="steps">
        <div className="step-card blue">
          <div className="step-icon">
            <i className="ti ti-upload" />
          </div>
          <h3>1. Upload</h3>
          <p>Drop in your lecture notes or slides as a PDF.</p>
        </div>
        <div className="step-card pink">
          <div className="step-icon">
            <i className="ti ti-bulb" />
          </div>
          <h3>2. Learn</h3>
          <p>Get clear, grounded explanations for each topic, plus follow-up answers.</p>
        </div>
        <div className="step-card amber">
          <div className="step-icon">
            <i className="ti ti-target-arrow" />
          </div>
          <h3>3. Get quizzed</h3>
          <p>Take a targeted quiz and see exactly what you still need to review.</p>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to actually know your material?</h2>
        <p>Upload your notes and find out what you actually don't know yet.</p>
        <Link className="btn btn-white" to="/app">
          Try it out!
        </Link>
      </section>
    </>
  )
}

export default Home
