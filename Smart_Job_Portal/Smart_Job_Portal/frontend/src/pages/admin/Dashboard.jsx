import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">

                <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-20 filter blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user?.name}</span>!
                        </h1>
                        <p className="text-lg text-indigo-100 font-medium max-w-2xl">
                            Manage your job postings and review eager applicants all from your employer dashboard.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link to="/admin/post-job" className="group glass rounded-3xl p-8 hover-lift border border-gray-100 relative overflow-hidden transition-all duration-300 hover:border-blue-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Post a New Job</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">Create a compelling job listing to attract top talent directly to your organization.</p>
                            <div className="mt-6 flex items-center text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                                Get Started
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/my-jobs" className="group glass rounded-3xl p-8 hover-lift border border-gray-100 relative overflow-hidden transition-all duration-300 hover:border-indigo-200">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Manage Jobs</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">View all your active listings and review the applications submitted by candidates.</p>
                            <div className="mt-6 flex items-center text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                                View Listings
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
