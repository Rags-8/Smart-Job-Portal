import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const Applicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [viewingResume, setViewingResume] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            const { data } = await api.get(`/applications/job/${jobId}`);
            setApplicants(data);
        } catch (err) {
            setError('Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const { data } = await api.put(`/applications/${id}/status`, { status });
            // Update local state to reflect new status
            setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: data.status } : app));
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto animate-fade-in">
                <div className="mb-8">
                    <Link to="/admin/my-jobs" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-6 group">
                        <svg className="w-5 h-5 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg>
                        Back to Listings
                    </Link>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Review Applicants</h1>
                            <p className="text-gray-600 mt-2 font-medium">Candidates who have applied to this position.</p>
                        </div>
                        <div className="bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide mr-3">Total</span>
                            <span className="text-xl font-extrabold text-indigo-600">{applicants.length}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 text-center mb-8 shadow-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden relative">
                        {applicants.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {applicants.map((applicant) => (
                                    <div key={applicant.id} className="p-6 sm:p-8 hover:bg-gray-50 transition-colors flex flex-col items-start gap-4 group border-b border-gray-100 last:border-0">
                                        <div className="flex flex-col sm:flex-row justify-between w-full gap-6">
                                            {/* Left Section: Details */}
                                            <div className="flex items-start gap-5 w-full sm:w-2/3">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0 ring-4 ring-white group-hover:scale-105 transition-transform mt-1">
                                                    {(applicant.full_name || applicant.applicant_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-2 w-full">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{applicant.full_name || applicant.applicant_name}</h3>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                                <a href={`mailto:${applicant.email || applicant.applicant_email}`} className="hover:text-indigo-600 transition-colors">{applicant.email || applicant.applicant_email}</a>
                                                            </div>
                                                            {applicant.github_url && (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.648.5.5 5.648.5 12c0 5.092 3.292 9.416 7.873 10.942.576.106.787-.25.787-.556 0-.275-.01-1.006-.015-1.976-3.203.697-3.878-1.544-3.878-1.544-.522-1.326-1.275-1.679-1.275-1.679-1.042-.713.08-.699.08-.699 1.152.081 1.757 1.185 1.757 1.185 1.024 1.753 2.687 1.247 3.342.953.104-.742.402-1.247.731-1.533-2.556-.291-5.244-1.278-5.244-5.686 0-1.256.45-2.281 1.185-3.086-.119-.292-.515-1.466.113-3.055 0 0 .967-.31 3.168 1.178a11.04 11.04 0 012.885-.388c.98.004 1.966.132 2.885.388 2.2-1.488 3.167-1.178 3.167-1.178.63 1.589.234 2.763.115 3.055.738.805 1.184 1.83 1.184 3.086 0 4.42-2.692 5.392-5.256 5.676.412.356.78 1.055.78 2.126 0 1.533-.014 2.768-.014 3.144 0 .309.208.667.792.553C20.712 21.414 24 17.092 24 12c0-6.352-5.148-11.5-11.5-11.5z"/></svg>
                                                                <a href={applicant.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">GitHub</a>
                                                            </div>)}
                                                            {applicant.linkedin_url && (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zm.02 4.5H0v16h5V8h-.0zM9 8v16h5v-8.5c0-4.5 5-4.85 5 0V24h5V14c0-9.41-10-9.07-10 0V8h-5z"/></svg>
                                                                <a href={applicant.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">LinkedIn</a>
                                                            </div>)}
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                                {applicant.phone_number || applicant.phone || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div>
                                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience</span>
                                                            <span className="text-sm text-gray-800 font-medium">{applicant.experience || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Skills</span>
                                                            <span className="text-sm text-gray-800 font-medium">{applicant.skills || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    {applicant.resume_url && (
                                                        <div className="pt-2">
                                                            {applicant.resume_url.startsWith('http') ? (
                                                                <a
                                                                    href={applicant.resume_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                    View / Download Resume (Old Format)
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setViewingResume({ name: applicant.full_name || applicant.applicant_name, text: applicant.resume_url })}
                                                                    className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                    Read Applicant Resume (Text)
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Section: Status & Actions */}
                                            <div className="flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-4">
                                                <div className="flex flex-col sm:items-end">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Applied</span>
                                                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                                        {new Date(applicant.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col sm:items-end">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Status</span>
                                                    <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${applicant.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        applicant.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            applicant.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-2 justify-start sm:justify-end mt-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(applicant.id, 'Shortlisted')}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                    >
                                                        Shortlist
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(applicant.id, 'Selected')}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                                    >
                                                        Select
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(applicant.id, 'Rejected')}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No applicants yet</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">It might take some time for candidates to find your listing.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Resume Viewing Modal */}
            {viewingResume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 p-0 overflow-y-auto w-full h-full">
                    {/* Dark Background */}
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setViewingResume(null)}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up">
                        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight pr-8">Resume: {viewingResume.name}</h2>
                            </div>
                            <button onClick={() => setViewingResume(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                                    {viewingResume.text}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 flex justify-end">
                            <button
                                onClick={() => setViewingResume(null)}
                                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applicants;
