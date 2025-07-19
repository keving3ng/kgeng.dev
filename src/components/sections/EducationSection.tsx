'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Award, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { education, volunteer } from '@/data/experience';
import { personalInfo } from '@/data/personal';

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

export const EducationSection = () => {
  return (
    <section id="education" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Education & Leadership
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Academic background and leadership experience that shaped my career
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Education */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Education
                </h3>
              </div>

              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 mb-6"
                >
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {edu.degree}
                  </h4>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    {edu.field}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
                    {edu.institution}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{edu.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{edu.location}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Highlights
                    </h5>
                    <ul className="space-y-1">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm">
                            {achievement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}

              {/* Certifications */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Certifications
                  </h3>
                </div>

                <div className="space-y-4">
                  {personalInfo.certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {cert.name}
                      </h4>
                      <p className="text-purple-600 dark:text-purple-400 text-sm mb-2">
                        {cert.issuer} • {cert.date}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Credential ID: {cert.credentialId}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Leadership & Volunteer */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center mb-8">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Leadership & Volunteer
                </h3>
              </div>

              {volunteer.map((vol, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 mb-6"
                >
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {vol.position}
                  </h4>
                  <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-2">
                    {vol.organization}
                  </p>
                  
                  <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{vol.duration}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    {vol.description}
                  </p>

                  {vol.achievements && (
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Key Contributions
                      </h5>
                      <ul className="space-y-1">
                        {vol.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300 text-sm">
                              {achievement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Call to Action */}
              <motion.div variants={itemVariants} className="mt-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Let&apos;s Connect
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    Interested in collaborating or learning more about my experience?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://linkedin.com/in/${personalInfo.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <span>View LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:${personalInfo.email}`}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                    >
                      <span>Send Email</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};