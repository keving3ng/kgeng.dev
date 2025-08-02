'use client';

import { motion } from 'framer-motion';
import { Building2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { experiences } from '../../data/experience';

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
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const companyLogos: Record<string, string> = {
  'Faire': '🧚',
  'QuarkSys': '⚛️',
  'Amazon': '📦',
  'RBC': '🏦',
};

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Professional Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              My journey through leading tech companies and innovative startups
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>

              <div className="space-y-12">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    variants={itemVariants}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-slate-900 hidden md:block"></div>

                    <div className="md:ml-20">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="text-3xl">{companyLogos[exp.company] || '🏢'}</div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {exp.position}
                              </h3>
                              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
                                <Building2 className="w-4 h-4" />
                                <span>{exp.company}</span>
                                {exp.current && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{exp.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{exp.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                          {exp.description}
                        </p>

                        <div className="mb-6">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Key Achievements
                          </h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-slate-700 dark:text-slate-300 text-sm">
                                  {achievement}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Technologies & Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div variants={itemVariants} className="text-center mt-16">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-slate-700 dark:text-slate-300">
                Want to work together?
              </span>
              <a
                href="mailto:kevin@kgeng.dev"
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <span>Get in touch</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};