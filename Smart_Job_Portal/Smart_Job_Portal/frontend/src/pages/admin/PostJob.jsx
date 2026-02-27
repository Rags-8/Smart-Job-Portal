import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PostJob = () => {
    const [formData, setFormData] = useState({
        // Company Information
        company_name: '',
        company_website: '',
        company_description: '',

        // Job Details
        title: '',
        location: '',
        salary: '',
        job_type: 'Full-time',
        experience_required: '',
        skills_required: '',
        number_of_openings: '',

        // Application Control
        application_last_date: '',

        // Job Description
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // Convert comma-separated skills into array
            const skillsArray = formData.skills_required.split(',').map(s => s.trim()).filter(s => s);

            await api.post('/jobs', {
                ...formData,
                salary: formData.salary ? parseInt(formData.salary) : null,
                number_of_openings: formData.number_of_openings ? parseInt(formData.number_of_openings) : null,
                skills_required: skillsArray
            });
            navigate('/admin/my-jobs');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to post job');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center animate-fade-in relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-48 -mt-48 z-0"></div>

            <div className="max-w-2xl w-full relative z-10">
                <div className="mb-8 pl-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post a New Job</h1>
                    <p className="mt-2 text-gray-600 font-medium">Fill out the details below to attract the best candidates for your open role.</p>
                </div>

                <div className="glass rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-center mb-6">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ========================================== */}
                        {/* Company Information */}
                        {/* ========================================== */}
                        <div className="pt-4 border-t border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                        placeholder="Name of your company"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Company Website</label>
                                        <input
                                            type="url"
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="https://example.com"
                                            value={formData.company_website}
                                            onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Company Description</label>
                                        <input
                                            type="text"
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="Brief overview of your company"
                                            value={formData.company_description}
                                            onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================== */}
                        {/* Job Details */}
                        {/* ========================================== */}
                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Job Title *</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Location *</label>
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="e.g. New York, NY or Remote"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Employment Type *</label>
                                        <select
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium cursor-pointer"
                                            value={formData.job_type}
                                            onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                        >
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                            <option>Freelance</option>
                                            <option>Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Experience Required *</label>
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="e.g. 0-2 years, 5+ years"
                                            value={formData.experience_required}
                                            onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Skills Required *</label>
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="e.g. React, Node.js, Python (comma separated)"
                                            value={formData.skills_required}
                                            onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Salary Component (INR) *</label>
                                        <input
                                            type="number"
                                            required
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="e.g. 120000"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Number of Openings *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                            placeholder="e.g. 3"
                                            value={formData.number_of_openings}
                                            onChange={(e) => setFormData({ ...formData, number_of_openings: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================== */}
                        {/* Application Control */}
                        {/* ========================================== */}
                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Control</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Application Last Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900"
                                        value={formData.application_last_date}
                                        onChange={(e) => setFormData({ ...formData, application_last_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Allowed Resume Details</label>
                                    <div className="px-4 py-3.5 bg-gray-100 rounded-xl text-sm text-gray-600 font-medium">
                                        Format: PDF / DOC<br />
                                        Max Size: 5MB
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================== */}
                        {/* Job Description */}
                        {/* ========================================== */}
                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Detailed Job Description *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900 resize-y"
                                        placeholder="Detailed explanation of the role..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Responsibilities *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900 resize-y"
                                        placeholder="List key responsibilities..."
                                        value={formData.responsibilities}
                                        onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Requirements *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900 resize-y"
                                        placeholder="List qualifications and requirements..."
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Benefits</label>
                                    <textarea
                                        rows={3}
                                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm font-medium text-gray-900 resize-y"
                                        placeholder="List perks, health insurance, bonuses..."
                                        value={formData.benefits}
                                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            >
                                {isLoading ? 'Publishing...' : 'Publish Job Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;
