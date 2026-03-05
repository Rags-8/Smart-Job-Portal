import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signup(formData.name, formData.email, formData.password, formData.role);
        } catch (err) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex bg-[#f8f6fc] font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row">

                {/* Left Side - Typography (Opposite to Login for variety) */}
                <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-6 lg:p-12 premium-auth-bg rounded-l-[2rem] animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="max-w-lg">
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                            Elevate your <br /> hiring & job <br /> search.
                        </h1>
                        <p className="mt-8 text-lg text-slate-300 font-medium leading-relaxed max-w-md">
                            Whether you're looking for top talent or your dream job, we've got the tools you need.
                        </p>
                    </div>
                </div>

                {/* Right Side - Signup Card */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12">
                    <div className="bg-white rounded-[2rem] p-10 lg:p-14 w-full max-w-md shadow-[0_10px_40px_rgba(0,0,0,0.04)] text-center animate-slide-up">
                        {/* Purple Icon */}
                        <div className="w-16 h-16 bg-[#eee8fe] rounded-3xl flex items-center justify-center text-[#6833ff] text-2xl font-bold mx-auto mb-8 shadow-sm">
                            C
                        </div>

                        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Create an account</h2>
                        <p className="mt-2 text-[15px] text-gray-500 font-medium mb-10">Join us today to get started.</p>

                        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold text-center animate-fade-in border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl text-gray-900 font-medium text-[15px] focus:ring-2 focus:ring-[#e2d5ff] focus:bg-white transition-all placeholder-gray-400"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl text-gray-900 font-medium text-[15px] focus:ring-2 focus:ring-[#e2d5ff] focus:bg-white transition-all placeholder-gray-400"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl text-gray-900 font-bold text-2xl tracking-widest focus:ring-2 focus:ring-[#e2d5ff] focus:bg-white transition-all placeholder-gray-400 placeholder:tracking-normal placeholder:font-medium placeholder:text-[15px] leading-none pb-2 pt-4"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Account Type</label>
                                <select
                                    className="w-full px-4 py-3.5 bg-[#f0f4f8] border-none rounded-xl text-gray-900 font-medium text-[15px] focus:ring-2 focus:ring-[#e2d5ff] focus:bg-white transition-all cursor-pointer appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">Job Seeker (Looking for jobs)</option>
                                    <option value="admin">Employer (Hiring candidates)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-4 bg-[#6833ff] hover:bg-[#5221d8] text-white text-base font-bold rounded-xl transition-all shadow-md shadow-[#6833ff]/20 flex items-center justify-center mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-sm text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#6833ff] font-bold hover:text-[#5221d8] transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
