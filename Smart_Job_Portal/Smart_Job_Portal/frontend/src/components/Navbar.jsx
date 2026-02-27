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
        `relative inline-flex items-center px-1 pt-1 text-sm font-semibold transition-colors duration-200 ${isActive(path) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
        } group`;

    return (
        <nav className="sticky top-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center space-x-12">
                        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/jobs'} className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                            <span className="text-2xl font-bold text-gradient tracking-tight">CareerLens</span>
                        </Link>

                        {user && (
                            <div className="hidden md:flex md:space-x-8 h-full items-center">
                                {user.role === 'admin' ? (
                                    <>
                                        <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                                            Dashboard
                                            {isActive('/admin/dashboard') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/admin/my-jobs" className={linkClass('/admin/my-jobs')}>
                                            My Jobs
                                            {isActive('/admin/my-jobs') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/jobs" className={linkClass('/jobs')}>
                                            Find Jobs
                                            {isActive('/jobs') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>}
                                        </Link>
                                        <Link to="/my-applications" className={linkClass('/my-applications')}>
                                            Applications
                                            {isActive('/my-applications') && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>}
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <div className="flex flex-col text-right">
                                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                    <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">{user.role}</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-red-600 transition-all duration-200"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full text-gray-700 hover:text-blue-600 transition-colors duration-200">
                                    Log in
                                </Link>
                                <Link to="/signup" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-gray-900 hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5">
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
