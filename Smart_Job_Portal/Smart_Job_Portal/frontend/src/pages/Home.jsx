import { Link } from 'react-router-dom'
import { FileText, Zap, Shield, Search, LayoutDashboard, History, BookOpen, ChevronLeft } from 'lucide-react'

export function Home() {
    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#ede7ea] font-sans overflow-hidden">
            {/* Left Sidebar Panel - Pastel Gradient */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col p-6 bg-gradient-to-br from-[#aceae1] via-[#c6edeb] to-[#f8d0e0] shrink-0">
                <div className="flex justify-end mb-2">
                    <button className="text-teal-700/50 hover:text-teal-700 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* Logo Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center shadow-sm border border-white/50 mb-8">
                    <div className="w-20 h-20 bg-[#168a9c] rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-teal-900/20 transform hover:scale-105 transition-transform cursor-pointer">
                        <svg className="w-10 h-10 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">CareerLens AI</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 text-center">
                        Smart Career Assistant
                    </p>
                </div>

                {/* Menu Pills */}
                <div className="flex flex-col gap-4">
                    <Link to="/" className="bg-white text-slate-800 font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center">
                        <LayoutDashboard className="w-5 h-5 mr-4 text-slate-400" />
                        Home
                    </Link>
                    <Link to="/jobs" className="bg-white/50 hover:bg-white text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center">
                        <Search className="w-5 h-5 mr-4 text-slate-400" />
                        Job Search
                    </Link>
                    <Link to="/login" className="bg-white/50 hover:bg-white text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center">
                        <History className="w-5 h-5 mr-4 text-slate-400" />
                        Dashboard
                    </Link>
                    <Link to="/signup" className="bg-white/50 hover:bg-white text-slate-600 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center">
                        <BookOpen className="w-5 h-5 mr-4 text-slate-400" />
                        Insights
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-12 lg:p-16 flex flex-col items-center justify-center relative overflow-y-auto">
                <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

                    {/* Central Banner Card */}
                    <div className="bg-white rounded-[2rem] p-10 md:p-14 w-full text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
                            CareerLens AI <span className="text-fuchsia-500">Smart Job Matching</span>
                        </h1>
                        <p className="mt-6 text-slate-500 font-bold text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            Your personal companion for real-time resume analysis and intelligent job matching strategies.
                        </p>
                        <p className="mt-2 text-slate-400 font-semibold text-sm">
                            Powered by Advanced AI to help you land your dream job faster.
                        </p>
                    </div>

                    {/* 4 Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full">
                        {/* Card 1 - Blue */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-blue-500 rounded-r-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-slate-700" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Smart Resume</h3>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">Upload your resume for instant feedback and ATS scoring.</p>
                        </div>

                        {/* Card 2 - Orange/Yellow */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-amber-400 rounded-r-lg shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg">AI Analysis</h3>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">Get instant skill gap analysis tailored specifically to your target roles.</p>
                        </div>

                        {/* Card 3 - Green */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-emerald-500 rounded-r-lg shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 group-hover:scale-110 transition-transform">
                                <Search className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Track Jobs</h3>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">Stay updated with the latest matched jobs and monitor your applications.</p>
                        </div>

                        {/* Card 4 - Purple */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: '400ms' }}>
                            <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-violet-500 rounded-r-lg shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-violet-500" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Private & Secure</h3>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">Your professional data and resumes are processed securely and kept private.</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
                        <Link to="/signup" className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-extrabold tracking-wide py-4 px-12 rounded-xl shadow-[0_8px_20px_rgba(139,92,246,0.4)] transition-all hover:shadow-[0_12px_25px_rgba(139,92,246,0.5)] hover:-translate-y-1">
                            START EXPLORING NOW
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

