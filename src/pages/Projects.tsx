import PageHeader from '../components/PageHeader'
import ProjectsList from '../components/ProjectsList'

function Projects() {
  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader title="projects" subtitle="things i'm building." />
        <ProjectsList />
      </div>
    </div>
  )
}

export default Projects
