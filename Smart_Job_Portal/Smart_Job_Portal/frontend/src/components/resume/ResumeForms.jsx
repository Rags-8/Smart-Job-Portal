import React, { useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';

const ResumeForms = ({ currentStep, setCurrentStep, resumeData, updateData }) => {
    const handlePersonalChange = (e) => {
        updateData('personal', { ...resumeData.personal, [e.target.name]: e.target.value });
    };

    const handleAISuggestion = (section) => {
        if (section === 'skills') {
            const suggestedFrontend = ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'];
            const suggestedBackend = ['Node.js', 'Express', 'Python', 'Java'];
            const suggestedDatabase = ['MySQL', 'MongoDB', 'PostgreSQL'];
            const suggestedTools = ['Git', 'GitHub', 'Docker', 'AWS', 'Postman'];

            updateData('skills', {
                frontend: [...new Set([...resumeData.skills.frontend, ...suggestedFrontend])],
                backend: [...new Set([...resumeData.skills.backend, ...suggestedBackend])],
                database: [...new Set([...resumeData.skills.database, ...suggestedDatabase])],
                tools: [...new Set([...resumeData.skills.tools, ...suggestedTools])]
            });
        } else if (section === 'summary') {
            updateData('personal', {
                ...resumeData.personal,
                summary: "A highly motivated and results-driven software engineer with experience in full-stack development. Proven ability to architect scalable applications, optimize performance, and collaborate with cross-functional teams to deliver impactful solutions."
            });
        }
    };

    const addArrayItem = (key, defaultItem) => {
        updateData(key, [...resumeData[key], defaultItem]);
    };

    const updateArrayItem = (key, index, field, value) => {
        const newData = [...resumeData[key]];
        newData[index][field] = value;
        updateData(key, newData);
    };

    const removeArrayItem = (key, index) => {
        const newData = [...resumeData[key]];
        newData.splice(index, 1);
        updateData(key, newData);
    };

    const renderPersonal = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-display">Personal Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Information to help recruiters contact you.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleAISuggestion('summary')}
                    className="inline-flex items-center text-sm font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors"
                >
                    <Wand2 className="w-4 h-4 mr-1.5" /> AI Summary
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" name="fullName" value={resumeData.personal.fullName} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="e.g. John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
                    <input type="text" name="jobTitle" value={resumeData.personal.jobTitle} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="e.g. Senior Software Engineer" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input type="email" name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (Optional)</label>
                    <input type="tel" name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="+1 234 567 890" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Professional Summary</label>
                    <textarea name="summary" value={resumeData.personal.summary} onChange={handlePersonalChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900 custom-scrollbar" placeholder="Briefly describe your career objectives and top skills..."></textarea>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn URL (Optional)</label>
                    <input type="url" name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Portfolio URL (Optional)</label>
                        <input type="url" name="portfolio" value={resumeData.personal.portfolio} onChange={handlePersonalChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900" placeholder="https://portfolio.com/..." />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEducation = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Education</h2>
                <p className="text-sm text-gray-500 mt-1">List your degrees and educational background.</p>
            </div>

            {resumeData.education.map((edu, index) => (
                <div key={index} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative group transition-all hover:border-violet-200">
                    <button type="button" onClick={() => removeArrayItem('education', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Degree / Certification</label>
                            <input type="text" value={edu.degree} onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. B.S. in Computer Science" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">University / College</label>
                            <input type="text" value={edu.college} onChange={(e) => updateArrayItem('education', index, 'college', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. MIT" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Graduation Year</label>
                            <input type="text" value={edu.year} onChange={(e) => updateArrayItem('education', index, 'year', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. 2024" />
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem('education', { degree: '', college: '', year: '' })}
                className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Education
            </button>
        </div>
    );

    const [skillInput, setSkillInput] = useState({ frontend: '', backend: '', database: '', tools: '' });

    const handleAddSkill = (e, category) => {
        e.preventDefault();
        const value = skillInput[category].trim();
        if (value && !resumeData.skills[category].includes(value)) {
            updateData('skills', {
                ...resumeData.skills,
                [category]: [...resumeData.skills[category], value]
            });
            setSkillInput(prev => ({ ...prev, [category]: '' }));
        }
    };

    const removeSkill = (category, skillToRemove) => {
        updateData('skills', {
            ...resumeData.skills,
            [category]: resumeData.skills[category].filter(s => s !== skillToRemove)
        });
    };

    const renderSkillCategory = (title, category) => (
        <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-2">{title}</h3>
            <form onSubmit={(e) => handleAddSkill(e, category)} className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={skillInput[category]}
                    onChange={(e) => setSkillInput(prev => ({ ...prev, [category]: e.target.value }))}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm"
                    placeholder={`Add ${title.toLowerCase()} skill...`}
                />
                <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Add</button>
            </form>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-100">
                {resumeData.skills[category].length === 0 && <span className="text-gray-400 text-xs italic m-auto">No {title.toLowerCase()} skills added.</span>}
                {resumeData.skills[category].map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm animate-in zoom-in duration-200">
                        {skill}
                        <button type="button" onClick={() => removeSkill(category, skill)} className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-display">Technical Skills</h2>
                    <p className="text-sm text-gray-500 mt-1">Categorize your skills strictly for ATS parsing.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleAISuggestion('skills')}
                    className="inline-flex items-center text-sm font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors"
                >
                    <Wand2 className="w-4 h-4 mr-1.5" /> AI Skill Suggestions
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {renderSkillCategory('Frontend', 'frontend')}
                {renderSkillCategory('Backend', 'backend')}
                {renderSkillCategory('Database', 'database')}
                {renderSkillCategory('Tools', 'tools')}
            </div>
        </div>
    );

    const renderExperience = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Experience</h2>
                <p className="text-sm text-gray-500 mt-1">List your work history, starting with the most recent.</p>
            </div>

            {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative group transition-all hover:border-violet-200">
                    <button type="button" onClick={() => removeArrayItem('experience', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Company Name</label>
                            <input type="text" value={exp.company} onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. Google" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Job Role</label>
                            <input type="text" value={exp.role} onChange={(e) => updateArrayItem('experience', index, 'role', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. Data Scientist" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Duration</label>
                            <input type="text" value={exp.duration} onChange={(e) => updateArrayItem('experience', index, 'duration', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. Jan 2021 - Present" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                            <textarea value={exp.description} onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)} rows="3" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 custom-scrollbar" placeholder="Describe your responsibilities and achievements... Use bullet points for best results."></textarea>
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', description: '' })}
                className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Experience
            </button>
        </div>
    );

    const renderProjects = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Projects</h2>
                <p className="text-sm text-gray-500 mt-1">Showcase your notable personal or professional projects.</p>
            </div>

            {resumeData.projects.map((proj, index) => (
                <div key={index} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative group transition-all hover:border-violet-200">
                    <button type="button" onClick={() => removeArrayItem('projects', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Project Title</label>
                            <input type="text" value={proj.title} onChange={(e) => updateArrayItem('projects', index, 'title', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. E-Commerce Platform" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                            <textarea value={proj.description} onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)} rows="3" className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 custom-scrollbar" placeholder="Technologies used and what you built..."></textarea>
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem('projects', { title: '', description: '' })}
                className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Project
            </button>
        </div>
    );

    const renderCertifications = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Certifications <span className="text-sm font-normal text-gray-400">(Optional)</span></h2>
                <p className="text-sm text-gray-500 mt-1">Add notable courses or certifications.</p>
            </div>

            {resumeData.certifications.map((cert, index) => (
                <div key={index} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative group transition-all hover:border-violet-200">
                    <button type="button" onClick={() => removeArrayItem('certifications', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Course Name</label>
                            <input type="text" value={cert.name} onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. AWS Solutions Architect" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Platform / Issuer</label>
                            <input type="text" value={cert.issuer} onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. Coursera" />
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem('certifications', { name: '', issuer: '' })}
                className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Certification
            </button>
        </div>
    );

    const renderAchievements = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Achievements <span className="text-sm font-normal text-gray-400">(Optional)</span></h2>
                <p className="text-sm text-gray-500 mt-1">Hackathons, awards, or leadership roles.</p>
            </div>

            {resumeData.achievements.map((achiev, index) => (
                <div key={index} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative group transition-all hover:border-violet-200">
                    <button type="button" onClick={() => removeArrayItem('achievements', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                            <input type="text" value={achiev.description} onChange={(e) => updateArrayItem('achievements', index, 'description', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="e.g. 1st Place - Global Hackathon 2023" />
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem('achievements', { description: '' })}
                className="flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50/50 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" /> Add Achievement
            </button>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full overflow-y-auto custom-scrollbar">
            {currentStep === 0 && renderPersonal()}
            {currentStep === 1 && renderSkills()}
            {currentStep === 2 && renderProjects()}
            {currentStep === 3 && renderExperience()}
            {currentStep === 4 && renderEducation()}
            {currentStep === 5 && renderCertifications()}
            {currentStep === 6 && renderAchievements()}
            {currentStep === 7 && (
                <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 font-display mb-2">Resume Ready for Review</h2>
                    <p className="text-gray-500 max-w-md">Your structured software engineer resume data is complete! Please preview the document on the right to ensure accuracy before saving or downloading.</p>
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                {currentStep < 7 ? (
                    <button
                        onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                    >
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentStep(0)}
                        className="px-6 py-2.5 rounded-xl text-violet-600 font-semibold hover:bg-violet-50 transition-colors"
                    >
                        Edit Resume
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResumeForms;
