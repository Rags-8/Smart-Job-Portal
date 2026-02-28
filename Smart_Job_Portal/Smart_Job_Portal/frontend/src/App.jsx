import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import MyApplications from './pages/user/MyApplications';
import EditApplication from './pages/user/EditApplication';
import ResumeBuilder from './pages/user/ResumeBuilder'; import MyProfile from './pages/user/MyProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/post-job" element={<ProtectedRoute roleRequired="admin"><PostJob /></ProtectedRoute>} />
              <Route path="/admin/edit-job/:id" element={<ProtectedRoute roleRequired="admin"><EditJob /></ProtectedRoute>} />
              <Route path="/admin/my-jobs" element={<ProtectedRoute roleRequired="admin"><MyJobs /></ProtectedRoute>} />
              <Route path="/admin/job/:jobId/applicants" element={<ProtectedRoute roleRequired="admin"><Applicants /></ProtectedRoute>} />
              <Route path="/admin/candidates" element={<ProtectedRoute roleRequired="admin"><Navigate to="/admin/my-jobs" replace /></ProtectedRoute>} />
              <Route path="/admin/screening" element={<ProtectedRoute roleRequired="admin"><ScreeningDashboard /></ProtectedRoute>} />

              {/* User / Public Routes */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/my-applications" element={<ProtectedRoute roleRequired="user"><MyApplications /></ProtectedRoute>} />
              <Route path="/my-profile" element={<ProtectedRoute roleRequired="user"><MyProfile /></ProtectedRoute>} />
              <Route path="/edit-application/:id" element={<ProtectedRoute roleRequired="user"><EditApplication /></ProtectedRoute>} />
              <Route path="/resume-builder" element={<ProtectedRoute roleRequired="user"><ResumeBuilder /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
