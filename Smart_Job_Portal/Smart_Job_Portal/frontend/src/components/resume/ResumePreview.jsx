import React from 'react';

const ResumePreview = ({ resumeData }) => {
    const { personal, skills, projects, experience, education, certifications, achievements } = resumeData;

    const renderBulletPoints = (text) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1 || text.includes('•') || text.includes('- ')) {
            return (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-800">
                    {lines.map((line, i) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
                        return cleanLine ? <li key={i}>{cleanLine}</li> : null;
                    })}
                </ul>
            );
        }
        return <p className="mt-1 text-gray-800">{text}</p>;
    };

    const renderSkillCategory = (title, categorySkills) => {
        if (!categorySkills || categorySkills.length === 0) return null;
        return (
            <div className="mb-1 text-[10.5pt]">
                <span className="font-bold text-gray-900 mr-2">{title}:</span>
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
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 relative">
                <div id="print-area" className="w-full h-full p-10 bg-white print:p-0 aspect-[1/1.414] mx-auto overflow-y-auto custom-scrollbar font-sans text-[11pt] leading-normal text-black">

                    {/* 1. HEADER SECTION - Simplified for ATS */}
                    <header className="mb-8 text-center border-b-2 border-gray-900 pb-6">
                        <h1 className="text-4xl font-bold text-black uppercase tracking-tight mb-2">
                            {personal.fullName || 'YOUR NAME'}
                        </h1>
                        {personal.jobTitle && (
                            <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-wide uppercase">
                                {personal.jobTitle}
                            </h2>
                        )}

                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11pt] text-gray-900 font-medium">
                            {personal.email && (
                                <span className="flex items-center">{personal.email}</span>
                            )}
                            {personal.phone && (
                                <span className="flex items-center">{personal.phone}</span>
                            )}
                            {personal.linkedin && (
                                <span className="flex items-center">{personal.linkedin.replace('https://', '').replace('www.', '')}</span>
                            )}
                            {personal.github && (
                                <span className="flex items-center">{personal.github.replace('https://', '').replace('www.', '')}</span>
                            )}
                        </div>
                    </header>

                    {/* 2. PROFESSIONAL SUMMARY */}
                    {personal.summary && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Professional Summary</h3>
                            <p className="text-gray-900 text-[11pt] text-justify leading-relaxed">{personal.summary}</p>
                        </section>
                    )}

                    {/* 3. TECHNICAL SKILLS */}
                    {hasSkills && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Technical Skills</h3>
                            <div className="text-[11pt] text-gray-900 space-y-1.5">
                                {renderSkillCategory('Languages / Frontend', skills.frontend)}
                                {renderSkillCategory('Backend / Frameworks', skills.backend)}
                                {renderSkillCategory('Databases', skills.database)}
                                {renderSkillCategory('Tools', skills.tools)}
                            </div>
                        </section>
                    )}

                    {/* 4. EXPERIENCE */}
                    {experience.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Professional Experience</h3>
                            <div className="space-y-6">
                                {experience.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-black text-[11.5pt]">{exp.role || 'Job Role'}</h4>
                                            <span className="text-[11pt] font-bold text-gray-900">{exp.duration}</span>
                                        </div>
                                        <div className="text-[11pt] font-bold italic text-gray-800 mb-2">{exp.company}</div>
                                        <div className="text-[11pt] leading-relaxed">
                                            {renderBulletPoints(exp.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 5. PROJECTS */}
                    {projects.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Key Projects</h3>
                            <div className="space-y-5">
                                {projects.map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-black text-[11.5pt]">{proj.title || 'Project Title'}</h4>
                                        </div>
                                        <div className="text-[11pt] leading-relaxed">
                                            {renderBulletPoints(proj.description)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 6. EDUCATION */}
                    {education.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Education</h3>
                            <div className="space-y-4">
                                {education.map((edu, i) => (
                                    <div key={i} className="flex justify-between items-baseline">
                                        <div>
                                            <h4 className="font-bold text-black text-[11.5pt]">{edu.degree || 'Degree'}</h4>
                                            <div className="text-[11pt] text-gray-900 font-medium">{edu.college}</div>
                                        </div>
                                        <div className="text-[11pt] font-bold text-gray-900">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 7. CERTIFICATIONS */}
                    {certifications.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Certifications</h3>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-1 text-[11pt] text-gray-900">
                                {certifications.map((cert, i) => (
                                    <li key={i}>
                                        <span className="font-bold text-black">{cert.name}</span>
                                        {cert.issuer && <span> — {cert.issuer}</span>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* 8. ACHIEVEMENTS */}
                    {achievements.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-[12pt] font-bold text-black border-b border-gray-900 pb-1 mb-3 uppercase tracking-wider">Achievements</h3>
                            <ul className="list-disc list-outside ml-5 mt-1 space-y-1 text-[11pt] text-gray-900">
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
