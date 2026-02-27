import { Link } from 'react-router-dom'
import { Briefcase, FileSearch, LineChart, Users } from 'lucide-react'

export function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="px-4 py-20 bg-slate-50 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        Find your perfect career fit with{' '}
                        <span className="text-teal-600">CareerLens</span>
                    </h1>
                    <p className="max-w-md mx-auto mt-6 text-lg text-slate-600 sm:text-xl md:max-w-2xl">
                        AI-powered job matching, advanced resume analysis, and personalized learning roadmaps to help you land your dream job faster.
                    </p>
                    <div className="flex justify-center mt-10 space-x-4 animate-fade-in">
                        <Link to="/signup" className="px-8 py-3 text-lg btn-primary">
                            Get Started
                        </Link>
                        <Link to="/jobs" className="px-8 py-3 text-lg btn-secondary">
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Why choose CareerLens?</h2>
                        <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600">
                            Our platform bridges the gap between ambitious professionals and top companies using advanced AI.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Feature 1 */}
                        <div className="p-6 transition-shadow bg-slate-50 rounded-2xl hover:shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 text-teal-600 bg-teal-100 rounded-xl">
                                <FileSearch className="w-6 h-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-900">Smart Resume Analysis</h3>
                            <p className="mt-2 text-slate-600">Get deep insights into your resume's strengths and weaknesses using AI.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 transition-shadow bg-slate-50 rounded-2xl hover:shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 text-teal-600 bg-teal-100 rounded-xl">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-900">AI Job Matching</h3>
                            <p className="mt-2 text-slate-600">Discover jobs that truly match your skills and experience level.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 transition-shadow bg-slate-50 rounded-2xl hover:shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 text-teal-600 bg-teal-100 rounded-xl">
                                <LineChart className="w-6 h-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-900">Skill Gap Analysis</h3>
                            <p className="mt-2 text-slate-600">Identify missing skills and get personalized recommendations to level up.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 transition-shadow bg-slate-50 rounded-2xl hover:shadow-md">
                            <div className="flex items-center justify-center w-12 h-12 text-teal-600 bg-teal-100 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-900">For Recruiters</h3>
                            <p className="mt-2 text-slate-600">Post jobs easily and let AI surface the most relevant candidates instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
