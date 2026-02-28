import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles, Download, Save } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ResumeSidebar from '../../components/resume/ResumeSidebar';
import ResumeForms from '../../components/resume/ResumeForms';
import ResumePreview from '../../components/resume/ResumePreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [resumeData, setResumeData] = useState({
        personal: { fullName: '', jobTitle: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '' },
        skills: { frontend: [], backend: [], database: [], tools: [] },
        projects: [],
        experience: [],
        education: [],
        certifications: [],
        achievements: []
    });

    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const updateData = (section, data) => {
        setResumeData(prev => ({
            ...prev,
            [section]: data
        }));
    };

    const handleGenerateResume = async () => {
        if (!aiPrompt.trim()) {
            toast.error("Please enter a prompt to generate your resume.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await api.post('/ai/generate-resume-from-prompt', { prompt: aiPrompt });

            // Validate and merge returned data with default structure to prevent UI crashes if some fields are missing
            const aiData = res.data;
            const newResumeData = {
                personal: { ...resumeData.personal, ...(aiData.personal || {}) },
                skills: { ...resumeData.skills, ...(aiData.skills || {}) },
                projects: Array.isArray(aiData.projects) ? aiData.projects : resumeData.projects,
                experience: Array.isArray(aiData.experience) ? aiData.experience : resumeData.experience,
                education: Array.isArray(aiData.education) ? aiData.education : resumeData.education,
                certifications: Array.isArray(aiData.certifications) ? aiData.certifications : resumeData.certifications,
                achievements: Array.isArray(aiData.achievements) ? aiData.achievements : resumeData.achievements,
            };

            setResumeData(newResumeData);
            toast.success("Resume generated successfully!");
            setCurrentStep(0); // Reset to first step to review
            setHasGenerated(true);
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast.error(error.response?.data?.error || "Failed to generate resume.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const printArea = document.getElementById('print-area');
            if (!printArea) return;

            // Add a temporary class to ensure it renders at the right scale for A4
            const originalWidth = printArea.style.width;
            printArea.style.width = '794px'; // ~A4 width in pixels at 96 DPI

            const canvas = await html2canvas(printArea, {
                scale: 2, // Higher scale for better resolution
                useCORS: true,
                logging: false,
                windowWidth: 794
            });

            printArea.style.width = originalWidth;

            const imgData = canvas.toDataURL('image/png');
            // A4 size in mm: 210 x 297
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const { personal } = resumeData;
            const fileName = personal.fullName ? `${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF download.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/resumes', resumeData);
            toast.success('Resume saved to your profile successfully!');
        } catch (error) {
            console.error("Error saving resume:", error);
            toast.error(error.response?.data?.message || 'Failed to save resume. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!hasGenerated) {
        return (
            <div className="min-h-screen bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-[28px] font-bold text-[#1a1f36]">Create New Resume</h1>
                </div>

                <div className="max-w-[600px]">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-6 h-6 text-[#7c8deb]" />
                            <h2 className="text-[22px] font-bold text-[#1a1f36] tracking-tight">AI Resume Builder</h2>
                        </div>

                        <p className="text-[#6b7280] text-[15px] mb-8 leading-relaxed">
                            Describe your experience, skills, and the type of position you're targeting. Our AI will create a professional, ATS-friendly resume for you.
                        </p>

                        <div className="mb-6">
                            <label className="block text-[15px] font-bold text-[#1a1f36] mb-3">
                                Your Requirements
                            </label>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Example: I'm a senior software engineer with 5 years of experience in React, Node.js, and AWS. I've led teams of 5+ developers and delivered multiple SaaS products. I hold a Computer Science degree from MIT. Looking for a Staff Engineer position..."
                                className="w-full h-40 p-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-[15px] focus:ring-2 focus:ring-[#7c8deb]/20 focus:border-[#7c8deb] transition-all resize-none text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        <button
                            onClick={handleGenerateResume}
                            disabled={isGenerating}
                            className="w-full py-3.5 bg-[#96a6f1] hover:bg-[#8598ed] text-white rounded-xl flex justify-center items-center gap-2 font-semibold transition-colors disabled:opacity-70 text-[15px]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" /> Generate Resume
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0">
            <div className="mb-8 flex justify-between items-end print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display">Resume Builder</h1>
                    <p className="mt-2 text-gray-600 text-lg">Review and edit your generated resume.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2 text-gray-500" /> {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-4 py-2 font-semibold text-white bg-gray-900 rounded-xl hover:bg-black transition-all flex items-center shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        <Download className={`w-4 h-4 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                        {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full">
                {/* Sidebar Steps */}
                <div className="lg:col-span-3 lg:col-start-1 print:hidden hidden lg:block">
                    <ResumeSidebar currentStep={currentStep} setCurrentStep={setCurrentStep} />
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-4 h-[calc(100vh-12rem)] print:hidden overflow-y-auto">
                    <ResumeForms
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        resumeData={resumeData}
                        updateData={updateData}
                    />
                </div>

                {/* Live Preview Wrapper */}
                <div className="lg:col-span-5 h-[calc(100vh-12rem)] print:h-auto print:w-full print:block overflow-y-auto">
                    <ResumePreview resumeData={resumeData} />
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
