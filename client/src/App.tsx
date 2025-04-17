import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import MatchPreferencesPage from './pages/MatchPreferencesPage'
import './App.css'

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <nav className="navbar">
            <div className="logo">ClingClang</div>

            <div className={`menu-toggle ${isNavOpen ? 'open' : ''}`} onClick={() => setIsNavOpen(!isNavOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <ul className={`nav-links ${isNavOpen ? 'open' : ''}`}>
              <li><Link to="/" onClick={() => setIsNavOpen(false)}>Home</Link></li>
              <li><Link to="/preferences" onClick={() => setIsNavOpen(false)}>Match Preferences</Link></li>
            </ul>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<div className="home-page">Welcome to ClingClang!</div>} />
              <Route path="/preferences" element={<MatchPreferencesPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App