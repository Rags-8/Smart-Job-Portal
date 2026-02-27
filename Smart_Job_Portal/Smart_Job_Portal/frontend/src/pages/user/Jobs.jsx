import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [selectedJob, setSelectedJob] = useState(null); // For Job Details Modal
    const [applyingJob, setApplyingJob] = useState(null); // For Application Form Modal

    // Application Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        skills: '',
        experience: '',
        resume_text: '',
        github_url: '',
        linkedin_url: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (err) {
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();

        if (!applyingJob || !formData.resume_text.trim()) {
            alert('Please complete all form fields and paste your resume text.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit application details to backend directly without file upload
            await api.post(`/applications/${applyingJob.id}`, {
                ...formData,
                resume_url: formData.resume_text // Send text, backend will save as text
            });

            alert('Application submitted successfully.');

            // Clean up and close modals
            closeModals();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || err.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModals = () => {
        setSelectedJob(null);
        setApplyingJob(null);
        setFormData({ full_name: '', email: '', phone_number: '', skills: '', experience: '', resume_text: '', github_url: '', linkedin_url: '' });
    };

    // Check if a job is expired based on application_last_date
    const isJobExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center animate-slide-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Opportunity</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100/90 font-medium">
                        Explore thousands of job openings from top companies and advance your career today.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 text-center mb-8 shadow-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-2xl p-6 hover-lift border border-gray-100 flex flex-col h-full relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 leading-tight pr-4">{job.title}</h2>
                                            <p className="text-blue-600 font-bold mt-1 text-sm">{job.company_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-5 bg-blue-50 text-blue-700">
                                            {job.job_type}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-5 bg-gray-100 text-gray-700">
                                            Exp: {job.experience_required}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm font-medium text-gray-600">
                                        <p className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            {job.location}
                                        </p>
                                        <p className="flex items-center text-emerald-600">
                                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            ₹{job.salary?.toLocaleString('en-IN') || 'Competitive'}
                                        </p>
                                        {job.application_last_date && (
                                            <p className="flex items-center text-red-500">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Apply by: {new Date(job.application_last_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5">Required Skills</p>
                                        <div className="flex flex-wrap gap-1.5 line-clamp-2 overflow-hidden max-h-16">
                                            {job.skills_required && job.skills_required.slice(0, 4).map((skill, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills_required && job.skills_required.length > 4 && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">+{job.skills_required.length - 4}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => setSelectedJob(job)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Open
                                    </button>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs available</h3>
                                <p className="text-gray-500 font-medium">Check back later for new opportunities.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Overlay: Job Details */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 p-0 overflow-y-auto w-full h-full">
                    {/* Dark Background */}
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModals}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up">
                        {/* Header */}
                        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight pr-8">{selectedJob.title}</h2>
                                <p className="text-lg font-bold text-blue-600 mt-2">{selectedJob.company_name}</p>
                            </div>
                            <button onClick={closeModals} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Details (Left Col) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">About the Role</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                                </div>

                                {selectedJob.responsibilities && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Key Responsibilities</h3>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                                    </div>
                                )}

                                {selectedJob.requirements && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Requirements</h3>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                                    </div>
                                )}

                                {selectedJob.benefits && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Benefits</h3>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.benefits}</p>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Info (Right Col) */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 text-center">Summary</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Location</span>
                                            <span className="block text-sm font-bold text-gray-900">{selectedJob.location}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Job Type</span>
                                            <span className="block text-sm font-bold text-gray-900">{selectedJob.job_type}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Experience</span>
                                            <span className="block text-sm font-bold text-gray-900">{selectedJob.experience_required}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Salary</span>
                                            <span className="block text-sm font-bold text-emerald-600">₹{selectedJob.salary?.toLocaleString('en-IN') || 'Competitive'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Openings</span>
                                            <span className="block text-sm font-bold text-gray-900">{selectedJob.number_of_openings || 1}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 font-semibold mb-1">Last Date</span>
                                            <span className="block text-sm font-bold text-red-600">
                                                {selectedJob.application_last_date ? new Date(selectedJob.application_last_date).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.skills_required.map((skill, idx) => (
                                                <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.company_description && (
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About Company</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedJob.company_description}</p>
                                        {selectedJob.company_website && (
                                            <a href={selectedJob.company_website} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                Visit Website &rarr;
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Apply Button Action */}
                        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 flex justify-end">
                            {user?.role === 'user' ? (
                                !isJobExpired(selectedJob.application_last_date) ? (
                                    <button
                                        onClick={() => {
                                            setApplyingJob(selectedJob);
                                            setSelectedJob(null); // Switch to application modal
                                        }}
                                        className="w-full sm:w-auto px-8 py-3.5 border border-transparent text-sm font-extrabold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:-translate-y-0.5 transition-all"
                                    >
                                        Apply for this position
                                    </button>
                                ) : (
                                    <button disabled className="w-full sm:w-auto px-8 py-3.5 border border-transparent text-sm font-extrabold rounded-xl text-gray-500 bg-gray-200 cursor-not-allowed">
                                        Application Closed
                                    </button>
                                )
                            ) : !user ? (
                                <div className="text-sm font-bold text-blue-600 bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                                    Login as a Job Seeker to apply
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay: Job Application Form */}
            {applyingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto w-full h-full">
                    {/* Dark Background */}
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={!isSubmitting ? closeModals : undefined}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up">
                        {/* Header */}
                        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Submit Application</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">Applying for <strong className="text-gray-900">{applyingJob.title}</strong> at {applyingJob.company_name}</p>
                            </div>
                            {!isSubmitting && (
                                <button onClick={closeModals} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={submitApplication} className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Years of Experience *</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="e.g. 3 years"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">GitHub URL</label>
                                    <input
                                        type="url"
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="https://github.com/username"
                                        value={formData.github_url}
                                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900"
                                        placeholder="https://www.linkedin.com/in/username"
                                        value={formData.linkedin_url}
                                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Key Skills *</label>
                                <textarea
                                    required
                                    rows="2"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900 resize-y"
                                    placeholder="List your most relevant skills (React, Python, Marketing...)"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Paste Your Resume *</label>
                                <textarea
                                    required
                                    rows="6"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 hover:bg-white focus:bg-white font-medium text-gray-900 resize-y whitespace-pre-wrap"
                                    placeholder="Paste the plain text of your entire resume here..."
                                    value={formData.resume_text}
                                    onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 font-medium mt-2 ml-1">We no longer require PDF/DOC uploads. Simply copy and paste the text of your resume above.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 border border-transparent text-sm font-extrabold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Jobs;
