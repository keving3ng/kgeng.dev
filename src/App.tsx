import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import About from './pages/About'
import Splits from './pages/Splits'
import Recipeer from './pages/Recipeer'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/tools/splits" element={<Splits />} />
          <Route path="/tools/recipeer" element={<Recipeer />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App


