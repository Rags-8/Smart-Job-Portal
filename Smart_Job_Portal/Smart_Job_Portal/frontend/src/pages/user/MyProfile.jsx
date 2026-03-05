import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Edit, Trash2, FileText, User, Mail, Phone, ExternalLink, Plus, History } from 'lucide-react';
import ResumePreview from '../../components/resume/ResumePreview';

const MyProfile = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await api.get('/resumes'); // Fetches all versions
            setResumes(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedResumeId(res.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching resumes:", error);
            toast.error('Failed to load resume profiles.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resume version?')) return;
        setActionLoading(true);
        try {
            await api.delete(`/resumes/${id}`);
            toast.success('Resume deleted.');
            const updated = resumes.filter(r => r.id !== id);
            setResumes(updated);
            if (selectedResumeId === id) {
                setSelectedResumeId(updated.length > 0 ? updated[0].id : null);
            }
        } catch (error) {
            toast.error('Failed to delete.');
        } finally {
            setActionLoading(false);
        }
    };

    const selectedResume = resumes.find(r => r.id === selectedResumeId);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-[1600px] mx-auto px-6 py-10">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-[32px] font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <User className="w-8 h-8 text-violet-600" /> Professional Profile
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your saved resumes and professional background.</p>
                    </div>
                    <button
                        onClick={() => navigate('/resume-builder')}
                        className="flex items-center gap-2 px-6 py-3.5 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-200 transition-all shrink-0 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Create New Resume
                    </button>
                </div>

                {resumes.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* ── LEFT: Saved Profiles Box ── */}
                        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
                            <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-left duration-500">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <History className="w-5 h-5 text-violet-500" /> Saved Resumes ({resumes.length})
                                    </h3>
                                </div>
                                <div className="p-3 max-h-[600px] overflow-y-auto">
                                    {resumes.map((res, idx) => (
                                        <div
                                            key={res.id}
                                            onClick={() => setSelectedResumeId(res.id)}
                                            className={`group p-4 rounded-2xl cursor-pointer transition-all mb-2 relative ${selectedResumeId === res.id ? 'bg-violet-50 border-violet-200 border shadow-sm shadow-violet-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                        >
                                            <div className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                {idx === 0 && <span className="bg-violet-100 px-1.5 py-0.5 rounded text-[8px]">Latest</span>}
                                                Version {resumes.length - idx}
                                            </div>
                                            <div className="font-bold text-gray-900 truncate pr-6">
                                                {res.resume_data.personal.jobTitle || 'General Professional'}
                                            </div>
                                            <div className="text-[11px] text-gray-500 mt-1 font-medium">
                                                Saved {new Date(res.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selectedResumeId === res.id ? 'bg-violet-600 animate-pulse' : 'bg-transparent'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Detailed Card for Selected ── */}
                            {selectedResume && (
                                <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                                    <h4 className="font-black text-gray-900 mb-6 uppercase tracking-wider text-xs border-b border-gray-100 pb-2">Resume Actions</h4>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => navigate(`/resume-builder/${selectedResumeId}`)}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                        >
                                            <Edit className="w-4 h-4" /> Edit this Resume
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedResumeId)}
                                            disabled={actionLoading}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-red-600 border-2 border-red-50 font-bold rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete Version
                                        </button>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div className="truncate flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{selectedResume.resume_data.personal.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div className="truncate flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{selectedResume.resume_data.personal.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: Complete Resume Preview ── */}
                        <div className="flex-1 w-full bg-white rounded-[40px] border border-gray-200 shadow-xl p-8 lg:p-12 animate-in fade-in zoom-in-95 duration-700 min-h-[1000px]">
                            {selectedResume && (
                                <>
                                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                                        <h2 className="text-xl font-black text-gray-900 uppercase">Live Preview</h2>
                                        <span className="px-4 py-2 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full">ID: {selectedResume.id.split('-')[0]}...</span>
                                    </div>
                                    <ResumePreview resumeData={selectedResume.resume_data} />
                                </>
                            )}
                        </div>

                    </div>
                ) : (
                    /* ── Empty State ── */
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 py-32 px-8 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-violet-50 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FileText className="w-12 h-12 text-violet-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">No Saved Resumes</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">You haven't built any resumes yet. Start building your professional profile to unlock job application tools.</p>
                        <button
                            onClick={() => navigate('/resume-builder')}
                            className="inline-flex items-center px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                        >
                            Build My First Resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProfile;
