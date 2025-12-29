import { useState } from 'react'
import { experiences, education, skills, contact } from '../config/cv'

function getInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

function Logo({ src, alt, name }: { src: string; alt: string; name: string }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-xs font-medium text-content-secondary">
        {getInitials(name)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-8 h-8 rounded-full object-contain bg-white"
      onError={() => setHasError(true)}
    />
  )
}

function CVList() {
  return (
    <div className="px-2 md:px-0 pb-16">
      {experiences.map((exp, index) => (
        <div
          key={`${exp.company}-${exp.startDate}`}
          className={`py-3 flex items-center gap-3 ${index < experiences.length - 1 ? 'border-b border-border' : ''}`}
        >
          <Logo
            src={exp.logo}
            alt={`${exp.company} logo`}
            name={exp.company}
          />
          <div>
            <div className="font-medium text-content">{exp.company.toLowerCase()}</div>
            <div className="text-content-secondary text-sm">
              {exp.role.toLowerCase()} · {exp.startDate.toLowerCase()}
              {exp.current ? ' - present' : exp.endDate ? ` - ${exp.endDate.toLowerCase()}` : ''}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-content-muted text-xs uppercase tracking-wide mb-3">
          education
        </div>
        <div className="flex items-center gap-3">
          <Logo
            src={education.logo}
            alt={`${education.school} logo`}
            name={education.school}
          />
          <div>
            <div className="font-medium text-content">{education.school.toLowerCase()}</div>
            <div className="text-content-secondary text-sm">
              {education.degree.toLowerCase()} · {education.startYear} - {education.endYear}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-content-muted text-xs uppercase tracking-wide mb-3">
          skills
        </div>
        <div className="space-y-2 text-sm">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="flex gap-2">
              <span className="text-content-muted w-16">{category}</span>
              <span className="text-content-secondary">{items.join(', ').toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-content-muted text-xs uppercase tracking-wide mb-3">
          contact
        </div>
        <div className="space-y-1 text-sm">
          <a
            href={`mailto:${contact.email}`}
            className="block text-content-secondary hover:text-content transition-colors"
          >
            {contact.email}
          </a>
          <div className="flex gap-4">
            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              github ↗
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              linkedin ↗
            </a>
            <a
              href={contact.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              twitter ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVList
