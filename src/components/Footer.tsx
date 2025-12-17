function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-6xl mx-auto text-center opacity-70">
        <p>&copy; {currentYear} Kevin Geng. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

