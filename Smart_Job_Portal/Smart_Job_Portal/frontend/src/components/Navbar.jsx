import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const linkClass = (path) =>
        `relative inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-200 ${isActive(path) ? 'text-violet-700' : 'text-gray-700 hover:text-violet-600'
        } group`;

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    if (isAuthPage) {
        return (
            <nav className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                            <span className="text-2xl font-bold text-gradient tracking-tight">CareerLens</span>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center space-x-12">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                            <span className="text-2xl font-bold text-gradient tracking-tight">CareerLens</span>
                        </Link>

                        {user && (
                            <div className="hidden md:flex md:space-x-8 h-full items-center">
                                {user.role === 'admin' ? (
                                    <>
                                        <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                                            Dashboard
                                            {isActive('/admin/dashboard') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/admin/my-jobs" className={linkClass('/admin/my-jobs')}>
                                            Jobs Posted
                                            {isActive('/admin/my-jobs') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/admin/candidates" className={linkClass('/admin/candidates')}>
                                            Candidates
                                            {isActive('/admin/candidates') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/admin/screening" className={linkClass('/admin/screening')}>
                                            Screening Results
                                            {isActive('/admin/screening') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/jobs" className={linkClass('/jobs')}>
                                            Find Jobs
                                            {isActive('/jobs') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/my-applications" className={linkClass('/my-applications')}>
                                            Applications
                                            {isActive('/my-applications') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/resume-builder" className={linkClass('/resume-builder')}>
                                            Resume Builder
                                            {isActive('/resume-builder') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/my-profile" className={linkClass('/my-profile')}>
                                            My Profile
                                            {isActive('/my-profile') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t-lg"></span>}
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/my-profile'} className="flex items-center space-x-3 group cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all">
                                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-sm group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                        {user.name ? user.name[0].toUpperCase() : user.role[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-bold text-gray-900 leading-tight">{user.name || 'Profile'}</span>
                                        <span className="text-[10px] text-violet-600 font-black uppercase tracking-widest">{user.role}</span>
                                    </div>
                                </Link>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-100 hover:border-red-100"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full text-gray-700 hover:text-violet-600 transition-colors duration-200">
                                    Log in
                                </Link>
                                <Link to="/signup" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-gray-900 hover:bg-violet-600 shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-0.5">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
