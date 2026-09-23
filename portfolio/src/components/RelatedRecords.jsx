import React from 'react';
import { Link } from 'react-router-dom';
import './RelatedRecords.css';

export default function RelatedRecords({
  skills = [],
  projects = [],
  certificates = [],
  achievements = [],
  experience = [],
  education = [],
  title = "CONNECTED ARCHIVE RECORDS"
}) {
  const hasSkills = Array.isArray(skills) && skills.length > 0;
  const hasProjects = Array.isArray(projects) && projects.length > 0;
  const hasCerts = Array.isArray(certificates) && certificates.length > 0;
  const hasAchievements = Array.isArray(achievements) && achievements.length > 0;
  const hasExperience = Array.isArray(experience) && experience.length > 0;
  const hasEducation = Array.isArray(education) && education.length > 0;

  if (!hasSkills && !hasProjects && !hasCerts && !hasAchievements && !hasExperience && !hasEducation) {
    return null;
  }

  return (
    <section className="related-records-panel retro-panel">
      <div className="related-records-header">
        <span className="related-lamp" aria-hidden="true" />
        <h4 className="related-records-title">// {title}</h4>
      </div>

      <div className="related-records-grid">
        {hasProjects && (
          <div className="related-group">
            <span className="related-label">🚀 RELATED PROJECTS:</span>
            <div className="related-chips">
              {projects.map((p, idx) => {
                const label = typeof p === 'string' ? p : (p.title || p.name || `Project ${idx+1}`);
                return (
                  <Link key={idx} to="/projects" className="retro-tag retro-tag--yellow related-link">
                    {label} ➔
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasSkills && (
          <div className="related-group">
            <span className="related-label">⚙️ TECHNICAL SKILLS:</span>
            <div className="related-chips">
              {skills.map((s, idx) => {
                const label = typeof s === 'string' ? s : (s.name || `Skill ${idx+1}`);
                return (
                  <Link key={idx} to="/skills" className="retro-tag retro-tag--cyan related-link">
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasCerts && (
          <div className="related-group">
            <span className="related-label">📜 CREDENTIALS & CERTIFICATES:</span>
            <div className="related-chips">
              {certificates.map((c, idx) => {
                const label = typeof c === 'string' ? c : (c.title || `Cert ${idx+1}`);
                return (
                  <Link key={idx} to="/certificates" className="retro-tag retro-tag--green related-link">
                    {label} ➔
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasAchievements && (
          <div className="related-group">
            <span className="related-label">🏆 ACHIEVEMENTS & MILESTONES:</span>
            <div className="related-chips">
              {achievements.map((a, idx) => {
                const label = typeof a === 'string' ? a : (a.title || `Achievement ${idx+1}`);
                return (
                  <Link key={idx} to="/achievements" className="retro-tag retro-tag--orange related-link">
                    {label} ➔
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasExperience && (
          <div className="related-group">
            <span className="related-label">💼 FIELD EXPERIENCE:</span>
            <div className="related-chips">
              {experience.map((e, idx) => {
                const label = typeof e === 'string' ? e : (`${e.role} @ ${e.company}`);
                return (
                  <Link key={idx} to="/experience" className="retro-tag retro-tag--purple related-link">
                    {label} ➔
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasEducation && (
          <div className="related-group">
            <span className="related-label">🎓 ACADEMIC RECORD:</span>
            <div className="related-chips">
              {education.map((ed, idx) => {
                const label = typeof ed === 'string' ? ed : (ed.degree || `Degree ${idx+1}`);
                return (
                  <Link key={idx} to="/education" className="retro-tag retro-tag--yellow related-link">
                    {label} ➔
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
