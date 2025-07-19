export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: 'web' | 'ml' | 'api' | 'learning';
  status: 'completed' | 'in-progress' | 'archived';
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 'shoppy',
    title: 'Shoppy',
    description: 'React-based e-commerce UI with database integration',
    longDescription: 'A modern e-commerce user interface built with React, focusing on clean design and seamless user experience. This project explores database integration patterns and modern frontend development practices.',
    technologies: ['React', 'JavaScript', 'CSS', 'Database Integration'],
    category: 'web',
    status: 'completed',
    githubUrl: 'https://github.com/keving3ng/shoppy',
    featured: true,
  },
  {
    id: 'discord-bot',
    title: 'Discord Bot',
    description: 'API experimentation with Discord Bot development',
    longDescription: 'A Discord bot project focused on learning API integration and automation. Built with Python to explore bot development patterns and Discord API capabilities.',
    technologies: ['Python', 'Discord API', 'Bot Development'],
    category: 'api',
    status: 'completed',
    githubUrl: 'https://github.com/keving3ng/discord-bot',
    featured: false,
  },
  {
    id: 'face-recognition',
    title: 'Face Recognition System',
    description: 'Machine learning application using TensorFlow/Keras',
    longDescription: 'An advanced machine learning project implementing face recognition using TensorFlow and Keras. Explores computer vision techniques and neural network architectures for image classification.',
    technologies: ['Python', 'TensorFlow', 'Keras', 'Computer Vision', 'Machine Learning'],
    category: 'ml',
    status: 'completed',
    githubUrl: 'https://github.com/keving3ng/face-recognition',
    featured: true,
  },
  {
    id: 'ml-course',
    title: 'Stanford ML Course Solutions',
    description: 'MATLAB implementations following Andrew Ng\'s course',
    longDescription: 'Complete solutions and implementations for Stanford\'s Machine Learning course taught by Andrew Ng. Features MATLAB implementations of key algorithms and concepts in machine learning.',
    technologies: ['MATLAB', 'Machine Learning', 'Algorithms', 'Data Science'],
    category: 'learning',
    status: 'completed',
    githubUrl: 'https://github.com/keving3ng/stanford-ml-course',
    featured: false,
  },
  {
    id: 'portfolio-website',
    title: 'Portfolio Website',
    description: 'Modern portfolio built with Next.js and TypeScript',
    longDescription: 'A sleek, modern portfolio website showcasing projects and skills. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring smooth animations and responsive design.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React'],
    category: 'web',
    status: 'in-progress',
    githubUrl: 'https://github.com/keving3ng/kgeng.dev',
    liveUrl: 'https://kgeng.dev',
    featured: true,
  },
];