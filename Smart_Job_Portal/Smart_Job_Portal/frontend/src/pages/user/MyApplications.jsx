import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await api.get('/applications/my');
            setApplications(data);
        } catch (err) {
            setError('Failed to load your applications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
                    <p className="text-gray-600 mt-2 font-medium">Track the status of all your submitted job applications.</p>
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
                    <div className="space-y-6">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-2xl p-6 hover-lift border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                                <div className="flex-1 pl-4 sm:pl-2">
                                    <h2 className="text-xl font-bold text-gray-900 mb-0 tracking-tight">{app.title}</h2>
                                    <p className="text-sm font-bold text-blue-600 mb-2">{app.company_name}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mt-1">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                            {app.location}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            {app.job_type || 'Full-time'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                                    <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Applied on</span>
                                            <span className="block text-sm font-bold text-gray-900">
                                                {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${app.status === 'Selected' ? 'bg-green-100 text-green-800 border-green-200' :
                                        app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.status === 'Selected' ? 'bg-green-500' :
                                            app.status === 'Shortlisted' ? 'bg-blue-500' :
                                                app.status === 'Rejected' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                            }`}></span>
                                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                                    </span>

                                    <div className="flex gap-2 w-full mt-2 sm:mt-0 justify-end">
                                        {app.status === 'applied' && (
                                            <Link
                                                to={`/edit-application/${app.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to withdraw this application?')) {
                                                    try {
                                                        await api.delete(`/applications/${app.id}`);
                                                        setApplications(applications.filter(a => a.id !== app.id));
                                                    } catch (err) {
                                                        alert('Failed to withdraw application');
                                                    }
                                                }
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                        >
                                            Withdraw
                                        </button>
                                    </div>
                                    {app.status === 'Selected' && (
                                        <div className="text-xs font-bold text-green-600 mt-1 bg-green-50 px-2 py-1 rounded w-full text-center">
                                            Congratulations!
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
