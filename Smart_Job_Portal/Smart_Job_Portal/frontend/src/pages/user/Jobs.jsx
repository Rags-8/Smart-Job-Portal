import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, Clock, Building, CheckCircle, FileText, ChevronRight, Tags, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtering & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        jobType: [],
        experience: [],
        location: '',
        skills: [],
        category: ''
    });

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationSuccess, setApplicationSuccess] = useState('');
    const navigate = useNavigate();

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

    // Use hardcoded options for stability, plus some derived ones
    const availableJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    const availableExpLevels = ['0–1 year', '1–2 years', '2–3 years', '3–4 years', '4–5 years', '5+ years'];
    const availableSkills = ['React', 'Node.js', 'Python', 'Java', 'UI/UX', 'Marketing', 'Sales', 'Data Analysis', 'SQL'];
    const availableCategories = ['Software', 'Hardware', 'Designing', 'Sales', 'Product', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Customer Service'];

    // Get unique locations from jobs, adding 'Remote' if not present
    const availableLocations = [...new Set(['Remote', ...jobs.map(j => j.location).filter(Boolean)])];

    const handleFilterChange = (category, value) => {
        setFilters(prev => {
            if (category === 'location') {
                return { ...prev, [category]: value };
            }

            const currentList = prev[category];
            const newList = currentList.includes(value)
                ? currentList.filter(item => item !== value)
                : [...currentList, value];

            return { ...prev, [category]: newList };
        });
    };

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (job.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (job.skills_required?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesType = filters.jobType.length === 0 || filters.jobType.includes(job.job_type);
        const matchesExp = filters.experience.length === 0 || filters.experience.includes(job.experience_required);
        const matchesLocation = !filters.location || job.location === filters.location;
        const matchesSkills = filters.skills.length === 0 ||
            (job.skills_required && filters.skills.some(skill => job.skills_required.includes(skill)));
        const matchesCategory = !filters.category || job.category === filters.category;

        return matchesSearch && matchesType && matchesExp && matchesLocation && matchesSkills && matchesCategory;
    });

    const isJobExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex flex-col font-['Inter',sans-serif]">
            {/* Top Header / Search Area */}
            <div className="bg-white border-b border-gray-200 z-10 sticky top-20 shadow-sm">
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
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    <div className="flex items-center text-sm font-semibold text-gray-500 whitespace-nowrap">
                        Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                {/* Left Panel: Filters */}
                <div className="lg:col-span-3 hidden lg:block bg-white rounded-2xl border border-gray-200 p-6 h-[calc(100vh-10rem)] sticky top-[8.5rem] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900 font-display">Filters</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Category Filter Dropdown */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Category</h3>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 outline-none"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">Any Category</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Job Type Filter */}
                        {availableJobTypes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Job Type</h3>
                                <div className="space-y-2">
                                    {availableJobTypes.map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.jobType.includes(type)}
                                                    onChange={() => handleFilterChange('jobType', type)}
                                                    className="w-4 h-4 border-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience Filter */}
                        {availableExpLevels.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Experience Level</h3>
                                <div className="space-y-2">
                                    {availableExpLevels.map(exp => (
                                        <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.experience.includes(exp)}
                                                onChange={() => handleFilterChange('experience', exp)}
                                                className="w-4 h-4 border-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{exp}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Dropdown Filter */}
                        {availableLocations.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Location</h3>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                >
                                    <option value="">Any Location</option>
                                    {availableLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Skills Filter */}
                        {availableSkills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Top Skills</h3>
                                <div className="space-y-2">
                                    {availableSkills.map(skill => (
                                        <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.skills.includes(skill)}
                                                onChange={() => handleFilterChange('skills', skill)}
                                                className="w-4 h-4 border-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Panel: Job Listings */}
                <div className="lg:col-span-9 flex flex-col min-h-[calc(100vh-12rem)]">
                    {loading ? (
                        <div className="flex-1 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                            {filteredJobs.length === 0 ? (
                                <div className="col-span-full text-center p-12 bg-white border border-gray-200 rounded-3xl border-dashed">
                                    <p className="text-gray-500 font-bold text-lg">No jobs match your filters.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setFilters({ jobType: [], experience: [], location: '', skills: [], category: '' }) }}
                                        className="mt-4 text-blue-600 font-extrabold hover:underline"
                                    >Clear all filters</button>
                                </div>
                            ) : (
                                filteredJobs.map(job => (
                                    <Link
                                        key={job.id}
                                        to={`/job/${job.id}`}
                                        className="bg-white p-7 rounded-[2rem] border border-gray-100 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col h-full active:scale-[0.98]"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                <Building className="w-7 h-7" />
                                            </div>
                                            {job.created_at && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                    {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-black text-gray-900 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                        <p className="text-gray-500 font-bold mb-6 text-sm">{job.company_name}</p>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {job.location && (
                                                <span className="flex items-center px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border border-gray-100">
                                                    <MapPin className="w-3 h-3 mr-1.5" /> {job.location}
                                                </span>
                                            )}
                                            {job.job_type && (
                                                <span className="flex items-center px-3 py-1.5 rounded-xl bg-blue-50/50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-50">
                                                    <Briefcase className="w-3 h-3 mr-1.5" /> {job.job_type}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {job.skills_required && job.skills_required.slice(0, 3).map((skill, idx) => (
                                                    <div key={idx} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-blue-600 overflow-hidden shadow-sm" title={skill}>
                                                        {skill.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {job.skills_required?.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                                                        +{job.skills_required.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center text-blue-600 font-black text-sm group-hover:translate-x-1 transition-transform">
                                                View Details <ArrowRight className="w-4 h-4 ml-1.5" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
