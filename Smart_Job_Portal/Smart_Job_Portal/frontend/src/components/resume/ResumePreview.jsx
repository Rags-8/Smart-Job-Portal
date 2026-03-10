import React from 'react';

const ResumePreview = ({ resumeData }) => {
    const { personal, skills, projects, experience, education, certifications, achievements } = resumeData;

    const renderMarkdown = (text) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const renderBulletPoints = (text) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1 || text.includes('•') || text.includes('- ')) {
            return (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-800">
                    {lines.map((line, i) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
                        return cleanLine ? <li key={i}>{renderMarkdown(cleanLine)}</li> : null;
                    })}
                </ul>
            );
        }
        return <p className="mt-1 text-gray-800">{renderMarkdown(text)}</p>;
    };

    const renderSkillCategory = (title, categorySkills) => {
        if (!categorySkills || categorySkills.length === 0) return null;
        return (
            <div className="mb-2">
                <span className="font-bold text-gray-900 mr-2 min-w-[140px] inline-block">{title}:</span>
                <span className="text-gray-800">{categorySkills.join(', ')}</span>
            </div>
        );
    };

    const hasSkills = skills.frontend.length > 0 || skills.backend.length > 0 || skills.database.length > 0 || skills.tools.length > 0;

    return (
        <div className="flex flex-col h-full bg-white">
            <style>
                {`
                @media print {
                    @page { margin: 15mm; size: auto; }
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    #print-area { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        color: black !important;
                    }
                    nav, button, .history-sidebar, .page-header { display: none !important; }
                }
                `}
            </style>
            <div className="flex-1 bg-white rounded-none overflow-hidden relative">
                <div id="print-area" className="w-full h-full p-12 bg-white print:p-0 aspect-[1/1.414] mx-auto overflow-y-auto custom-scrollbar font-sans text-[10.5pt] leading-normal text-slate-900">

                    {/* 1. HEADER SECTION - Simplified for ATS */}
                    <header className="mb-6 border-b-2 border-gray-900 pb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-baseline mb-1">
                                    <h1 className="text-[24pt] font-black text-black tracking-tight mr-3">
                                        {personal.fullName || 'YOUR NAME'}
                                    </h1>
                                    {personal.jobTitle && (
                                        <h2 className="text-[14pt] font-medium text-gray-800 italic">
                                            {personal.jobTitle}
                                        </h2>
                                    )}
                                </div>
                                <div className="flex flex-wrap text-[10pt] text-gray-900 font-medium gap-y-1 gap-x-5">
                                    {personal.email && (
                                        <span className="flex items-center">✉ {personal.email}</span>
                                    )}
                                    {personal.phone && (
                                        <span className="flex items-center">✆ {personal.phone}</span>
                                    )}
                                    {personal.linkedin && (
                                        <span className="flex items-center">in {personal.linkedin.replace('https://', '').replace('www.', '')}</span>
                                    )}
                                    {personal.github && (
                                        <span className="flex items-center">⌨ {personal.github.replace('https://', '').replace('www.', '')}</span>
                                    )}
                                </div>
                            </div>
                            {personal.profile_photo && (
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-900 flex-shrink-0 ml-6">
                                    <img 
                                        src={personal.profile_photo} 
                                        alt={personal.fullName} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>
                    </header>

                    {/* 1. PROFESSIONAL SUMMARY / PROFILE */}
                    {personal.summary && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Profile</h3>
                            <p className="text-slate-800 text-[10.5pt] text-justify leading-relaxed">{renderMarkdown(personal.summary)}</p>
                        </section>
                    )}

                    {/* 5. EDUCATION */}
                    {education.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Education</h3>
                            <div className="space-y-4">
                                {education.map((edu, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="flex justify-between items-baseline mb-1">
                                             <h4 className="font-bold text-slate-900 text-[11pt]">{edu.degree || 'Degree Name'}</h4>
                                             <span className="text-[10pt] font-black text-slate-600 tracking-tighter">{edu.year || 'Year'}</span>
                                         </div>
                                        <div className="flex justify-between items-baseline text-[10.5pt]">
                                            <span className="text-slate-800 font-medium">{edu.college || 'University Name'}</span>
                                            {edu.cgpa && <span className="text-[9pt] font-bold text-violet-600">CGPA: {edu.cgpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 2. TECHNICAL SKILLS */}
                    {hasSkills && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Skills</h3>
                            <div className="text-[10pt] text-slate-800 space-y-1">
                                {renderSkillCategory('Frontend', skills.frontend)}
                                {renderSkillCategory('Backend', skills.backend)}
                                {renderSkillCategory('Databases', skills.database)}
                                {renderSkillCategory('Tools & DevOps', skills.tools)}
                            </div>
                        </section>
                    )}

                    {/* 3. EXPERIENCE */}
                    {experience.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Experience</h3>
                            <div className="space-y-6">
                                {experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-slate-900 text-[11.5pt]">{exp.role || 'Job Role'}</h4>
                                            <span className="text-[10pt] font-black text-slate-600 uppercase">{exp.duration}</span>
                                        </div>
                                        <div className="text-[10.5pt] font-bold text-violet-700 mb-2">{exp.company}</div>
                                        <div className="text-[10pt] leading-relaxed text-slate-700">
                                            {renderBulletPoints(exp.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 4. PROJECTS */}
                    {projects.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Projects</h3>
                            <div className="space-y-6">
                                {projects.map((proj, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-slate-900 text-[11.5pt] mb-1">{proj.title || 'Project Title'}</h4>
                                        <div className="text-[10pt] leading-relaxed text-slate-700">
                                            {renderBulletPoints(proj.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}



                    {/* 6. CERTIFICATIONS */}
                    {certifications.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Certifications</h3>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-2 text-[10pt] text-slate-800">
                                {certifications.map((cert, i) => (
                                    <li key={i}>
                                        <span className="font-bold text-slate-900">{cert.name}</span>
                                        {cert.issuer && <span className="text-slate-600 italic"> — {cert.issuer}</span>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
 
                    {/* 7. ACHIEVEMENTS */}
                    {achievements.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-tight">Achievements</h3>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-2 text-[10pt] text-slate-800">
                                {achievements.map((achiev, i) => (
                                    <li key={i}>{renderMarkdown(achiev.description)}</li>
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
