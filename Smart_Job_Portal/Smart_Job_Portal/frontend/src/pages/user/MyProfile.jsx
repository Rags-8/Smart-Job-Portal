import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import {
    User, Mail, Phone, Github, Linkedin, Edit3, Save, X,
    FileText, Plus, Briefcase, ChevronRight, Loader2,
    History, CheckCircle, Clock, XCircle, AlertCircle,
    Pencil, Trash2, ExternalLink, BookOpen, Download
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';

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
    });

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
                setFormData({ name: p.name || '', phone: p.phone || '', github_url: p.github_url || '', linkedin_url: p.linkedin_url || '' });
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

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            await api.put('/auth/me', formData);
            setProfile(prev => ({ ...prev, ...formData }));
            setEditing(false);
            setSaveMsg('Profile updated successfully!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            setSaveMsg(err.response?.data?.error || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
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
            ), { duration: 300000, position: 'bottom-center' });

        } catch {
            toast.error('Failed to delete resume.');
        } finally {
            setModal({ open: false, id: null });
        }
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
                    {/* Decorative blobs */}
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl flex-shrink-0">
                            {initials}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <p className="text-violet-300 text-xs font-black uppercase tracking-[0.2em] mb-1">Job Seeker Profile</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{displayName}</h1>
                            <p className="text-slate-400 font-bold mt-1 text-sm">{profile?.email || user?.email}</p>
                        </div>

                        {/* Stats bar */}
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

                {/* ── Layout: Sidebar + Content ── */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── LEFT SIDEBAR ── */}
                    <div className="w-full lg:w-72 shrink-0 space-y-4">

                        {/* Navigation */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 overflow-hidden">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                const active = activeSection === item.id || (item.id === 'edit' && activeSection === 'edit');
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

                        {/* Quick Actions */}
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
                            <Link
                                to="/my-applications"
                                className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-black rounded-2xl transition-all"
                            >
                                <Briefcase className="w-4 h-4 text-slate-400" /> All Applications
                            </Link>
                        </div>

                        {/* Profile completeness */}
                        {(() => {
                            const fields = [profile?.name, profile?.email, profile?.phone, profile?.github_url, profile?.linkedin_url];
                            const filled = fields.filter(Boolean).length;
                            const pct = Math.round((filled / fields.length) * 100);
                            return (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xs font-black text-slate-700">Profile Strength</p>
                                        <p className="text-xs font-black text-violet-600">{pct}%</p>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    {pct < 100 && (
                                        <p className="text-[10px] text-slate-400 font-bold mt-2">
                                            Complete your profile to improve job matches.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* ── RIGHT CONTENT ── */}
                    <div className="flex-1 min-w-0">

                        {/* ── OVERVIEW ── */}
                        {activeSection === 'overview' && (
                            <div className="space-y-6">
                                {/* Profile info card */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-7">
                                        <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                                        <button
                                            onClick={() => setActiveSection('edit')}
                                            className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all"
                                            title="Edit Profile"
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
                                                        <a href={link} target="_blank" rel="noopener noreferrer"
                                                            className="text-sm font-black text-violet-600 hover:underline flex items-center gap-1 truncate">
                                                            <span className="truncate">{value.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm font-black text-slate-800 truncate">{value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumes mini preview */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900">Saved Resumes <span className="text-slate-400 font-bold text-base">({resumes.length})</span></h2>
                                        <button onClick={() => setActiveSection('resumes')} className="text-xs font-black text-violet-600 hover:underline">View all →</button>
                                    </div>
                                    {resumes.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="text-slate-500 font-bold text-sm">No resumes yet.</p>
                                            <button onClick={() => navigate('/resume-builder')} className="mt-4 px-5 py-2.5 bg-violet-600 text-white text-xs font-black rounded-xl hover:bg-violet-700 transition-all">
                                                Build First Resume
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {resumes.slice(0, 3).map((r, idx) => (
                                                <div
                                                    key={r.id}
                                                    onClick={() => navigate(`/resume-builder/${r.id}`)}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate">
                                                            {r.resume_data?.personalInfo?.fullName || r.resume_data?.personal?.name || 'My Resume'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400">
                                                            {idx === 0 && <span className="text-emerald-500 mr-1">● Latest  </span>}
                                                            Saved {new Date(r.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/resume-builder/${r.id}`); }}
                                                            className="p-2 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/resume-builder/${r.id}`); }}
                                                            className="p-2 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                                                            title="Edit Resume"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent applications mini */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900">Recent Applications <span className="text-slate-400 font-bold text-base">({applications.length})</span></h2>
                                        <button onClick={() => setActiveSection('applications')} className="text-xs font-black text-violet-600 hover:underline">View all →</button>
                                    </div>
                                    {applications.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="text-slate-500 font-bold text-sm">No applications yet.</p>
                                            <Link to="/jobs" className="mt-4 inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all">Browse Jobs</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {applications.slice(0, 3).map(app => {
                                                const cfg = statusConfig[app.status] || statusConfig.applied;
                                                return (
                                                    <div key={app.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                            <Briefcase className="w-5 h-5 text-slate-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-slate-900 truncate">{app.title}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">{app.company_name}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border flex-shrink-0 ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── EDIT PROFILE ── */}
                        {activeSection === 'edit' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Edit Profile</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">Update your personal details and contact links.</p>
                                    </div>
                                </div>

                                {saveMsg && (
                                    <div className={`mb-6 p-4 rounded-2xl text-sm font-black border ${saveMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {saveMsg}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email (readonly) */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address (cannot change)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                readOnly
                                                className="w-full pl-11 pr-5 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 font-bold text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    {/* GitHub */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">GitHub Profile URL</label>
                                        <div className="relative">
                                            <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                value={formData.github_url}
                                                onChange={e => setFormData(p => ({ ...p, github_url: e.target.value }))}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all"
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">LinkedIn Profile URL</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                value={formData.linkedin_url}
                                                onChange={e => setFormData(p => ({ ...p, linkedin_url: e.target.value }))}
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all"
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                    </div>

                                    {/* Save action */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-violet-600/30 active:scale-95 disabled:opacity-70"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => { setActiveSection('overview'); setFormData({ name: profile.name, phone: profile.phone || '', github_url: profile.github_url || '', linkedin_url: profile.linkedin_url || '' }); }}
                                            className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all border border-slate-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── SAVED RESUMES ── */}
                        {activeSection === 'resumes' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Saved Resumes</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">{resumes.length} version{resumes.length !== 1 ? 's' : ''} saved</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/resume-builder')}
                                        className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white text-sm font-black rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> Create New
                                    </button>
                                </div>

                                {resumes.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <FileText className="w-10 h-10 text-violet-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-2">No Resumes Yet</h3>
                                        <p className="text-slate-500 font-bold text-sm mb-6 max-w-sm mx-auto">Create your first resume to start applying to jobs with one click.</p>
                                        <button onClick={() => navigate('/resume-builder')} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                                            Build My First Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {resumes.map((r, idx) => {
                                            const name = r.resume_data?.personalInfo?.fullName || r.resume_data?.personal?.name || 'My Resume';
                                            const title = r.resume_data?.personalInfo?.jobTitle || r.resume_data?.personal?.jobTitle || 'Professional';
                                            return (
                                                <div
                                                    key={r.id}
                                                    onClick={() => navigate(`/resume-builder/${r.id}`)}
                                                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl border transition-all cursor-pointer ${idx === 0 ? 'border-violet-200 bg-violet-50/50 shadow-sm' : 'border-gray-100 bg-slate-50/60 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                            <p className="text-sm font-black text-slate-900">{name}</p>
                                                            {idx === 0 && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-widest">Latest</span>}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500">{title} &bull; Saved {new Date(r.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/resume-builder/${r.id}`); }}
                                                            className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-violet-200 hover:text-violet-600 transition-all"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/resume-builder/${r.id}`); }}
                                                            className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-violet-200 hover:text-violet-600 transition-all"
                                                            title="Edit Resume"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id); }}
                                                            className="p-2.5 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all"
                                                            title="Delete Resume"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── APPLIED JOBS ── */}
                        {activeSection === 'applications' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Applied Jobs</h2>
                                        <p className="text-sm text-slate-400 font-bold mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} total</p>
                                    </div>
                                    <Link to="/jobs" className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95">
                                        <Briefcase className="w-4 h-4" /> Find More Jobs
                                    </Link>
                                </div>

                                {applications.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <Briefcase className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-2">No Applications Yet</h3>
                                        <p className="text-slate-500 font-bold text-sm mb-6">You haven't applied to any jobs yet. Start exploring!</p>
                                        <Link to="/jobs" className="inline-block px-8 py-4 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-95">Browse Jobs</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applications.map(app => {
                                            const cfg = statusConfig[app.status] || statusConfig.applied;
                                            const StatusIcon = cfg.icon;
                                            return (
                                                <div key={app.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-slate-50/60 hover:bg-slate-50 rounded-2xl border border-gray-100 transition-all relative overflow-hidden">
                                                    {/* Left accent bar */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.dot.replace('bg-', 'bg-')} rounded-l-2xl`} />
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm ml-2">
                                                        <Briefcase className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-black text-slate-900 truncate">{app.title}</p>
                                                        <p className="text-sm font-bold text-violet-600 mt-0.5">{app.company_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                            Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${cfg.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                            {cfg.label}
                                                        </span>
                                                        {app.status === 'Selected' && (
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">🎉 Congrats!</span>
                                                        )}
                                                    </div>
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
            <ConfirmModal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, id: null })}
                onConfirm={confirmDeleteResume}
                title="Delete Resume Version"
                message="Are you sure you want to delete this resume? This action cannot be undone."
                confirmText="Delete Now"
                type="danger"
            />
        </div>
    );
};

export default MyProfile;
