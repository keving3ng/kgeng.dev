import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Blog from './pages/Blog'
import About from './pages/About'
import Splits from './pages/Splits'
import Recipeer from './pages/Recipeer'
import Picks from './pages/Picks'
import Projects from './pages/Projects'
import Recipes from './pages/Recipes'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:slug" element={<Home />} />
              <Route path="/cv" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/tools/splits" element={<Splits />} />
              <Route path="/tools/recipeer" element={<Recipeer />} />
              <Route path="/picks" element={<Picks />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/recipes" element={<Recipes />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  )
}

export default App


