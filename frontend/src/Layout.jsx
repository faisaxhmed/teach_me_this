import { Outlet, Link } from 'react-router-dom'
import './App.css'

function Layout() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <i className="ti ti-bulb nav-brand-icon" />
          TeachMeThis
        </Link>
        <Link to="/app" className="btn btn-sm">
          Get started
        </Link>
      </nav>

      <Outlet />

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>TeachMeThis</h3>
            <p>Turn your own notes into explanations and quizzes that target what you don't know.</p>
            <div className="footer-social">
              <a
                href="https://github.com/faisaxhmed/teach_me_this"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <i className="ti ti-brand-github" />
              </a>
              <a
                href="https://www.linkedin.com/in/faisa-ahmed-41768a214/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <i className="ti ti-brand-linkedin" />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Site</h4>
            <ul>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">© 2026 Faisa Ahmed</div>
      </footer>
    </div>
  )
}

export default Layout
