import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { lists, socialLinks, tools } from '../config/navigation'
import { paths } from '../config/paths'

export default function MobileSiteNav() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const dialogId = useId()
  const titleId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => dialogRef.current?.close()

  useEffect(() => {
    dialogRef.current?.close()
  }, [location])

  useEffect(() => {
    const desktop = window.matchMedia?.('(min-width: 768px)')
    if (!desktop) return
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close()
    }
    closeOnDesktop()
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <nav aria-label="mobile site navigation" className="mb-6 flex justify-end px-2 md:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={isOpen}
        onClick={() => {
          dialogRef.current?.showModal()
          setIsOpen(true)
        }}
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded border border-border px-3 py-2 text-sm text-content hover:bg-surface-secondary transition-colors"
      >
        menu
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu()
        }}
        className="w-[calc(100%-2rem)] max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-0 text-content backdrop:bg-content/20"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-medium">navigation</h2>
            <button
              type="button"
              onClick={closeMenu}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded px-2 py-1 text-sm text-content-muted hover:text-content"
            >
              close
            </button>
          </div>
          <div className="space-y-5">
            <div className="space-y-1">
              {[{ label: 'blog', url: paths.home }, { label: 'cv', url: paths.cv }, { label: 'projects', url: paths.projects }, ...lists].map((link) => (
                <Link key={link.url} to={link.url} onClick={closeMenu} className="min-h-[44px] flex items-center py-2 text-sm hover:text-content-secondary">
                  {link.label.toLowerCase()}
                </Link>
              ))}
            </div>
            <div className="space-y-1 border-t border-border pt-5">
              {tools.map((tool) => (
                <Link key={tool.url} to={tool.url} onClick={closeMenu} className="min-h-[44px] flex items-center py-2 text-sm hover:text-content-secondary">
                  {tool.label.toLowerCase()}
                </Link>
              ))}
            </div>
            <div className="space-y-1 border-t border-border pt-5">
              {socialLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="min-h-[44px] flex items-center py-2 text-sm text-content-muted hover:text-content-secondary">
                  {link.label.toLowerCase()} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </nav>
  )
}
