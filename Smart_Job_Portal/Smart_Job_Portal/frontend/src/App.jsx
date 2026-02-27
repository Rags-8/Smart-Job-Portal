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
import Jobs from './pages/user/Jobs';
import MyApplications from './pages/user/MyApplications';
import EditApplication from './pages/user/EditApplication';

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

              {/* User / Public Routes */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/my-applications" element={<ProtectedRoute roleRequired="user"><MyApplications /></ProtectedRoute>} />
              <Route path="/edit-application/:id" element={<ProtectedRoute roleRequired="user"><EditApplication /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
