'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { personalInfo } from '@/data/personal';

const navigation = [
  { name: 'About', href: '/about' as const },
  { name: 'Experience', href: '/experience' as const },
  { name: 'Skills', href: '/skills' as const },
  { name: 'Projects', href: '/projects' as const },
  { name: 'Education', href: '/education' as const },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: `https://github.com/${personalInfo.github.personal}`,
    icon: Github,
  },
  {
    name: 'LinkedIn',
    href: `https://linkedin.com/in/${personalInfo.linkedin}`,
    icon: Linkedin,
  },
  {
    name: 'Email',
    href: `mailto:${personalInfo.email}`,
    icon: Mail,
  },
];

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">{personalInfo.name}</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              {personalInfo.title} passionate about building exceptional digital experiences.
            </p>
            <p className="text-slate-400 text-sm">
              📍 {personalInfo.location}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="space-y-3 mb-6">
              <a
                href={`mailto:${personalInfo.email}`}
                className="block text-slate-400 hover:text-white transition-colors"
              >
                {personalInfo.email}
              </a>
              <p className="text-slate-400 text-sm">
                Currently at <span className="text-white font-medium">{personalInfo.currentCompany}</span>
              </p>
            </div>
            
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    <span className="sr-only">{link.name}</span>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} {personalInfo.name}. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>Built with</span>
              <Heart size={16} className="text-red-500" />
              <span>using Next.js & TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};