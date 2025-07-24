'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Home', href: '/' as const, section: '#home' },
  { name: 'About', href: '/about' as const, section: '#about' },
  { name: 'Experience', href: '/experience' as const, section: '#experience' },
  { name: 'Skills', href: '/skills' as const, section: '#skills' },
  { name: 'Projects', href: '/projects' as const, section: '#projects' },
  { name: 'Education', href: '/education' as const, section: '#education' },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/keving3ng',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/keving3ng',
    icon: Linkedin,
  },
  {
    name: 'Email',
    href: 'mailto:kevin@kgeng.dev',
    icon: Mail,
  },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavigation = (item: any) => {
    setIsMobileMenuOpen(false);
    
    // If we're on the home page, scroll to section
    if (pathname === '/' && item.section) {
      scrollToSection(item.section);
    }
    // Otherwise, navigate to the page (handled by Link component)
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className={`text-xl font-bold transition-colors ${
                isScrolled 
                  ? 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400' 
                  : 'text-white hover:text-blue-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Kevin Geng
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name}>
                {pathname === '/' && item.section ? (
                  <button
                    onClick={() => scrollToSection(item.section)}
                    className={`text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                      pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                      pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Social Links & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Icon size={18} />
                  <span className="sr-only">{link.name}</span>
                </a>
              );
            })}
            <Link href="/education">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-4">
                Contact
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="px-6 py-4 space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {pathname === '/' && item.section ? (
                    <button
                      onClick={() => scrollToSection(item.section)}
                      className={`block w-full text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2 ${
                        pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block w-full text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2 ${
                        pathname === item.href ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex space-x-4 mb-4">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Icon size={20} />
                        <span className="sr-only">{link.name}</span>
                      </a>
                    );
                  })}
                </div>
                <Link href="/education">
                  <Button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Contact
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};