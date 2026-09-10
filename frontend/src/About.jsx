function About() {
  return (
    <section className="about">
      <div className="card about-card">
        <span className="badge">About</span>
        <h1 className="about-title">About TeachMeThis</h1>

        <h2>What this is</h2>
        <p>
          TeachMeThis is a study tool that reads a student's own course material, explains it in
          plain language, and then quizzes them on it. After the quiz, it looks at exactly what
          was missed and targets that gap directly, instead of asking the student to reread
          everything from the start.
        </p>

        <h2>Why it exists</h2>
        <p>
          Rereading notes feels productive, but it rarely builds real understanding. It is easy
          to recognize a concept on the page without actually being able to explain or apply it.
          TeachMeThis turns notes into active practice instead, so studying time goes toward the
          material a student genuinely does not know yet.
        </p>

        <h2>Why a password is required</h2>
        <p>
          This is a portfolio project, not a public product. A password is required to try it
          out so that hosting and API costs stay manageable. If you are reviewing this project
          and do not have the password, it is included in my CV or portfolio site. Feel free to
          reach out if you cannot find it.
        </p>

        <h2>Built by</h2>
        <p>
          Faisa Ahmed. Connect on{' '}
          <a
            href="https://www.linkedin.com/in/faisa-ahmed-41768a214/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>{' '}
          or check out the code on{' '}
          <a
            href="https://github.com/faisaxhmed/teach_me_this"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default About
