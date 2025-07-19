'use client';

import { motion } from 'framer-motion';
import { Code, Database, Cloud, Wrench } from 'lucide-react';
import { personalInfo } from '@/data/personal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const skillCategories = [
  {
    title: 'Frontend Development',
    icon: Code,
    skills: personalInfo.skills.frontend,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Backend Development',
    icon: Database,
    skills: personalInfo.skills.backend,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Cloud & Infrastructure',
    icon: Cloud,
    skills: personalInfo.skills.cloud,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Database & Tools',
    icon: Wrench,
    skills: [...personalInfo.skills.database, ...personalInfo.skills.other.slice(0, 4)],
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
  },
];

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconText: 'text-blue-600 dark:text-blue-400',
      skill: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconText: 'text-purple-600 dark:text-purple-400',
      skill: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconText: 'text-green-600 dark:text-green-400',
      skill: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconText: 'text-orange-600 dark:text-orange-400',
      skill: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Technical Skills
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Technologies and tools I use to build exceptional software products
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {skillCategories.map((category, index) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              
              return (
                <motion.div
                  key={category.title}
                  variants={itemVariants}
                  className={`p-8 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-lg ${colors.iconBg} mr-4`}>
                      <Icon className={`w-6 h-6 ${colors.iconText}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${colors.skill}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Core Skills Highlight */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              Core Expertise
            </h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {personalInfo.skills.core.map((skill, index) => (
                <motion.div
                  key={skill}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow">
                    {skill}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Skills */}
          <motion.div variants={itemVariants} className="mt-16">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
              Additional Technologies
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {personalInfo.skills.other.slice(4).map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};