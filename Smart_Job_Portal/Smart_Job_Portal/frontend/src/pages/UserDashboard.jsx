import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Sparkles, TrendingUp, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export function UserDashboard() {
  const { session, profile } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/applications/my-applications`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        setApplications(data)
      } catch (error) {
        console.error("Error fetching dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) fetchData()
  }, [session])

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {profile?.full_name}</h1>
        <p className="mt-2 text-slate-600">Here's an overview of your career journey.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="card p-6 border-l-4 border-l-teal-500">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-xl"><FileText className="text-teal-600 w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-600">Applications Sent</p>
              <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl"><Sparkles className="text-blue-600 w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-600">Overall AI Job Match</p>
              <p className="text-2xl font-bold text-slate-900">
                {applications.length ?
                  Math.round(applications.reduce((acc, app) => acc + (app.job_match_results?.[0]?.match_percentage || 0), 0) / applications.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-4">
            <div className="bg-violet-100 p-3 rounded-xl"><TrendingUp className="text-violet-600 w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-600">Readiness Score</p>
              <p className="text-2xl font-bold text-slate-900">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Your Applications</h2>
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 mb-4">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{app.jobs?.title}</h3>
                <p className="text-slate-600">{app.jobs?.companies?.name}</p>
                <div className="flex gap-4 mt-2 text-sm text-slate-500">
                  <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                  <span className={`font-medium ${app.status === 'shortlisted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 border-l border-slate-200 pl-6">
                <div className="text-sm text-slate-500">AI Match Score</div>
                <div className="flex items-center gap-2">
                  {app.job_match_results?.[0] ? (
                    <>
                      <div className="text-2xl font-bold text-teal-600">
                        {app.job_match_results[0].match_percentage}%
                      </div>
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                        {app.job_match_results[0].fit_level}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Processing...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
