import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import ResumePreview from '../../components/resume/ResumePreview';

const MyProfile = () => {
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/resumes/my');
            setResumeData(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            // Ignore 404s, it just means no resume yet
            if (error.response?.status !== 404) {
                toast.error('Failed to load profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your resume profile?')) return;
        setDeleting(true);
        try {
            // Note: Update backend if '/resumes/my' is not the delete route, checking backend implementation... it was DELETE '/api/resumes'
            await api.delete('/resumes');
            setResumeData(null);
            toast.success('Profile deleted successfully.');
        } catch (error) {
            console.error("Error deleting profile:", error);
            toast.error('Failed to delete profile.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display">My Profile</h1>
                    <p className="mt-2 text-gray-600">View and manage your professional resume profile.</p>
                </div>
                <div className="flex gap-3">
                    {resumeData && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleting ? 'Deleting...' : 'Delete Profile'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/resume-builder')}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        {resumeData ? 'Edit Profile' : 'Create Profile'}
                    </button>
                </div>
            </div>

            {resumeData ? (
                <div className="bg-gray-100 p-8 rounded-3xl shadow-inner min-h-[800px]">
                    <ResumePreview resumeData={resumeData} />
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">You haven't created a resume profile yet. Build your professional, ATS-friendly resume to easily apply for jobs.</p>
                    <button
                        onClick={() => navigate('/resume-builder')}
                        className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Build My Resume Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
