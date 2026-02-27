import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const { data } = await api.get('/jobs/admin/my-jobs');
            setJobs(data);
        } catch (err) {
            setError('Failed to load your jobs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Listings</h1>
                        <p className="text-gray-600 mt-2 font-medium">Review your active job postings and manage applicants.</p>
                    </div>
                    <Link
                        to="/admin/post-job"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Post New Job
                    </Link>
                </div>

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
                            <div key={job.id} className="bg-white rounded-2xl p-6 hover-lift border border-gray-100 flex flex-col h-full relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10 flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight pr-6">{job.title}</h2>
                                    <p className="text-blue-600 font-bold mb-3 text-sm">{job.company_name}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-5 bg-blue-50 text-blue-700">
                                            {job.job_type}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-5 bg-gray-100 text-gray-700">
                                            {job.number_of_openings} {job.number_of_openings === 1 ? 'Opening' : 'Openings'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4 text-sm font-medium text-gray-600 border-b border-gray-100 pb-4">
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
                                                Last Date: {new Date(job.application_last_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>
                                <div className="relative z-10 mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Posted On</span>
                                        <span className="text-sm font-bold text-gray-900">{new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2 w-full justify-between items-center sm:w-auto">
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/edit-job/${job.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this job?')) {
                                                        try {
                                                            await api.delete(`/jobs/${job.id}`);
                                                            setJobs(jobs.filter(j => j.id !== job.id));
                                                        } catch (err) {
                                                            alert('Failed to delete job');
                                                        }
                                                    }
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <Link
                                            to={`/admin/job/${job.id}/applicants`}
                                            className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                        >
                                            View Applicants
                                            <svg className="w-4 h-4 ml-1.5 -mr-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-6">Get started by creating your first job listing to attract candidates.</p>
                                <Link
                                    to="/admin/post-job"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                                >
                                    Post a Job Now
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJobs;
