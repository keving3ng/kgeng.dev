'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, Briefcase, GraduationCap, Brain, Code } from 'lucide-react';
import { projects } from '../../data/projects';
import { Button } from '../ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const categoryIcons = {
  web: Code,
  ml: Brain,
  api: Briefcase,
  learning: GraduationCap,
};

const categoryColors = {
  web: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    tag: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  },
  ml: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
    tag: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  },
  api: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
    tag: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  },
  learning: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    tag: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  },
};

export const ProjectsSection = () => {
  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A showcase of projects that demonstrate my technical skills and passion for building great software
            </p>
          </motion.div>

          {/* Featured Projects */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {featuredProjects.map((project, index) => {
              const CategoryIcon = categoryIcons[project.category];
              const colors = categoryColors[project.category];
              
              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-8 hover:shadow-lg transition-shadow group`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 ${colors.tag} rounded-lg`}>
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 ${colors.tag} text-xs rounded-full`}>
                            {project.category.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {project.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {project.longDescription}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-slate-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Other Projects */}
          {otherProjects.length > 0 && (
            <>
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                  Other Projects
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Additional projects and learning experiences
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {otherProjects.map((project, index) => {
                  const CategoryIcon = categoryIcons[project.category];
                  const colors = categoryColors[project.category];
                  
                  return (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${colors.tag} rounded-lg`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {project.title}
                            </h4>
                            <span className={`px-2 py-1 ${colors.tag} text-xs rounded-full`}>
                              {project.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                            +{project.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Want to see more of my work or discuss a project?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <a
                  href="https://github.com/keving3ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <Github className="w-5 h-5" />
                  <span>View GitHub</span>
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 dark:border-slate-600"
              >
                <a
                  href="mailto:kevin@kgeng.dev"
                  className="flex items-center space-x-2"
                >
                  <span>Get In Touch</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};