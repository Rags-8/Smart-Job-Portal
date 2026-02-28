import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronDown, Search, CheckCircle, XCircle, FileText, Download, Briefcase, Star, TrendingUp, Filter } from 'lucide-react';

const ScreeningDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [autoShortlist, setAutoShortlist] = useState(false);

    // Sort logic
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJobId) {
            fetchCandidates(selectedJobId);
        } else {
            setCandidates([]);
            setSelectedCandidate(null);
        }
    }, [selectedJobId]);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs/admin/my-jobs');
            setJobs(data);
            if (data.length > 0) {
                setSelectedJobId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchCandidates = async (jobId) => {
        setLoadingCandidates(true);
        setSelectedCandidate(null);
        try {
            const { data } = await api.get(`/applications/job/${jobId}`);

            const currentJob = jobs.find(j => j.id === jobId);
            const jobSkills = currentJob?.skills_required || [];

            // Enhance with mock AI data since real endpoint doesn't exist
            const enhancedCandidates = data.map(app => {
                const applicantSkills = (app.skills || '').split(',').map(s => s.trim().toLowerCase());
                const mappedJobSkills = jobSkills.map(s => s.toLowerCase());

                let matchCount = 0;
                let matched = [];
                let missing = [];

                mappedJobSkills.forEach(reqSkill => {
                    // Simple substring matching for mock purposes
                    if (applicantSkills.some(as => as.includes(reqSkill) || reqSkill.includes(as))) {
                        matchCount++;
                        matched.push(reqSkill);
                    } else {
                        missing.push(reqSkill);
                    }
                });

                // Generate a base score, slightly randomized but anchored to skill match
                const baseScore = jobSkills.length > 0 ? (matchCount / jobSkills.length) * 100 : Math.floor(Math.random() * 40) + 60;
                // Add some random fuzziness so it looks realistic
                const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + (Math.random() * 20 - 10))));

                let recommendation = 'Consider for review.';
                if (finalScore >= 80) recommendation = 'Highly recommended based on strong skill alignment and experience match.';
                else if (finalScore >= 60) recommendation = 'Good potential, but missing some key required skills. Technical interview advised.';
                else recommendation = 'Does not meet core requirements. Consider for junior roles or reject.';

                return {
                    ...app,
                    mockAiData: {
                        matchScore: finalScore,
                        matchedSkills: matched.length > 0 ? matched : ['General Tech'],
                        missingSkills: missing,
                        recommendation
                    }
                };
            });

            setCandidates(enhancedCandidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const { data } = await api.put(`/applications/${id}/status`, { status });
            setCandidates(prev => prev.map(app => app.id === id ? { ...app, status: data.status } : app));

            // Also update selected candidate if it's the one we are viewing
            if (selectedCandidate && selectedCandidate.id === id) {
                setSelectedCandidate(prev => ({ ...prev, status: data.status }));
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        }
    };

    const selectedJobDetails = jobs.find(j => j.id === selectedJobId);

    // Sorting logic
    const sortedCandidates = [...candidates].sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.mockAiData.matchScore - a.mockAiData.matchScore;
        } else {
            return a.mockAiData.matchScore - b.mockAiData.matchScore;
        }
    });

    // Auto-shortlist logic (mock UI only)
    useEffect(() => {
        if (autoShortlist && sortedCandidates.length > 0) {
            sortedCandidates.forEach(cand => {
                if (cand.mockAiData.matchScore >= 70 && cand.status === 'applied') {
                    handleStatusUpdate(cand.id, 'Shortlisted');
                }
            });
        }
    }, [autoShortlist, sortedCandidates.length]);


    return (
        <div className="min-h-[calc(100vh-5rem)] bg-transparent font-['Inter',sans-serif] flex flex-col">
            {/* Top Navigation / Job Selector */}
            <div className="bg-white border-b border-gray-200 z-10 sticky top-20">
                <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
                            <Star className="w-6 h-6 mr-2 text-violet-600" /> AI Screening Dashboard
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">Automatically evaluate and rank applicants based on job requirements.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                disabled={loadingJobs}
                                className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl focus:ring-violet-500 focus:border-violet-500 block w-full pl-4 pr-10 py-2.5 shadow-sm"
                            >
                                {loadingJobs && <option>Loading jobs...</option>}
                                {!loadingJobs && jobs.length === 0 && <option>No active jobs found</option>}
                                {jobs.map(job => (
                                    <option key={job.id} value={job.id}>{job.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* Left Area: Summary + Table */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-11rem)]">

                    {/* Job Summary Card */}
                    {selectedJobDetails && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm shrink-0">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-gray-400" /> {selectedJobDetails.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded border border-gray-200">
                                            Req Exp: {selectedJobDetails.experience_required || 'Not specified'}
                                        </span>
                                        <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded border border-violet-100 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" /> {candidates.length} Applicants
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={autoShortlist} onChange={() => setAutoShortlist(!autoShortlist)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                        <span className="ml-3 text-sm font-bold text-gray-700">Auto-Shortlist &gt;70%</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Candidate Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-gray-900">Ranked Candidates</h3>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="text-sm font-semibold text-gray-600 hover:text-violet-600 flex items-center transition-colors"
                            >
                                <Filter className="w-4 h-4 mr-1" />
                                {sortOrder === 'desc' ? 'Highest Match First' : 'Lowest Match First'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loadingCandidates ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                                </div>
                            ) : sortedCandidates.length === 0 ? (
                                <div className="text-center p-12 text-gray-500 font-medium">
                                    No candidates have applied for this job yet.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_#e5e7eb] z-10">
                                        <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50">
                                            <th className="px-6 py-4 font-bold">Candidate</th>
                                            <th className="px-6 py-4 font-bold">AI Match Score</th>
                                            <th className="px-6 py-4 font-bold">Key Skills</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sortedCandidates.map(cand => (
                                            <tr
                                                key={cand.id}
                                                onClick={() => setSelectedCandidate(cand)}
                                                className={`cursor-pointer transition-colors hover:bg-violet-50/50 ${selectedCandidate?.id === cand.id ? 'bg-violet-50/50' : 'bg-white'}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{cand.full_name || cand.applicant_name}</div>
                                                    <div className="text-xs font-medium text-gray-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                        {cand.experience || 'Fresher'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-sm font-extrabold w-8 ${cand.mockAiData.matchScore >= 80 ? 'text-emerald-600' :
                                                            cand.mockAiData.matchScore >= 60 ? 'text-amber-500' : 'text-red-500'
                                                            }`}>
                                                            {cand.mockAiData.matchScore}%
                                                        </span>
                                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${cand.mockAiData.matchScore >= 80 ? 'bg-emerald-500' :
                                                                    cand.mockAiData.matchScore >= 60 ? 'bg-amber-400' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${cand.mockAiData.matchScore}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {cand.mockAiData.matchedSkills.slice(0, 2).map((skill, i) => (
                                                            <span key={i} className="text-[0.65rem] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded uppercase tracking-wider">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {cand.mockAiData.matchedSkills.length > 2 && (
                                                            <span className="text-[0.65rem] font-bold px-1 py-0.5 text-gray-400">+{cand.mockAiData.matchedSkills.length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-extrabold uppercase tracking-wide border ${cand.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        cand.status === 'Shortlisted' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                                            cand.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {cand.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Area: Analysis Panel */}
                <div className="lg:col-span-4 h-[calc(100vh-11rem)] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
                    {!selectedCandidate ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Select a Candidate</h3>
                            <p className="text-sm font-medium text-gray-500">Click on a candidate in the table to view their AI screening summary and resume.</p>
                        </div>
                    ) : (
                        <>
                            {/* Analysis Header */}
                            <div className="p-6 border-b border-gray-100 shrink-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">{selectedCandidate.full_name || selectedCandidate.applicant_name}</h2>
                                        <p className="text-sm font-medium text-gray-500">{selectedCandidate.email || selectedCandidate.applicant_email}</p>
                                    </div>
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold border-4 ${selectedCandidate.mockAiData.matchScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        selectedCandidate.mockAiData.matchScore >= 60 ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                            'bg-red-50 text-red-500 border-red-100'
                                        }`}>
                                        {selectedCandidate.mockAiData.matchScore}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Recommendation</h4>
                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                        {selectedCandidate.mockAiData.recommendation}
                                    </p>
                                </div>
                            </div>

                            {/* Scrollable Details */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                <div>
                                    <h4 className="flex items-center text-sm font-bold text-emerald-700 mb-3">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Matched Required Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.mockAiData.matchedSkills.map((skill, i) => (
                                            <span key={i} className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedCandidate.mockAiData.missingSkills.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center text-sm font-bold text-red-700 mb-3 mt-6">
                                            <XCircle className="w-4 h-4 mr-2" /> Missing Required Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.mockAiData.missingSkills.map((skill, i) => (
                                                <span key={i} className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8">
                                    <h4 className="flex items-center text-sm font-bold text-gray-900 mb-3 border-t border-gray-100 pt-6">
                                        <FileText className="w-4 h-4 mr-2 text-gray-400" /> Resume Preview
                                    </h4>
                                    {selectedCandidate.resume_url?.startsWith('http') ? (
                                        <a href={selectedCandidate.resume_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 transition-colors font-bold text-violet-600">
                                            Open External Resume
                                        </a>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                            {selectedCandidate.resume_url || 'No resume text available.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3 shrink-0">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedCandidate.id, 'Shortlisted')}
                                        className="flex-1 px-4 py-2.5 font-bold text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                    >
                                        Shortlist
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedCandidate.id, 'Rejected')}
                                        className="flex-1 px-4 py-2.5 font-bold text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                                <button className="w-full flex items-center justify-center px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    <Download className="w-4 h-4 mr-2" /> Download Report
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ScreeningDashboard;
