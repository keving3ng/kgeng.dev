import PageHeader from '../components/PageHeader'

interface Pick {
  title: string
  author?: string
  url?: string
  note?: string
  label?: string // optional sub-section label
}

interface Category {
  name: string
  items: Pick[]
  link?: { label: string; url: string }
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
      {
        title: 'An Existential Guide to Making Friends',
        url: 'https://theshadowedarchive.substack.com/p/an-existential-guide-to-making-friends',
        author: 'The Shadowed Archive',
      },
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
    name: 'movies',
    link: { label: 'letterboxd', url: 'https://letterboxd.com/kegk3g/' },
    items: []
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
        <PageHeader title="picks" subtitle="things i've enjoyed and would recommend." />

        {nonEmptyCategories.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            coming soon...
          </p>
        ) : (
          <div className="space-y-10">
            {nonEmptyCategories.map((category) => (
              <section key={category.name}>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-sm text-gray-500 dark:text-gray-400 lowercase">
                    {category.name}
                  </h2>
                  {category.link && (
                    <a
                      href={category.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    >
                      ({category.link.label} ↗)
                    </a>
                  )}
                </div>
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <div key={idx}>
                      {item.label && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 mt-2">
                          {item.label}
                        </p>
                      )}
                      <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-4">
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
