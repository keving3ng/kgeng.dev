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
    description: 'Supporting brands (sellers) on the wholesale marketplace platform to maintain up-to-date product listings and catalog management. Working on frontend solutions for the Catalog Growth team to enhance the B2B marketplace experience.',
    achievements: [
      'Building catalog management tools to help brands maintain current product listings',
      'Developing frontend solutions using React and TypeScript for marketplace optimization',
      'Supporting seller experience improvements on Faire\'s B2B wholesale platform',
      'Contributing to web performance optimization and scalable frontend architecture',
    ],
    technologies: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Frontend Development', 'Web Performance'],
  },
  {
    id: 'quarksys',
    company: 'QuarkSys',
    position: 'Software Engineer',
    duration: 'Mar 2023 - Mar 2025',
    location: 'Toronto, Ontario, Canada',
    type: 'full-time',
    current: false,
    description: 'Full-stack software engineer focused on frontend development for three innovative SaaS products: BrokerAide (business brokerage platform), Ask Len (real estate information system), and Ask Prof Bruce AI (AI-powered advisory platform). Led frontend development and user experience improvements across all products.',
    achievements: [
      'Led frontend development for BrokerAide.io - comprehensive business brokerage platform enabling deal management, buyer-seller matching, and transaction workflows',
      'Built Ask Len (asklen.info) - real estate information and advisory system with dynamic data visualization and property analytics',
      'Developed Ask Prof Bruce AI (askprofbruce.ai) - AI-powered advisory platform with natural language processing and intelligent recommendation engine',
      'Architected responsive React applications with TypeScript, focusing on performance optimization and user experience',
      'Implemented full-stack features connecting React frontends to Java backend services and AWS cloud infrastructure',
      'Established CI/CD pipelines and development workflows that reduced deployment time by 60% across all three products',
      'Delivered significant business impact by improving user engagement metrics and streamlining complex business processes',
    ],
    technologies: ['React.js', 'TypeScript', 'JavaScript', 'Java', 'AWS', 'CI/CD', 'Node.js', 'REST APIs', 'Git'],
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