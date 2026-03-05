import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const EditApplication = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        skills: '',
        experience: '',
        resume_url: '',
        github_url: '',
        linkedin_url: ''
    });
    const [jobDetails, setJobDetails] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const { data } = await api.get(`/applications/${id}`);
                setJobDetails({
                    title: data.title,
                    company_name: data.company_name
                });

                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    skills: data.skills || '',
                    experience: data.experience || '',
                    resume_url: data.resume_url || '',
                    github_url: data.github_url || '',
                    linkedin_url: data.linkedin_url || ''
                });
            } catch (err) {
                setError('Failed to fetch application details');
            } finally {
                setIsFetching(false);
            }
        };
        fetchApplication();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!formData.resume_url.trim()) {
            setError('Please complete all form fields and paste your resume text.');
            setIsLoading(false);
            return;
        }

        try {
            await api.put(`/applications/${id}`, formData);
            navigate('/my-applications');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update application');
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center p-4 sm:p-6 py-12">
            <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-2xl overflow-y-auto flex flex-col animate-slide-up">
                {/* Header */}
                <div className="p-6 sm:p-8 flex items-start justify-between border-b border-gray-100 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Edit Application</h2>
                        {jobDetails && (
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Updating application for <strong className="text-gray-900">{jobDetails.title}</strong> at {jobDetails.company_name}
                            </p>
                        )}
                    </div>
                    <button onClick={() => navigate('/my-applications')} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {error && (
                    <div className="mt-4 mx-6 sm:mx-8 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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
                            value={formData.resume_url}
                            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 font-medium mt-2 ml-1">We no longer require PDF/DOC uploads. Simply copy and paste the text of your resume above.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-4 bg-white">
                        <button
                            type="button"
                            onClick={() => navigate('/my-applications')}
                            disabled={isLoading}
                            className="px-6 py-3 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 border border-transparent text-sm font-extrabold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditApplication;
