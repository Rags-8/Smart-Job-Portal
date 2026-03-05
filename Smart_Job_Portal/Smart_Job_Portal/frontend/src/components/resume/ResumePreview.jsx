import React from 'react';

const ResumePreview = ({ resumeData }) => {
    const { personal, skills, projects, experience, education, certifications, achievements } = resumeData;

    const renderBulletPoints = (text) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1 || text.includes('•') || text.includes('- ')) {
            return (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-gray-700">
                    {lines.map((line, i) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
                        return cleanLine ? <li key={i}>{cleanLine}</li> : null;
                    })}
                </ul>
            );
        }
        return <p className="mt-1 text-gray-700">{text}</p>;
    };

    const renderSkillCategory = (title, categorySkills) => {
        if (!categorySkills || categorySkills.length === 0) return null;
        return (
            <div className="mb-1">
                <span className="font-bold text-gray-900 mr-2">{title}:</span>
                <span className="text-gray-700">{categorySkills.join(', ')}</span>
            </div>
        );
    };

    const hasSkills = skills.frontend.length > 0 || skills.backend.length > 0 || skills.database.length > 0 || skills.tools.length > 0;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 relative">
                <div id="print-area" className="w-full h-full p-8 md:p-10 bg-white print:p-0 aspect-[1/1.414] mx-auto overflow-y-auto custom-scrollbar font-['Inter',sans-serif] text-[11pt] leading-snug">

                    {/* 1. HEADER SECTION */}
                    <header className="mb-6 text-center border-b border-gray-100 pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-2">{personal.fullName || 'YOUR NAME'}</h1>
                        {personal.jobTitle && <h2 className="text-lg font-bold text-gray-800 uppercase mb-3 tracking-wide">{personal.jobTitle}</h2>}

                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10pt] text-gray-600 font-medium">
                            {personal.email && (
                                <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>{personal.email}</span>
                            )}
                            {personal.phone && (
                                <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>{personal.phone}</span>
                            )}
                            {personal.linkedin && (
                                <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>{personal.linkedin.replace('https://', '').replace('www.', '')}</span>
                            )}
                            {personal.github && (
                                <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>{personal.github.replace('https://', '').replace('www.', '')}</span>
                            )}
                            {personal.portfolio && (
                                <span className="flex items-center"><svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>{personal.portfolio.replace('https://', '').replace('www.', '')}</span>
                            )}
                        </div>
                    </header>

                    {/* 2. PROFESSIONAL SUMMARY */}
                    {personal.summary && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Professional Summary</h3>
                            <p className="text-gray-700 text-[10pt] text-justify leading-normal">{personal.summary}</p>
                        </section>
                    )}

                    {/* 3. TECHNICAL SKILLS */}
                    {hasSkills && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Technical Skills</h3>
                            <div className="text-[10pt] text-gray-700 space-y-1">
                                {renderSkillCategory('Languages/Frontend', skills.frontend)}
                                {renderSkillCategory('Backend/Frameworks', skills.backend)}
                                {renderSkillCategory('Databases', skills.database)}
                                {renderSkillCategory('Tools', skills.tools)}
                            </div>
                        </section>
                    )}

                    {/* 4. PROJECTS */}
                    {projects.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Projects</h3>
                            <div className="space-y-4">
                                {projects.map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="font-bold text-gray-900 text-[10.5pt]">{proj.title || 'Project Title'}</h4>
                                        </div>
                                        <div className="text-[10pt]">
                                            {renderBulletPoints(proj.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 5. EXPERIENCE (OPTIONAL) */}
                    {experience.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Experience</h3>
                            <div className="space-y-4">
                                {experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-900 text-[10.5pt]">{exp.role || 'Job Role'}</h4>
                                            <span className="text-[10pt] font-medium text-gray-600">{exp.duration}</span>
                                        </div>
                                        <div className="text-[10pt] italic text-gray-700 mb-1">{exp.company}</div>
                                        <div className="text-[10pt]">
                                            {renderBulletPoints(exp.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 6. EDUCATION */}
                    {education.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Education</h3>
                            <div className="space-y-3">
                                {education.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-baseline">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-[10.5pt]">{edu.degree || 'Degree'}</h4>
                                            <div className="text-[10pt] text-gray-700">{edu.college}</div>
                                        </div>
                                        <div className="text-[10pt] font-medium text-gray-600">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 7. CERTIFICATIONS (OPTIONAL) */}
                    {certifications.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Certifications</h3>
                            <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[10pt] text-gray-700">
                                {certifications.map((cert, i) => (
                                    <li key={i}>
                                        <span className="font-semibold text-gray-800">{cert.name}</span>
                                        {cert.issuer && <span> — {cert.issuer}</span>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* 8. ACHIEVEMENTS (OPTIONAL) */}
                    {achievements.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-[11pt] font-semibold text-gray-800 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wide">Achievements & Extracurriculars</h3>
                            <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[10pt] text-gray-700">
                                {achievements.map((achiev, i) => (
                                    <li key={i}>{achiev.description}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ResumePreview;
