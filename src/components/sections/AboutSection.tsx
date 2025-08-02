'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Award } from 'lucide-react';
import { personalInfo } from '../../data/personal';

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

const stats = [
  {
    icon: Calendar,
    label: 'Years Experience',
    value: '3+',
    description: 'Building SaaS products',
  },
  {
    icon: Users,
    label: 'LinkedIn Connections',
    value: personalInfo.connections.toString(),
    description: 'Professional network',
  },
  {
    icon: Award,
    label: 'Companies',
    value: '4',
    description: 'Faire, QuarkSys, Amazon, RBC',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Toronto',
    description: 'Ontario, Canada',
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
                {personalInfo.title}
              </h3>
              
              <div className="space-y-4 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>{personalInfo.bio}</p>
                
                <p>
                  Currently working on the <span className="font-semibold text-blue-600 dark:text-blue-400">Catalog Growth</span> team 
                  at Faire, where I focus on building frontend solutions that enhance the marketplace experience 
                  for both retailers and brands.
                </p>
                
                <p>
                  My journey has taken me from <span className="font-semibold">Amazon&apos;s Alexa Communications</span> infrastructure 
                  to building comprehensive SaaS platforms at <span className="font-semibold">QuarkSys</span> for 
                  business brokerage and real estate sectors.
                </p>
                
                <p className="font-medium text-slate-900 dark:text-white">
                  {personalInfo.summary}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {personalInfo.skills.core.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      variants={itemVariants}
                      className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-center hover:shadow-xl transition-shadow"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {stat.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Languages
                </h4>
                <div className="space-y-2">
                  {personalInfo.languages.map((lang) => (
                    <div key={lang.name} className="flex justify-between items-center">
                      <span className="text-slate-700 dark:text-slate-300">{lang.name}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};