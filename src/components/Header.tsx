import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-8 py-4 md:px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          Kevin Geng
        </Link>
        <ul className="flex list-none gap-8 md:gap-4 md:text-sm">
          <li>
            <Link to="/" className="hover:opacity-70 transition-opacity">
              Home
            </Link>
          </li>
          <li>
            <Link to="/blog" className="hover:opacity-70 transition-opacity">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:opacity-70 transition-opacity">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header

