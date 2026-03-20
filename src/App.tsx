import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { appRoutes } from './config/routes'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
              {appRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  )
}

export default App
