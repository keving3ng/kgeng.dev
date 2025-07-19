export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    id: 'faire-current',
    company: 'Faire',
    position: 'Software Engineer',
    duration: 'May 2025 - Present',
    location: 'Toronto, Ontario, Canada',
    type: 'full-time',
    current: true,
    description: 'Frontend on Catalog Growth team, building features to enhance the marketplace experience for retailers and brands.',
    achievements: [
      'Working on catalog growth initiatives to expand marketplace offerings',
      'Building responsive frontend components for better user experience',
      'Contributing to the growth of Faire\'s B2B marketplace platform',
    ],
    technologies: ['React', 'JavaScript', 'TypeScript', 'Frontend Development'],
  },
  {
    id: 'quarksys',
    company: 'QuarkSys',
    position: 'Software Engineer',
    duration: 'Mar 2023 - Mar 2025',
    location: 'Toronto, Ontario, Canada',
    type: 'full-time',
    current: false,
    description: 'Builder of Web SaaS products, contributing to the development of three products for business brokerage and real estate sectors.',
    achievements: [
      'Developed three SaaS products for business brokerage and real estate sectors',
      'Built full-stack web applications using React, JavaScript, TypeScript, and Java',
      'Implemented cloud infrastructure solutions using AWS services',
      'Worked with CI/CD pipelines to streamline development workflows',
    ],
    technologies: ['React.js', 'CI/CD', 'JavaScript', 'TypeScript', 'Java', 'AWS'],
  },
  {
    id: 'amazon',
    company: 'Amazon',
    position: 'Software Development Engineer I',
    duration: 'Aug 2022 - Mar 2023',
    location: 'Toronto, Ontario, Canada',
    type: 'full-time',
    current: false,
    description: 'Worked on Alexa Communications infrastructure, building backend services and communication protocols.',
    achievements: [
      'Developed backend services for Alexa Communications infrastructure',
      'Worked with Kotlin and Java to build scalable communication systems',
      'Implemented CI/CD pipelines and worked with SIP protocols',
      'Contributed to improving communication reliability and performance',
    ],
    technologies: ['CI/CD', 'SIP', 'Kotlin', 'Java', 'Backend Development'],
  },
  {
    id: 'rbc-2021',
    company: 'RBC',
    position: 'Student Developer',
    duration: 'May 2021 - Aug 2021',
    location: 'Toronto, Ontario, Canada',
    type: 'internship',
    current: false,
    description: 'Built web components for customer-facing applications and developed secure API endpoints.',
    achievements: [
      'Built web components for new customer journey using AngularJS',
      'Ensured components adhered to accessibility guidelines and testing coverage',
      'Developed API service endpoints with JWT validation in Java Spring',
      'Utilized JUnit for thorough testing, ensuring robust security and performance',
    ],
    technologies: ['AngularJS', 'Java', 'Spring', 'JWT', 'JUnit'],
  },
  {
    id: 'rbc-2020',
    company: 'RBC',
    position: 'Student Developer',
    duration: 'May 2020 - Aug 2020',
    location: 'Toronto, Ontario, Canada',
    type: 'internship',
    current: false,
    description: 'Developed high-performing web components and automated deployment tools.',
    achievements: [
      'Designed responsive and accessible web components using AngularJS',
      'Implemented unit and integration testing, improving page loading speed',
      'Developed automated release note generation tool using Angular and NodeJS',
      'Tool was deployed on Jenkins, reducing manual intervention in daily releases',
    ],
    technologies: ['Jenkins', 'Python', 'AngularJS', 'NodeJS', 'CI/CD'],
  },
];

export const education = [
  {
    institution: 'Carleton University',
    degree: 'Bachelor of Engineering - BEng',
    field: 'Software Engineering',
    duration: '2017 - 2022',
    location: 'Ottawa, Ontario, Canada',
    achievements: [
      'Completed software engineering program with focus on full-stack development',
      'Gained experience in various programming languages and technologies',
      'Participated in university engineering society leadership roles',
    ],
  },
];

export const volunteer = [
  {
    organization: 'Carleton Systems and Computer Engineering Society',
    position: 'President / VP Finance',
    duration: 'May 2018 - Apr 2020',
    description: 'Formerly President and Vice President of Finance of the Departmental Society of the Systems and Computer Engineering Department at Carleton University.',
    achievements: [
      'Handled day-to-day transactions and long-term financial planning of $5000 operating budget',
      'Worked on policy and the constitution, website, social media outreach',
      'Met with faculty and department, ran workshops for membership',
      'Participated actively in all happenings of the society',
    ],
  },
  {
    organization: 'Bell High School Relay For Life Committee',
    position: 'Team Captain Head, Luminary Head',
    duration: 'May 2016 - May 2017',
    category: 'Health',
    description: 'Leadership role in organizing fundraising events for cancer research.',
  },
];