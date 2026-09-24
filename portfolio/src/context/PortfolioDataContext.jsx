/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as fallbackData from '../data/portfolioData';

const PortfolioDataContext = createContext(null);

const CLOUD_API_URL = 'https://profolio-api-2zt9.onrender.com';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }
  return CLOUD_API_URL;
};

export function PortfolioDataProvider({ children }) {
  // Initialize with complete fallback data
  const [data, setData] = useState({
    personalInfo: fallbackData.personalInfo,
    stats: fallbackData.stats,
    aboutText: fallbackData.aboutText,
    interests: fallbackData.interests,
    skills: fallbackData.skills,
    projects: fallbackData.projects,
    achievements: fallbackData.achievements,
    certificates: fallbackData.certificates,
    education: fallbackData.education,
    experience: fallbackData.experience,
    isLoadedFromApi: false,
  });

  useEffect(() => {
    const apiUrl = getApiUrl();
    let isMounted = true;

    const resolveMediaUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('/uploads/')) return `${apiUrl}${url}`;
      return url;
    };

    async function fetchPortfolio() {
      try {
        const res = await fetch(`${apiUrl}/api/public/portfolio`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const apiData = await res.json();

        if (!isMounted) return;

        // Map backend API data to public presentation shapes
        const profile = apiData.profile || {};
        const homeContent = apiData.home_content || {};

        const mergedPersonalInfo = {
          name: profile.name || homeContent.hero_name || fallbackData.personalInfo.name,
          tagline: profile.title || fallbackData.personalInfo.tagline,
          heroSubtitle: homeContent.hero_subtitle || profile.short_intro || fallbackData.personalInfo.heroSubtitle,
          heroBadge: homeContent.hero_badge || "ROBOTICS & EMBODIED AI",
          heroDisciplines: homeContent.hero_disciplines || ["AI/ML", "ROBOTICS", "COMPUTER VISION", "REINFORCEMENT LEARNING"],
          email: profile.social_links?.email || fallbackData.personalInfo.email,
          github: profile.social_links?.github || fallbackData.personalInfo.github,
          linkedin: profile.social_links?.linkedin || fallbackData.personalInfo.linkedin,
          twitter: profile.social_links?.twitter || fallbackData.personalInfo.twitter,
          resumeUrl: profile.social_links?.resumeUrl || fallbackData.personalInfo.resumeUrl,
        };

        const mappedProjects = (apiData.projects && apiData.projects.length > 0)
          ? apiData.projects.map(p => ({
              id: p.id,
              db_id: p.db_id,
              title: p.title,
              description: p.description,
              fullDescription: p.fullDescription,
              tech: p.technologies || [],
              technologies: p.technologies || [],
              github: p.github,
              live: p.demo,
              color: p.color || "cyan",
              year: p.year,
              category: p.category,
              status: p.status,
              image: resolveMediaUrl(p.image),
              images: (p.images || []).map(img => ({
                ...img,
                url: resolveMediaUrl(img.url)
              })),
              featured: !!p.featured,
              domain: p.domain || "Robotics / AI",
              platform: p.platform || "Physical & Simulation",
              overview: p.overview || "",
              problem: p.problem || "",
              approach: p.approach || "",
              implementation: p.implementation || "",
              architecture: p.architecture || "",
              engineering_notes: p.engineering_notes || "",
              metrics: p.metrics || [],
              challenges: p.challenges || [],
              milestones: p.milestones || [],
              links: p.links || {},
            }))
          : fallbackData.projects;

        const mappedAchievements = (apiData.achievements && apiData.achievements.length > 0)
          ? apiData.achievements.map(a => ({
              id: a.id,
              year: a.year,
              title: a.title,
              description: a.description,
              badge: a.badge || "🏆",
              category: a.category,
              status: a.status,
              organization: a.organization,
              featured: !!a.featured,
              accomplishment: a.accomplishment || "",
              contribution: a.contribution || "",
              result: a.result || "",
              related_project_slug: a.related_project_slug || "",
              verification_url: a.verification_url || "",
              event_date: a.event_date || "",
              image: resolveMediaUrl(a.image),
              images: (a.images || []).map(img => ({
                ...img,
                url: resolveMediaUrl(img.url)
              })),
            }))
          : fallbackData.achievements;

        const mappedCertificates = (apiData.certificates && apiData.certificates.length > 0)
          ? apiData.certificates.map(c => ({
              id: c.id,
              title: c.title,
              issuer: c.issuer,
              date: c.date,
              category: c.category,
              url: c.url,
              description: c.description,
              color: c.color || "cyan",
              credential_id: c.credential_id || "",
              verification_url: c.verification_url || c.url || "",
              related_skills: c.related_skills || [],
              related_project_slug: c.related_project_slug || "",
              featured: !!c.featured,
              image: resolveMediaUrl(c.image || (c.media ? c.media.url : "")),
              media: c.media ? { ...c.media, url: resolveMediaUrl(c.media.url) } : null,
              display_order: c.display_order || 0
            }))
          : fallbackData.certificates;

        const mappedEducation = (apiData.education && apiData.education.length > 0)
          ? apiData.education.map(e => ({
              id: e.id,
              degree: e.degree,
              institution: e.institution,
              duration: e.duration,
              description: e.description,
              relevantCourses: e.relevantCourses || e.relevant_courses || [],
              location: e.location || "",
              status: e.status || "COMPLETED",
              relatedProjects: e.relatedProjects || e.related_projects || [],
              relatedSkills: e.relatedSkills || e.related_skills || [],
              achievements: e.achievements || [],
              featured: !!e.featured,
              image: e.image || "",
              display_order: e.display_order || 0
            }))
          : fallbackData.education;

        const mappedExperience = (apiData.experience && apiData.experience.length > 0)
          ? apiData.experience.map(ex => ({
              id: ex.id,
              role: ex.role,
              company: ex.company,
              duration: ex.duration,
              description: ex.description,
              technologies: ex.technologies || ex.tech || [],
              tech: ex.technologies || ex.tech || [],
              location: ex.location || "",
              responsibilities: ex.responsibilities || [],
              workPerformed: ex.workPerformed || ex.work_performed || "",
              results: ex.results || "",
              relatedProjects: ex.relatedProjects || ex.related_projects || [],
              relatedSkills: ex.relatedSkills || ex.related_skills || [],
              externalUrl: ex.externalUrl || ex.external_url || "",
              featured: !!ex.featured,
              image: ex.image || "",
              display_order: ex.display_order || 0
            }))
          : fallbackData.experience;

        const mappedSkills = (apiData.skills && apiData.skills.length > 0)
          ? apiData.skills.map(s => ({
              id: s.id,
              category: s.category,
              color: s.color || "cyan",
              icon: s.icon || "⚙️",
              description: s.description || "",
              featured: !!s.featured,
              items: (s.items || []).map(item => {
                if (typeof item === 'string') {
                  return { name: item };
                }
                return item;
              }),
              display_order: s.display_order || 0
            }))
          : fallbackData.skills.map(s => ({
              ...s,
              items: s.items.map(item => typeof item === 'string' ? { name: item } : item)
            }));

        const dynamicStats = [
          { label: "Projects", value: mappedProjects.length, color: "cyan" },
          { label: "Achievements", value: mappedAchievements.length, color: "orange" },
          { label: "Certificates", value: mappedCertificates.length, color: "green" },
          { label: "Technologies", value: 30, color: "purple" },
        ];

        setData({
          personalInfo: mergedPersonalInfo,
          stats: dynamicStats,
          aboutText: profile.biography || fallbackData.aboutText,
          interests: (profile.interests && profile.interests.length > 0) ? profile.interests : fallbackData.interests,
          skills: mappedSkills,
          projects: mappedProjects,
          achievements: mappedAchievements,
          certificates: mappedCertificates,
          education: mappedEducation,
          experience: mappedExperience,
          isLoadedFromApi: true,
        });
      } catch (err) {
        // Fallback is maintained without disruption
        console.warn("[PortfolioData] Using local offline fallback:", err.message);
      }
    }

    fetchPortfolio();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PortfolioDataContext.Provider value={data}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}
