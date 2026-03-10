import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import {
    User, Mail, Phone, Github, Linkedin, Edit3, Save, X,
    FileText, Plus, Briefcase, ChevronRight, Loader2,
    History, CheckCircle, Clock, XCircle, AlertCircle,
    Pencil, Trash2, ExternalLink, BookOpen, Download, Camera, Image, Link as LinkIcon, Maximize
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ResumePreview from '../../components/resume/ResumePreview';

const MyProfile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        github_url: '',
        linkedin_url: '',
        professional_profile: '',
        profile_photo: '',
    });

    const [downloadingId, setDownloadingId] = useState(null);
    const fileInputRef = useRef(null);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);

    const [modal, setModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [profRes, resumeRes, appRes] = await Promise.allSettled([
                api.get('/auth/me'),
                api.get('/resumes'),
                api.get('/applications/my'),
            ]);

            if (profRes.status === 'fulfilled') {
                const p = profRes.value.data;
                setProfile(p);
                setFormData({ 
                    name: p.name || '', 
                    phone: p.phone || '', 
                    github_url: p.github_url || '', 
                    linkedin_url: p.linkedin_url || '',
                    professional_profile: p.professional_profile || '',
                    profile_photo: p.profile_photo || ''
                });
            }
            if (resumeRes.status === 'fulfilled') {
                setResumes(Array.isArray(resumeRes.value.data) ? resumeRes.value.data : []);
            }
            if (appRes.status === 'fulfilled') {
                setApplications(Array.isArray(appRes.value.data) ? appRes.value.data : []);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (customData) => {
        setSaving(true);
        setSaveMsg('');
        const dataToSave = customData || formData;
        try {
            await api.put('/auth/me', dataToSave);
            setProfile(prev => ({ ...prev, ...dataToSave }));
            if (!customData) setEditing(false);
            setSaveMsg('Profile updated successfully!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            setSaveMsg(err.response?.data?.error || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCameraClick = (e) => {
        if (e) e.stopPropagation();
        fileInputRef.current.click();
    };

    const validateProfessionalPhoto = async (base64Image) => {
        const checkToast = toast.loading('Checking photo quality...', { position: 'bottom-center' });
        try {
            const res = await api.post('/ai/verify-photo', { image: base64Image });
            toast.dismiss(checkToast);
            if (!res.data.isProfessional) {
                toast.error('please upload professional photo..', { duration: 5000 });
                return false;
            }
            return true;
        } catch (err) {
            toast.dismiss(checkToast);
            return true; 
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            const isOk = await validateProfessionalPhoto(base64String);
            if (!isOk) return;

            const updatedData = { ...formData, profile_photo: base64String };
            setFormData(updatedData);

            if (activeSection === 'overview' || showPhotoMenu) {
                await handleSave(updatedData);
            }
            toast.success('Photo updated successfully!');
            setShowPhotoMenu(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteResume = async (id) => {
        setModal({ open: true, id });
    };

    const confirmDeleteResume = async () => {
        const id = modal.id;
        const resumeToRestore = resumes.find(r => r.id === id);

        try {
            await api.delete(`/resumes/${id}`);
            setResumes(prev => prev.filter(r => r.id !== id));

            toast((t) => (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Resume deleted</span>
                    </div>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await api.post('/resumes', resumeToRestore.resume_data);
                                if (res.data?.data) {
                                    setResumes(prev => [res.data.data, ...prev]);
                                    toast.success('Resume restored!', { icon: '🔄' });
                                }
                            } catch (err) {
                                toast.error('Restore failed');
                            }
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wider"
                    >
                        Undo
                    </button>
                </div>
            ), { duration: 10000, position: 'bottom-center' });

        } catch {
            toast.error('Failed to delete resume.');
        } finally {
            setModal({ open: false, id: null });
        }
    };

    const handleDownloadResume = async (resume, e) => {
        if (e) e.stopPropagation();
        setDownloadingId(resume.id);
        const toastId = toast.loading('Preparing your PDF...', { position: 'bottom-center' });

        setTimeout(async () => {
            try {
                const printArea = document.getElementById(`resume-preview-hidden-${resume.id}`);
                if (!printArea) throw new Error('Preview not ready');

                const originalStyle = printArea.style.cssText;
                printArea.style.width = '794px';
                
                const canvas = await html2canvas(printArea, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: 794
                });

                printArea.style.cssText = originalStyle;
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const fullName = resume.resume_data?.personalInfo?.fullName || resume.resume_data?.personal?.name || 'Resume';
                pdf.save(`${fullName.replace(/\s+/g, '_')}_Resume.pdf`);
                
                toast.success('Resume downloaded!', { id: toastId });
            } catch (err) {
                console.error('PDF Error:', err);
                toast.error('Failed to generate PDF', { id: toastId });
            } finally {
                setDownloadingId(null);
            }
        }, 800);
    };

    const statusConfig = {
        applied: { color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', icon: Clock, label: 'Applied' },
        Shortlisted: { color: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-500', icon: AlertCircle, label: 'Shortlisted' },
        Selected: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Selected' },
        Rejected: { color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', icon: XCircle, label: 'Rejected' },
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'edit', label: 'Edit Profile', icon: Edit3 },
        { id: 'resumes', label: 'Saved Resumes', icon: History },
        { id: 'applications', label: 'Applied Jobs', icon: Briefcase },
    ];

    if (loading) return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
        </div>
    );

    const displayName = profile?.name || user?.name || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="min-h-screen bg-transparent py-10 px-4 font-['Inter',sans-serif]">
            <div className="max-w-6xl mx-auto">

                {/* ── Hero Banner ── */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-violet-900 rounded-[2.5rem] p-8 sm:p-12 mb-8 overflow-hidden shadow-2xl">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-8">
                        <div 
                            className="relative group flex-shrink-0 cursor-pointer"
                            onClick={() => setShowPhotoMenu(true)}
                            title="Manage profile photo"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-1 shadow-2xl shadow-violet-200 ring-8 ring-white/10 group-hover:scale-105 transition-transform overflow-hidden relative">
                                <div className="w-full h-full rounded-[2.4rem] bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                                    {profile?.profile_photo ? (
                                        <img src={profile.profile_photo} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-6xl font-black text-violet-600">{initials}</span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                                    <Maximize className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-slate-800 shadow-lg group-hover:rotate-12 transition-transform">
                                <Camera className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <p className="text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-1">Job Seeker Profile</p>
                            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">{displayName}</h1>
                            <p className="text-slate-400 font-bold mt-1 text-base">{profile?.email || user?.email}</p>
                        </div>

                        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex-shrink-0">
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">{resumes.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumes</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">{applications.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">
                                    {applications.filter(a => a.status === 'Selected').length}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-72 shrink-0 space-y-4">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 overflow-hidden">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                const active = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all mb-1 last:mb-0 ${active
                                            ? 'bg-slate-900 text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'text-violet-400' : 'text-slate-400'}`} />
                                        {item.label}
                                        {active && <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Quick Actions</p>
                            <button
                                onClick={() => navigate('/resume-builder')}
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Create New Resume
                            </button>
                            <Link
                                to="/jobs"
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-black rounded-2xl transition-all"
                            >
                                <BookOpen className="w-4 h-4 text-slate-400" /> Browse Jobs
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {activeSection === 'overview' && (
                            <div className="space-y-6 text-slate-900">
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-7">
                                        <h2 className="text-xl font-black">Personal Information</h2>
                                        <button
                                            onClick={() => setActiveSection('edit')}
                                            className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {[
                                            { icon: User, label: 'Full Name', value: profile?.name, color: 'bg-violet-50 text-violet-600' },
                                            { icon: Mail, label: 'Email Address', value: profile?.email, color: 'bg-blue-50 text-blue-600' },
                                            { icon: Phone, label: 'Phone Number', value: profile?.phone || '—', color: 'bg-emerald-50 text-emerald-600' },
                                            { icon: Github, label: 'GitHub', value: profile?.github_url || '—', link: profile?.github_url, color: 'bg-gray-50 text-gray-700' },
                                            { icon: Linkedin, label: 'LinkedIn', value: profile?.linkedin_url || '—', link: profile?.linkedin_url, color: 'bg-sky-50 text-sky-600' },
                                        ].map(({ icon: Icon, label, value, link, color }) => (
                                            <div key={label} className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                    {link ? (
                                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-violet-600 hover:underline flex items-center gap-1 truncate">
                                                            <span className="truncate">{value.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm font-black text-slate-800 truncate text-slate-900">{value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    

                                </div>
                            </div>
                        )}

                        {activeSection === 'edit' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-slate-900">
                                <h2 className="text-xl font-black mb-8">Edit Profile</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            value={formData.linkedin_url}
                                            onChange={e => setFormData(p => ({ ...p, linkedin_url: e.target.value }))}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all outline-none"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">GitHub</label>
                                            <input
                                                type="url"
                                                value={formData.github_url}
                                                onChange={e => setFormData(p => ({ ...p, github_url: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => handleSave()} disabled={saving} className="flex-1 py-4 bg-violet-600 text-white font-black rounded-2xl shadow-lg active:scale-95 disabled:opacity-70">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button onClick={() => setActiveSection('overview')} className="px-8 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl border">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'resumes' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-slate-900">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black">Saved Resumes</h2>
                                    <button onClick={() => navigate('/resume-builder')} className="px-5 py-3 bg-violet-600 text-white text-sm font-black rounded-2xl shadow-lg active:scale-95">
                                        + Create New
                                    </button>
                                </div>
                                {resumes.length === 0 ? (
                                    <div className="py-10 text-center text-slate-500">No resumes found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {resumes.map((r, idx) => {
                                            const name = r.resume_data?.personalInfo?.fullName || r.resume_data?.personal?.name || 'My Resume';
                                            const title = r.resume_data?.personalInfo?.jobTitle || r.resume_data?.personal?.jobTitle || 'Professional';
                                            return (
                                                <div key={r.id} className="flex items-center gap-4 p-5 bg-slate-50/60 rounded-2xl border border-gray-100">
                                                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                            <p className="text-sm font-black text-slate-900">{name}</p>
                                                            {idx === 0 && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-widest leading-none">Latest</span>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-bold">{title} &bull; Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleDownloadResume(r)} className="p-2 border rounded-xl hover:bg-white text-slate-900 border-gray-200 transition-all shadow-sm"><Download className="w-4 h-4" /></button>
                                                        <button onClick={() => navigate(`/resume-builder/${r.id}`)} className="p-2 border rounded-xl hover:bg-white text-slate-900 border-gray-200 transition-all shadow-sm"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteResume(r.id)} className="p-2 border rounded-xl hover:bg-white text-red-500 border-gray-200 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'applications' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-slate-900">
                                <h2 className="text-xl font-black mb-8">Applied Jobs</h2>
                                {applications.length === 0 ? (
                                    <div className="py-10 text-center text-slate-500 font-bold text-sm">No applications yet.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map(app => {
                                            const cfg = statusConfig[app.status] || statusConfig.applied;
                                            return (
                                                <div key={app.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl relative overflow-hidden">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.dot}`} />
                                                    <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center flex-shrink-0">
                                                        <Briefcase className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black truncate text-slate-900">{app.title}</p>
                                                        <p className="text-xs text-slate-500 font-bold">{app.company_name}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {downloadingId && (
                <div className="fixed -left-[9999px] top-0 no-print">
                    {resumes.filter(r => r.id === downloadingId).map(r => (
                        <div key={r.id} id={`resume-preview-hidden-${r.id}`}>
                            <ResumePreview resumeData={r.resume_data} />
                        </div>
                    ))}
                </div>
            )}
            
            <ConfirmModal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, id: null })}
                onConfirm={confirmDeleteResume}
                title="Delete Resume"
                message="Are you sure you want to delete this resume?"
                confirmText="Delete Now"
                type="danger"
            />

            {showPhotoMenu && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in transition-all" onClick={() => setShowPhotoMenu(false)}>
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" />
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowPhotoMenu(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Profile Photo</h3>
                            <p className="text-slate-500 font-bold">Choose an option below</p>
                        </div>
                        <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-[2.5rem] overflow-hidden bg-slate-50 border-8 border-white shadow-xl mb-10 flex items-center justify-center">
                            {profile?.profile_photo ? (
                                <img src={profile.profile_photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-8xl font-black text-violet-200">{initials}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleCameraClick} className="group flex flex-col items-center gap-4 p-8 bg-slate-50 hover:bg-violet-600 rounded-[2rem] transition-all">
                                <div className="p-4 bg-white rounded-2xl shadow-sm"><Image className="w-6 h-6 text-violet-600" /></div>
                                <span className="font-black text-slate-900 group-hover:text-white">Gallery</span>
                            </button>
                            <button onClick={handleCameraClick} className="group flex flex-col items-center gap-4 p-8 bg-slate-50 hover:bg-emerald-600 rounded-[2rem] transition-all">
                                <div className="p-4 bg-white rounded-2xl shadow-sm"><Camera className="w-6 h-6 text-emerald-600" /></div>
                                <span className="font-black text-slate-900 group-hover:text-white">Camera</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
