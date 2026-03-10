import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronDown, Search, CheckCircle, XCircle, FileText, Briefcase, Star, TrendingUp, Filter, AlertCircle, Loader } from 'lucide-react';

const THRESHOLD = 70;

const ScreeningDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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
            const { data: applications } = await api.get(`/applications/job/${jobId}`);

            // For each application, fetch the AI match result
            const enhancedCandidates = await Promise.all(applications.map(async (app) => {
                try {
                    const { data: matchData } = await api.get(`/ai/match-result/${app.id}`);
                    if (matchData) {
                        return {
                            ...app,
                            aiData: {
                                matchScore: matchData.match_percentage || 0,
                                matchedSkills: matchData.matched_skills || [],
                                missingSkills: matchData.missing_skills || [],
                                fitLevel: matchData.fit_level || 'Not Evaluated',
                                screened: true
                            }
                        };
                    }
                } catch (e) {
                    // match result not available yet
                }
                // No AI data yet — screening pending
                return {
                    ...app,
                    aiData: {
                        matchScore: null,
                        matchedSkills: [],
                        missingSkills: [],
                        fitLevel: 'Pending',
                        screened: false
                    }
                };
            }));

            setCandidates(enhancedCandidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoadingCandidates(false);
        }
    };



    const selectedJobDetails = jobs.find(j => j.id === selectedJobId);

    const sortedCandidates = [...candidates].sort((a, b) => {
        const scoreA = a.aiData.matchScore ?? -1;
        const scoreB = b.aiData.matchScore ?? -1;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

    const screenedCount = candidates.filter(c => c.aiData.screened).length;
    const selectedCount = candidates.filter(c => c.status === 'Selected').length;
    const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;

    const getScoreColor = (score) => {
        if (score === null) return 'text-gray-400';
        if (score >= THRESHOLD) return 'text-emerald-600';
        return 'text-red-500';
    };

    const getBarColor = (score) => {
        if (score === null) return 'bg-gray-300';
        if (score >= THRESHOLD) return 'bg-emerald-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-transparent font-['Inter',sans-serif] flex flex-col">
            {/* Top Navigation / Job Selector */}
            <div className="bg-white border-b border-gray-200 z-10 sticky top-20">
                <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
                            <Star className="w-6 h-6 mr-2 text-violet-600" /> AI Screening Dashboard
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            Automatically evaluated applications — threshold: <span className="font-bold text-violet-600">{THRESHOLD}% match</span>.
                        </p>
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

                    {/* Stats & Job Summary Card */}
                    {selectedJobDetails && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm shrink-0">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-gray-400" /> {selectedJobDetails.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded border border-violet-100 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" /> {candidates.length} Applicants
                                        </span>
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded border border-blue-100">
                                            {screenedCount} Screened
                                        </span>
                                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded border border-emerald-100">
                                            ✓ {selectedCount} Selected
                                        </span>
                                        <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded border border-red-100">
                                            ✗ {rejectedCount} Rejected
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2">
                                    <Star className="w-4 h-4 text-violet-600" />
                                    <span className="text-sm font-bold text-violet-700">Auto-Screening Active (≥{THRESHOLD}% → Selected)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Candidate Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-gray-900">AI-Screened Candidates</h3>
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
                                            <th className="px-6 py-4 font-bold">Fit Level</th>
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
                                                    {cand.aiData.screened ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-sm font-extrabold w-10 ${getScoreColor(cand.aiData.matchScore)}`}>
                                                                {cand.aiData.matchScore}%
                                                            </span>
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${getBarColor(cand.aiData.matchScore)}`}
                                                                    style={{ width: `${cand.aiData.matchScore}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
                                                            <Loader className="w-4 h-4 animate-spin" /> Pending
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <span className="text-xs font-bold text-gray-700">{cand.aiData.fitLevel || '—'}</span>
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
                                    {selectedCandidate.aiData.screened ? (
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold border-4 ${selectedCandidate.aiData.matchScore >= THRESHOLD
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-red-50 text-red-500 border-red-100'
                                            }`}>
                                            {selectedCandidate.aiData.matchScore}
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 bg-gray-50 border-gray-100">
                                            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Screening Result Banner */}
                                {selectedCandidate.aiData.screened ? (
                                    <div className={`p-4 rounded-xl border ${selectedCandidate.aiData.matchScore >= THRESHOLD
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {selectedCandidate.aiData.matchScore >= THRESHOLD
                                                ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                : <XCircle className="w-4 h-4 text-red-600" />
                                            }
                                            <h4 className={`text-sm font-bold ${selectedCandidate.aiData.matchScore >= THRESHOLD ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {selectedCandidate.aiData.matchScore >= THRESHOLD
                                                    ? `Selected — ${selectedCandidate.aiData.matchScore}% Match`
                                                    : `Rejected — ${selectedCandidate.aiData.matchScore}% Match (below ${THRESHOLD}% threshold)`
                                                }
                                            </h4>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-600 ml-6">{selectedCandidate.aiData.fitLevel}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl border bg-yellow-50 border-yellow-200 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                        <p className="text-sm font-semibold text-yellow-700">AI screening in progress. Please refresh shortly.</p>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Details */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {selectedCandidate.aiData.matchedSkills.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center text-sm font-bold text-emerald-700 mb-3">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Matched Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.aiData.matchedSkills.map((skill, i) => (
                                                <span key={i} className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedCandidate.aiData.missingSkills.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center text-sm font-bold text-red-700 mb-3">
                                            <XCircle className="w-4 h-4 mr-2" /> Missing Required Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.aiData.missingSkills.map((skill, i) => (
                                                <span key={i} className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
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


                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ScreeningDashboard;
