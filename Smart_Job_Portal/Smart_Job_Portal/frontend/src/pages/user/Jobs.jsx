import { useState, useEffect, useContext } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, Building, CheckCircle, FileText, ChevronRight, Tags } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtering & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        jobType: '',
        experience: '',
        location: '',
        skills: ''
    });

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

    // Hardcoded generic options so everything always shows
    const availableJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    const availableExpLevels = ['0–1 year', '1–2 years', '2–3 years', '3–4 years', '4–5 years', '5+ years'];
    const availableSkills = ['React', 'Node.js', 'Python', 'Java', 'UI/UX', 'Marketing', 'Sales', 'Data Analysis', 'SQL'];

    // Get unique locations from jobs, adding 'Remote' if not present
    const availableLocations = [...new Set(['Remote', ...jobs.map(j => j.location).filter(Boolean)])];

    const handleFilterChange = (category, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: value
        }));
    };

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (job.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (job.skills_required?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesType = !filters.jobType || job.job_type === filters.jobType;
        const matchesExp = !filters.experience || job.experience_required?.toLowerCase().includes(filters.experience.toLowerCase());
        const matchesLocation = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSkills = !filters.skills ||
            (job.skills_required && job.skills_required.some(s => s.toLowerCase().includes(filters.skills.toLowerCase())));

        return matchesSearch && matchesType && matchesExp && matchesLocation && matchesSkills;
    });

    const isJobExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-transparent flex flex-col font-['Inter',sans-serif]">
            {/* Search and Top Filter Bar - Glassmorphism */}
            <div className="bg-white/70 backdrop-blur-lg border-b border-white/40 z-10 sticky top-16 shadow-lg shadow-violet-900/5">
                <div className="max-w-[1600px] mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-2xl flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Job Title, Company, or Keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div className="flex items-center text-sm font-semibold text-gray-500 whitespace-nowrap">
                        Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 relative z-0">

                {/* Desktop Sidebar Filters - Glassmorphism */}
                <div className="lg:col-span-3 hidden lg:block glass rounded-3xl p-6 h-[calc(100vh-10rem)] sticky top-[8.5rem] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-5 h-5 text-violet-600" />
                        <h2 className="text-lg font-bold text-gray-900 font-display">Filters</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Job Type Filter Dropdown */}
                        {availableJobTypes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Job Type</h3>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none"
                                    value={filters.jobType}
                                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                                >
                                    <option value="">Any Job Type</option>
                                    {availableJobTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Experience Filter Search */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Experience Level</h3>
                            <input
                                type="text"
                                placeholder="e.g. 1-3 Years, Fresher..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none placeholder-gray-400"
                                value={filters.experience}
                                onChange={(e) => handleFilterChange('experience', e.target.value)}
                            />
                        </div>

                        {/* Location Filter Search */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Location</h3>
                            <input
                                type="text"
                                placeholder="e.g. Remote, New York..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none placeholder-gray-400"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            />
                        </div>

                        {/* Skills Filter Search */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Skills</h3>
                            <input
                                type="text"
                                placeholder="e.g. React, Java, UI/UX..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none placeholder-gray-400"
                                value={filters.skills}
                                onChange={(e) => handleFilterChange('skills', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Middle Panel: Job Listings */}
                <div className="lg:col-span-9 flex flex-col h-[calc(100vh-10rem)]">
                    {loading ? (
                        <div className="flex-1 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                            {filteredJobs.length === 0 ? (
                                <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl border-dashed">
                                    <p className="text-gray-500 font-medium">No jobs match your filters.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setFilters({ jobType: '', experience: '', location: '', skills: '' }) }}
                                        className="mt-4 text-violet-600 font-bold hover:underline"
                                    >Clear all filters</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredJobs.map(job => (
                                        <div
                                            key={job.id}
                                            className="glass border-white/60 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 p-6 rounded-3xl transition-all duration-300 flex flex-col relative group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 text-[1.1rem] leading-tight pr-4">{job.title}</h3>
                                                {job.created_at && (
                                                    <span className="text-xs font-semibold text-gray-400 shrink-0 bg-gray-100 px-2 py-1 rounded">
                                                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-violet-600 font-bold text-sm mb-3 flex items-center">
                                                <Building className="w-4 h-4 mr-1.5" />
                                                {job.company_name}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.location && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-[0.7rem] font-bold uppercase tracking-wider">
                                                        <MapPin className="w-3 h-3 mr-1" /> {job.location}
                                                    </span>
                                                )}
                                                {job.job_type && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-violet-50 text-violet-700 text-[0.7rem] font-bold uppercase tracking-wider">
                                                        <Briefcase className="w-3 h-3 mr-1" /> {job.job_type}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                                                {job.skills_required && job.skills_required.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className="bg-white border text-gray-500 border-gray-200 px-2 py-0.5 rounded text-[0.7rem] font-semibold">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills_required?.length > 3 && (
                                                    <span className="text-gray-400 text-[0.7rem] font-medium self-center pl-1">
                                                        +{job.skills_required.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                            <Link to={`/job/${job.id}`} className="mt-4 text-center w-full px-4 py-2.5 bg-violet-500 text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 hover:bg-violet-600">
                                                Open Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Jobs;
