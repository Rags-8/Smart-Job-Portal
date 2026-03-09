import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Download, Save, RefreshCw, Edit3, Wand2, History, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import ResumePreview from '../../components/resume/ResumePreview';
import ResumeForms from '../../components/resume/ResumeForms';
import ResumeSidebar from '../../components/resume/ResumeSidebar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ConfirmModal from '../../components/ConfirmModal';

const EMPTY_RESUME = {
    personal: { fullName: '', jobTitle: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '' },
    skills: { frontend: [], backend: [], database: [], tools: [] },
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: []
};

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [hasGenerated, setHasGenerated] = useState(false);
    const [resumeData, setResumeData] = useState(EMPTY_RESUME);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'edit'
    const [currentStep, setCurrentStep] = useState(0);
    const [resumeHistory, setResumeHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [modal, setModal] = useState({ open: false, type: null, id: null });

    // Fetch existing resume and history
    useEffect(() => {
        fetchHistory();
        const fetchExisting = async () => {
            if (!id) {
                // If the user navigates to /resume-builder (without ID), clear form
                setResumeData(EMPTY_RESUME);
                setHasGenerated(false);
                setActiveTab('ai');
                setAiPrompt('');
                setCurrentStep(0);
                return;
            }
            try {
                const res = await api.get(`/resumes/${id}`);
                if (res.data) {
                    setResumeData(res.data);
                    setHasGenerated(true);
                }
            } catch (err) {
                // Ignore 404
            }
        };
        fetchExisting();
    }, [id]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/resumes');
            setResumeHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const updateData = (section, data) => {
        setResumeData(prev => ({ ...prev, [section]: data }));
    };

    const handleGenerateResume = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please describe what you want to change.');
            return;
        }
        setIsGenerating(true);
        console.log('[ResumeBuilder] Requesting update with prompt:', aiPrompt);

        try {
            const res = await api.post('/ai/generate-resume-from-prompt', {
                prompt: aiPrompt,
                currentResume: hasGenerated ? resumeData : null
            });

            const aiData = res.data;

            if (hasGenerated && JSON.stringify(aiData) === JSON.stringify(resumeData)) {
                toast.error('The AI did not make any changes. Try being more specific.');
                setIsGenerating(false);
                return;
            }

            const updatedResume = {
                personal: { ...resumeData.personal, ...(aiData.personal || {}) },
                skills: { ...resumeData.skills, ...(aiData.skills || {}) },
                projects: Array.isArray(aiData.projects) ? aiData.projects : resumeData.projects,
                experience: Array.isArray(aiData.experience) ? aiData.experience : resumeData.experience,
                education: Array.isArray(aiData.education) ? aiData.education : resumeData.education,
                certifications: Array.isArray(aiData.certifications) ? aiData.certifications : resumeData.certifications,
                achievements: Array.isArray(aiData.achievements) ? aiData.achievements : resumeData.achievements,
            };

            setResumeData(updatedResume);
            setHasGenerated(true);
            setAiPrompt('');
            // setActiveTab('edit'); // Removed so the user stays on the AI tab if they generated from it.
            toast.success('Resume updated! Click "Save Resume" to keep this version.');
        } catch (error) {
            console.error('[ResumeBuilder] Error:', error);
            toast.error(error.response?.data?.error || 'Failed to process. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const printArea = document.getElementById('print-area');
            if (!printArea) { toast.error('Preview not ready.'); return; }
            const originalWidth = printArea.style.width;
            printArea.style.width = '794px';
            const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, logging: false, windowWidth: 794 });
            printArea.style.width = originalWidth;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const fileName = resumeData.personal.fullName
                ? `${resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`
                : 'Resume.pdf';
            pdf.save(fileName);
        } catch (err) {
            toast.error('Failed to generate PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveManual = async () => {
        console.log('[ResumeBuilder] Manual save initiated...');
        setIsSaving(true);
        try {
            if (id) {
                // UPDATE existing
                await api.put(`/resumes/${id}`, resumeData);
                console.log('[ResumeBuilder] Updated existing resume:', id);
            } else {
                // CREATE new
                const response = await api.post('/resumes', resumeData);
                const newId = response.data?.data?.id;
                console.log('[ResumeBuilder] Created new resume, ID:', newId);
                if (newId) {
                    // Update URL so subsequent saves update this same record
                    navigate(`/resume-builder/${newId}`, { replace: true });
                }
            }

            fetchHistory();
            toast.success('Resume saved successfully, view in profile', {
                duration: 5000,
                position: 'top-center'
            });
        } catch (err) {
            console.error('[ResumeBuilder] Save error:', err);
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save resume.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteVersion = async (id, e) => {
        e.stopPropagation();
        setModal({ open: true, type: 'delete', id });
    };

    const handleConfirmAction = async () => {
        if (modal.type === 'delete') {
            const versionToRestore = resumeHistory.find(v => v.id === modal.id);
            try {
                await api.delete(`/resumes/${modal.id}`);
                fetchHistory();

                toast((t) => (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-900">Version removed</span>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await api.post('/resumes', versionToRestore.resume_data);
                                    fetchHistory();
                                    toast.success('Version restored!', { icon: '🔄' });
                                } catch (err) {
                                    toast.error('Restore failed');
                                }
                            }}
                            className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wider"
                        >
                            Undo
                        </button>
                    </div>
                ), { duration: 300000, position: 'bottom-center' });

            } catch (err) {
                toast.error('Failed to delete.');
            }
        } else if (modal.type === 'new') {
            setResumeData(EMPTY_RESUME);
            setHasGenerated(false);
            setActiveTab('ai');
            setAiPrompt('');
            setCurrentStep(0);
            navigate('/resume-builder', { replace: true });
        }
        setModal({ open: false, type: null, id: null });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex">

            {/* ── History Sidebar (Left) ── */}
            {showHistory && (
                <div className="w-80 bg-white border-r border-gray-200 h-screen sticky top-0 z-20 overflow-y-auto animate-in slide-in-from-left duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-violet-600" /> History
                        </h2>
                        <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {resumeHistory.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No versions saved yet.</p>}
                        {resumeHistory.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    navigate(`/resume-builder/${item.id}`);
                                    setShowHistory(false);
                                    toast.success(`Restored version from ${new Date(item.updated_at).toLocaleDateString()}`);
                                }}
                                className="group p-4 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 cursor-pointer transition-all relative"
                            >
                                <div className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">
                                    {idx === 0 ? 'Current / Latest' : `Version ${resumeHistory.length - idx}`}
                                </div>
                                <div className="text-sm font-bold text-gray-900 truncate">
                                    {item.resume_data.personal.jobTitle || 'Untitled Resume'}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-1">
                                    {new Date(item.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                                <button
                                    onClick={(e) => deleteVersion(item.id, e)}
                                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                {/* ── Page header ── */}
                <div className="max-w-[1600px] w-full mx-auto px-6 pt-8 pb-4 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2.5 rounded-xl border transition-all ${showHistory ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            title="Toggle History"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <h1 className="text-[28px] font-bold text-[#1a1f36]">Resume Builder</h1>
                        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Sparkles className="w-4 h-4" /> AI Assist
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'edit' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Edit3 className="w-4 h-4" /> Manual Edit
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setModal({ open: true, type: 'new' })}
                            className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                        >
                            New Resume
                        </button>
                        {hasGenerated && (
                            <>
                                <button
                                    onClick={handleSaveManual}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-xl hover:bg-violet-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Resume'}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-all flex items-center gap-2 shadow-md"
                                    title="Saves as a text-searchable PDF"
                                >
                                    <Download className="w-4 h-4" />
                                    Print / Download PDF
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Back
                        </button>
                    </div>
                </div>

                {/* ── Main Layout ── */}
                <div className="max-w-[1600px] w-full mx-auto px-6 pb-8 print:p-0">
                    <div className="flex gap-6 items-start print:block">

                        {/* ── LEFT PANEL: Controls ── */}
                        <div className={`${activeTab === 'edit' ? 'w-[300px]' : 'w-[460px]'} transition-all duration-300 shrink-0 print:hidden`}>
                            {activeTab === 'ai' ? (
                                /* AI Prompt card */
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wand2 className="w-6 h-6 text-violet-600" />
                                        <h2 className="text-[22px] font-extrabold text-[#0f172a]">AI Write / Update</h2>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-6 leading-relaxed font-medium">
                                        Ask AI to generate, update, or refine your resume. Every AI update is automatically saved to your history.
                                    </p>

                                    <label className="block text-[13px] font-extrabold text-[#64748b] mb-2 uppercase tracking-widest">
                                        Your Requirements
                                    </label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder={`e.g. I'm a full-stack dev with 3 years exp in React/Node. Update my summary.`}
                                        rows={8}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-none text-gray-900 placeholder:text-gray-400 mb-6"
                                    />

                                    <button
                                        onClick={handleGenerateResume}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex justify-center items-center gap-2 font-bold shadow-lg shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-70 text-[16px]"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> {hasGenerated ? 'Updating...' : 'Generating...'}</>
                                        ) : hasGenerated ? (
                                            <><RefreshCw className="w-5 h-5" /> Update with AI</>
                                        ) : (
                                            <><Sparkles className="w-5 h-5" /> Create with AI</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* Manual Steps Sidebar */
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <ResumeSidebar currentStep={currentStep} setCurrentStep={setCurrentStep} />
                                </div>
                            )}
                        </div>

                        {/* ── CENTER PANEL: Manual Form (Only in Edit mode) ── */}
                        {activeTab === 'edit' && (
                            <div className="w-[600px] shrink-0 animate-in fade-in zoom-in-95 duration-500">
                                <ResumeForms
                                    currentStep={currentStep}
                                    setCurrentStep={setCurrentStep}
                                    resumeData={resumeData}
                                    updateData={updateData}
                                />
                            </div>
                        )}

                        {/* ── RIGHT PANEL: Live resume preview ── */}
                        <div className="flex-1 min-w-0 print:w-full">
                            {hasGenerated ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                                    <ResumePreview resumeData={resumeData} />
                                </div>
                            ) : (
                                /* Empty state before generating */
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-center py-40 px-8 shadow-sm">
                                    <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
                                        <Sparkles className="w-10 h-10 text-violet-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Build your resume</h3>
                                    <p className="text-gray-500 max-w-sm">
                                        Use AI Assist to generate a draft, or start manual editing.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, type: null, id: null })}
                onConfirm={handleConfirmAction}
                title={modal.type === 'delete' ? "Delete version" : "Start New Resume?"}
                message={modal.type === 'delete' ? "Are you sure you want to delete this version? This action is permanent." : "Any unsaved changes will be lost. Do you want to continue?"}
                confirmText={modal.type === 'delete' ? "Delete" : "Start New"}
                type="danger"
            />
        </div>
    );
};

export default ResumeBuilder;
