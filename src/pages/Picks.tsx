import { Link } from 'react-router-dom'

interface Pick {
  title: string
  author?: string
  url?: string
  note?: string
}

interface Category {
  name: string
  items: Pick[]
}

const categories: Category[] = [
  {
    name: 'books',
    items: [
      // Add your book picks here
      // { title: 'Example Book', author: 'Author Name', note: 'Why I recommend it' },
    ],
  },
  {
    name: 'articles',
    items: [
      // Add your article picks here
      // { title: 'Example Article', url: 'https://...', note: 'Why I recommend it' },
    ],
  },
  {
    name: 'videos',
    items: [
      // Add your video picks here
      // { title: 'Example Video', url: 'https://...', note: 'Why I recommend it' },
    ],
  },
  {
    name: 'movies & shows',
    items: [
      // Add your movie/show picks here
      // { title: 'Example Movie', note: 'Why I recommend it' },
    ],
  },
  {
    name: 'podcasts',
    items: [
      // Add your podcast picks here
      // { title: 'Example Podcast', url: 'https://...', note: 'Why I recommend it' },
    ],
  },
]

function Picks() {
  const nonEmptyCategories = categories.filter((cat) => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          ← back
        </Link>

        <h1 className="text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          picks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          things i've enjoyed and would recommend.
        </p>

        {nonEmptyCategories.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            coming soon...
          </p>
        ) : (
          <div className="space-y-10">
            {nonEmptyCategories.map((category) => (
              <section key={category.name}>
                <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-4 lowercase">
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-gray-200 dark:border-gray-800 pl-4"
                    >
                      <div className="flex items-baseline gap-2">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {item.title} ↗
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </span>
                        )}
                        {item.author && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            — {item.author}
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Picks
