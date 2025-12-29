export interface Experience {
  company: string
  role: string
  startDate: string
  endDate?: string
  current?: boolean
  logo: string
}

export interface Education {
  school: string
  degree: string
  startYear: number
  endYear: number
  logo: string
}

export const experiences: Experience[] = [
  {
    company: 'Faire',
    role: 'Software Engineer',
    startDate: 'May 2025',
    current: true,
    logo: 'https://asset.brandfetch.io/idponM_bNa/idyNaedWob.svg',
  },
  {
    company: 'QuarkSys',
    role: 'Software Engineer',
    startDate: 'Mar 2023',
    endDate: 'Mar 2025',
    logo: '', // No public logo available
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer I',
    startDate: 'Aug 2022',
    endDate: 'Mar 2023',
    logo: 'https://asset.brandfetch.io/idawLgPGvU/idLpbZdOlz.svg',
  },
  {
    company: 'RBC',
    role: 'Student Developer',
    startDate: 'May 2020',
    endDate: 'Aug 2021',
    logo: 'https://asset.brandfetch.io/idVfYwcuQa/id-2SMQL1v.svg',
  },
  {
    company: 'General Dynamics',
    role: 'Test Automation Engineer',
    startDate: 'Sept 2019',
    endDate: 'Apr 2020',
    logo: 'https://asset.brandfetch.io/idGinOm4QO/idA9MVIEUx.svg',
  },
]

export const education: Education = {
  school: 'Carleton University',
  degree: 'BEng, Software Engineering',
  startYear: 2017,
  endYear: 2022,
  logo: 'https://asset.brandfetch.io/id_LryP_44/id6_V8XqDz.png',
}

export const skills = {
  frontend: ['React', 'TypeScript', 'JavaScript', 'Next.js'],
  backend: ['Java', 'Spring Boot', 'Kotlin', 'Node.js'],
  cloud: ['AWS', 'Cloudflare'],
  data: ['PostgreSQL', 'DynamoDB', 'Redis'],
}

export const contact = {
  email: 'hello@kgeng.dev',
  github: 'https://github.com/keving3ng',
  linkedin: 'https://linkedin.com/in/keving3ng',
  twitter: 'https://twitter.com/keving3ng',
}
