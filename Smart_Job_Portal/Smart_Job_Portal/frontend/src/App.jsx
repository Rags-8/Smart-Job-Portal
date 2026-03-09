import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import PostJob from './pages/admin/PostJob';
import EditJob from './pages/admin/EditJob';
import MyJobs from './pages/admin/MyJobs';
import Applicants from './pages/admin/Applicants';
import ScreeningDashboard from './pages/admin/ScreeningDashboard';
import Jobs from './pages/user/Jobs';
import { JobDetails } from './pages/JobDetails';
import { Home } from './pages/Home';
import MyApplications from './pages/user/MyApplications';
import EditApplication from './pages/user/EditApplication';
import ResumeBuilder from './pages/user/ResumeBuilder';
import MyProfile from './pages/user/MyProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="min-h-screen relative overflow-hidden bg-[#f8f5ff]">
          {/* Ambient 3D Glow Orbs */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

          <div className="relative z-10">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/post-job" element={<ProtectedRoute roleRequired="admin"><PostJob /></ProtectedRoute>} />
                <Route path="/admin/edit-job/:id" element={<ProtectedRoute roleRequired="admin"><EditJob /></ProtectedRoute>} />
                <Route path="/admin/my-jobs" element={<ProtectedRoute roleRequired="admin"><MyJobs /></ProtectedRoute>} />
                <Route path="/admin/job/:jobId/applicants" element={<ProtectedRoute roleRequired="admin"><Applicants /></ProtectedRoute>} />
                <Route path="/admin/screening" element={<ProtectedRoute roleRequired="admin"><ScreeningDashboard /></ProtectedRoute>} />

                {/* User / Public Routes */}
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/job/:id" element={<JobDetails />} />
                <Route path="/my-applications" element={<ProtectedRoute roleRequired="user"><MyApplications /></ProtectedRoute>} />
                <Route path="/my-profile" element={<ProtectedRoute roleRequired="user"><MyProfile /></ProtectedRoute>} />
                <Route path="/edit-application/:id" element={<ProtectedRoute roleRequired="user"><EditApplication /></ProtectedRoute>} />
                <Route path="/resume-builder/:id?" element={<ProtectedRoute roleRequired="user"><ResumeBuilder /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
