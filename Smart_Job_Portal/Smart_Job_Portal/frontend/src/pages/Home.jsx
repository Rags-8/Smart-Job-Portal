import { Link } from 'react-router-dom'
import { FileText, Zap, Shield, Search, LayoutDashboard, CheckCircle, Users, Briefcase, ArrowRight } from 'lucide-react'

export function Home() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-900">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/hero_bg.png" alt="Job Search AI" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-violet-300/40 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-blue-300/40 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-8 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">AI-Powered Job Portal</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 animate-slide-up">
                            Land Your Dream Job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">CareerLens AI</span>
                        </h1>

                        <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12 animate-slide-up delay-100">
                            The smartest way to build your career. Get real-time resume analysis,
                            automated skill matching, and personalized job recommendations tailored to your goals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                            <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-violet-600 hover:shadow-violet-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center group">
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/jobs" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:border-violet-300 transition-all hover:-translate-y-1">
                                Browse Openings
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-900 mb-2">15k+</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Jobs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-900 mb-2">2.5k</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Companies</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-900 mb-2">95%</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Match Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-900 mb-2">10k+</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Success Stories</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/resume_bg.png" alt="AI Resume Building" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 text-balance px-4 sm:px-0">
                        <h2 className="text-sm font-black text-violet-600 uppercase tracking-[0.3em] mb-4">Core Features</h2>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to succeed</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-violet-500/5">
                            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-8 text-violet-600 group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">AI Matching</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Our intelligent algorithms analyze job requirements and your profile to give you a real-time "Match Score" for every opening.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-violet-500/5">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Smart Resume</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Build or upload your resume and get instant AI feedback on how to optimize it for ATS and specific job descriptions.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:shadow-violet-500/5">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 text-emerald-600 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">One-Click Apply</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Save your profile once and apply to multiple jobs instantly without filling out repetitive forms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 z-0">
                    <img src="/screening_bg.png" alt="AI Screening" className="w-full h-full object-cover opacity-[0.15] mix-blend-lighten" />
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-sm font-black text-violet-400 uppercase tracking-[0.3em] mb-6 tracking-tight">How it works</h2>
                            <h2 className="text-5xl font-black tracking-tight leading-[1.2] mb-12">Three steps to your next career move</h2>

                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full border border-violet-500/50 flex items-center justify-center flex-shrink-0 font-black text-xl text-violet-400">1</div>
                                    <div>
                                        <h4 className="text-xl font-black mb-2">Create Your Profile</h4>
                                        <p className="text-slate-400 font-medium">Build your smart profile or upload your existing resume to get started.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full border border-violet-500/50 flex items-center justify-center flex-shrink-0 font-black text-xl text-violet-400">2</div>
                                    <div>
                                        <h4 className="text-xl font-black mb-2">Get AI Insights</h4>
                                        <p className="text-slate-400 font-medium">See how you match with jobs and get recommendations on skills to improve.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full border border-violet-500/50 flex items-center justify-center flex-shrink-0 font-black text-xl text-violet-400">3</div>
                                    <div>
                                        <h4 className="text-xl font-black mb-2">Apply with Confidence</h4>
                                        <p className="text-slate-400 font-medium">Submit your application instantly to top companies and track your progress.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-1 rounded-[3rem] shadow-2xl">
                                <div className="bg-slate-900 rounded-[2.8rem] p-10">
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-slate-800 p-5 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center font-black">85%</div>
                                            <div className="font-bold">Software Engineer - Amazon</div>
                                        </div>
                                        <div className="bg-slate-800 p-5 rounded-2xl flex items-center gap-4 opacity-70 scale-95 origin-left">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black">92%</div>
                                            <div className="font-bold">Frontend Dev - Google</div>
                                        </div>
                                        <div className="bg-slate-800 p-5 rounded-2xl flex items-center gap-4 opacity-50 scale-90 origin-left">
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black">78%</div>
                                            <div className="font-bold">Backend Dev - Meta</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">Ready to boost your career?</h2>
                    <p className="text-xl text-slate-600 font-medium mb-12">Join thousands of professionals finding smarter ways to work.</p>
                    <Link to="/signup" className="inline-block px-12 py-6 bg-violet-600 text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-violet-600/30 hover:bg-violet-700 transition-all hover:-translate-y-2">
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-20 border-t border-slate-100 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center space-x-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">CareerLens AI</span>
                    </div>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-4">Your Intelligent Career Partner</p>
                    <div className="flex justify-center gap-6 text-slate-500 font-bold text-sm">
                        <Link to="/jobs" className="hover:text-violet-600">Browse Jobs</Link>
                        <Link to="/login" className="hover:text-violet-600">Company Access</Link>
                        <a href="#" className="hover:text-violet-600">Terms</a>
                        <a href="#" className="hover:text-violet-600">Privacy</a>
                    </div>
                    <p className="mt-12 text-slate-300 text-xs font-medium">© 2026 CareerLens AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
