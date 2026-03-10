import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, Clock, Building, CheckCircle, FileText, ChevronRight, Tags, ArrowRight, RotateCcw } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    const [matchScores, setMatchScores] = useState({});

    // Filtering & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        jobType: [],
        experience: [],
        location: '',
        skills: [],
        category: '',
        salary: 0
    });

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationSuccess, setApplicationSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchJobs();
        if (user && user.role === 'user') {
            fetchAppliedJobs();
        }
    }, [user]);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);

            // Fetch match scores if user is logged in
            if (user && user.role === 'user') {
                try {
                    const scoreRes = await api.get('/ai/preview-all');
                    setMatchScores(scoreRes.data.scores || {});
                } catch (e) {
                    console.error('Failed to fetch bulk match scores:', e);
                }
            }
        } catch (err) {
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const { data } = await api.get('/applications/my');
            const ids = new Set(data.map(app => String(app.job_id)));
            setAppliedJobIds(ids);
        } catch (err) {
            // silently fail — don't block the page
            console.log('Could not fetch applied jobs:', err.message);
        }
    };

    // Use hardcoded options for stability, plus some derived ones
    const availableJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    const availableExpLevels = ['0–1 year', '1–2 years', '2–3 years', '3–4 years', '4–5 years', '5+ years'];
    const availableSkills = ['React', 'Node.js', 'Python', 'Java', 'UI/UX', 'Marketing', 'Sales', 'Data Analysis', 'SQL'];
    const availableCategories = ['Software', 'Hardware', 'Designing', 'Sales', 'Product', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Customer Service'];

    // Get unique locations from jobs, adding 'Remote' if not present
    const availableLocations = [...new Set(['Remote', ...jobs.map(j => j.location).filter(Boolean)])];

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => {
            if (filterName === 'location' || filterName === 'category' || filterName === 'salary') {
                return { ...prev, [filterName]: value };
            }

            const currentList = prev[filterName];
            const newList = currentList.includes(value)
                ? currentList.filter(item => item !== value)
                : [...currentList, value];

            return { ...prev, [filterName]: newList };
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

        // Case-insensitive category match — handles null gracefully
        const matchesCategory = !filters.category ||
            (job.category && job.category.toLowerCase() === filters.category.toLowerCase());

        const matchesSalary = filters.salary === 0 ||
            (job.salary && Number(job.salary) >= filters.salary);

        return matchesSearch && matchesType && matchesExp && matchesLocation && matchesSkills && matchesCategory && matchesSalary;
    });

    // Derive max salary for the slider (minimum 100k, or dynamic max from jobs)
    const maxSalary = Math.max(100000, ...jobs.map(j => Number(j.salary) || 0));

    const isJobExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-transparent flex flex-col font-['Inter',sans-serif]">
            {/* Top Header / Search Area */}
            <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200 z-10 sticky top-20 shadow-sm transition-all duration-300">
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
                            className="block w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl leading-5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-gray-900 placeholder-gray-500 shadow-sm hover:bg-white/80"
                        />
                    </div>
                    <div className="flex items-center text-sm font-semibold text-gray-500 whitespace-nowrap">
                        Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'listing' : 'listings'}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                {/* Left Panel: Filters */}
                <div className="lg:col-span-3 hidden lg:block bg-white/60 backdrop-blur-xl rounded-2xl border border-white p-6 h-[calc(100vh-10rem)] sticky top-[8.5rem] overflow-y-auto custom-scrollbar shadow-lg shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-violet-600" />
                            <h2 className="text-lg font-bold text-gray-900 font-display">Filters</h2>
                        </div>
                        <button
                            onClick={() => { setSearchQuery(''); setFilters({ jobType: [], experience: [], location: '', skills: [], category: '', salary: 0 }) }}
                            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all group/reset"
                            title="Reset All Filters"
                        >
                            <RotateCcw className="w-4 h-4 group-active/reset:rotate-[-180deg] transition-transform duration-300" />
                        </button>
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

                        {/* Salary Range Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Salary / Stipend
                                </h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    {filters.salary === 0 ? 'Any' : `₹${Number(filters.salary).toLocaleString('en-IN')}+`}
                                </span>
                            </div>
                            <div className="px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxSalary}
                                    step={10000}
                                    value={filters.salary}
                                    onChange={(e) => handleFilterChange('salary', Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                                <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
                                    <span>₹0</span>
                                    <span>₹{maxSalary.toLocaleString('en-IN')}+</span>
                                </div>
                            </div>
                        </div>

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
                                <div className="col-span-full text-center p-12 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-3xl border-dashed">
                                    <p className="text-gray-500 font-bold text-lg">
                                        {filters.category ? `Sorry! No listings based on the "${filters.category}" category.` : `Sorry! No listings match your filters.`}
                                    </p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setFilters({ jobType: [], experience: [], location: '', skills: [], category: '', salary: 0 }) }}
                                        className="mt-4 text-violet-600 font-extrabold hover:text-violet-700 hover:underline transition-colors"
                                    >Clear all filters</button>
                                </div>
                            ) : (
                                filteredJobs.map(job => {
                                    const alreadyApplied = appliedJobIds.has(String(job.id));
                                    return (
                                        <div
                                            key={job.id}
                                            className="relative group/card"
                                        >
                                            {/* Card — always looks normal */}
                                            <Link
                                                to={alreadyApplied ? '#' : `/job/${job.id}`}
                                                onClick={e => alreadyApplied && e.preventDefault()}
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
                                                    {user && user.role === 'user' && matchScores[job.id] !== undefined && (
                                                        <div
                                                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${matchScores[job.id] >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                matchScores[job.id] >= 60 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                                                }`}
                                                        >
                                                            {matchScores[job.id]}% Match
                                                        </div>
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

                                            {/* Hover overlay — ONLY shown on hover for already-applied cards */}
                                            {alreadyApplied && (
                                                <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-all duration-200 flex items-center justify-center pointer-events-none z-10">
                                                    {/* Frosted glass */}
                                                    <div className="absolute inset-0 rounded-[2rem] bg-white/70 backdrop-blur-[6px] border border-red-200" />
                                                    {/* Message card */}
                                                    <div className="relative z-10 flex flex-col items-center gap-3 px-7 py-5 bg-white rounded-2xl shadow-2xl shadow-red-200/60 border border-red-100">
                                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                                                            <CheckCircle className="w-7 h-7 text-red-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-red-600 font-black text-sm">You've already applied</p>
                                                            <p className="text-red-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">to this job</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
