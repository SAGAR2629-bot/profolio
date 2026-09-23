import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import portfolioData directly using ES modules
import {
  personalInfo,
  stats,
  aboutText,
  interests,
  skills,
  projects,
  achievements,
  certificates,
  education,
  experience,
  certCategories
} from '../../portfolio/src/data/portfolioData.js';

const seedData = {
  profile: {
    name: personalInfo.name,
    title: personalInfo.tagline,
    short_intro: personalInfo.heroSubtitle,
    biography: aboutText,
    interests: interests,
    focus_areas: [
      "Reinforcement Learning & Quadruped Locomotion",
      "Real-time Computer Vision & Edge AI",
      "ROS2 Autonomous Navigation & SLAM",
      "Sim-to-Real Transfer Dynamics"
    ],
    social_links: {
      email: personalInfo.email,
      github: personalInfo.github,
      linkedin: personalInfo.linkedin,
      twitter: personalInfo.twitter,
      resumeUrl: personalInfo.resumeUrl
    }
  },
  home_content: {
    hero_badge: "ROBOTICS & EMBODIED AI",
    hero_name: personalInfo.name,
    hero_subtitle: personalInfo.heroSubtitle,
    hero_disciplines: ["AI/ML", "ROBOTICS", "COMPUTER VISION", "REINFORCEMENT LEARNING"],
    cta_primary: "[ VIEW PROJECTS ]",
    cta_secondary: "[ ABOUT ME ]",
    cta_tertiary: "[ CONTACT ]",
    stats: stats
  },
  projects: projects.map((p, index) => ({
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    short_description: p.description,
    full_description: p.description,
    year: "2025",
    category: p.color === 'cyan' ? 'AI/ML' : p.color === 'orange' ? 'Robotics' : 'Autonomous Systems',
    technologies: p.tech,
    status: "COMPLETED",
    github_url: p.github || "",
    demo_url: p.live || "",
    color: p.color,
    display_order: index,
    published: true,
    images: []
  })),
  achievements: achievements.map((a, index) => ({
    year: a.year,
    title: a.title,
    description: a.description,
    badge: a.badge,
    category: "Milestone",
    status: "COMPLETED",
    organization: "Official Archive",
    display_order: index,
    published: true,
    images: []
  })),
  certificates: certificates.map((c, index) => ({
    title: c.title,
    issuer: c.issuer,
    date: c.date,
    category: c.category,
    url: "",
    description: `Verified credential issued by ${c.issuer} in ${c.date}.`,
    color: c.color,
    display_order: index,
    published: true
  })),
  skills: skills.map((s, index) => ({
    category: s.category,
    color: s.color,
    icon: s.icon,
    items: s.items,
    display_order: index
  })),
  education: education.map((e, index) => ({
    degree: e.degree,
    institution: e.institution,
    duration: e.duration,
    description: e.description,
    relevant_courses: e.relevantCourses,
    display_order: index,
    published: true
  })),
  experience: experience.map((exp, index) => ({
    role: exp.role,
    company: exp.company,
    duration: exp.duration,
    description: exp.description,
    technologies: exp.tech,
    display_order: index,
    published: true
  }))
};

const outputPath = path.resolve(__dirname, 'portfolio.json');
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2), 'utf-8');
console.log(`Successfully generated independent seed data at ${outputPath}`);
