import { useState, useEffect } from 'react'
import { PlusCircle, Search, Users, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const { session, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  // Job Post Form State
  const [showPostJob, setShowPostJob] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [jobType, setJobType] = useState('Full-time')

  useEffect(() => {
    fetchJobs()
  }, [session])

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(import.meta.env.VITE_API_URL + '/jobs/admin/my-jobs', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      setJobs(data)
      if (data.length > 0) {
        selectJob(data[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectJob = async (job) => {
    setSelectedJob(job)
    try {
      const { data } = await axios.get(import.meta.env.VITE_API_URL + '/applications/job/' + job.id, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      setApplications(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/jobs', {
        title, description, requirements, location, salary, job_type: jobType
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      alert("Job posted successfully!")
      setShowPostJob(false)
      fetchJobs() // Refresh list
    } catch (err) {
      alert("Error posting job: " + (err.response?.data?.error || err.message))
    }
  }

  const handleUpdateStatus = async (appId, status) => {
    try {
      await axios.patch(import.meta.env.VITE_API_URL + '/applications/' + appId + '/status', { status }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      // Refresh applicants
      selectJob(selectedJob)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar: Job List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Postings</h2>
          <button
            onClick={() => setShowPostJob(!showPostJob)}
            className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            New Job
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100 h-[calc(100vh-12rem)] overflow-y-auto">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => selectJob(job)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedJob?.id === job.id ? 'bg-slate-50 border-l-4 border-l-teal-500' : ''}`}
            >
              <h3 className="font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
              <p className="text-sm text-slate-500 flex justify-between mt-1">
                <span>{job.status}</span>
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
              </p>
            </button>
          ))}
          {jobs.length === 0 && (
            <div className="p-8 text-center text-slate-500">No jobs posted yet.</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-2/3 h-[calc(100vh-10rem)] overflow-y-auto pr-2">
        {showPostJob ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Title</label>
                <input type="text" required className="input-field mt-1" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input type="text" required className="input-field mt-1" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Salary Range</label>
                  <input type="text" required className="input-field mt-1" placeholder="e.g. ₹80k - ₹100k" value={salary} onChange={e => setSalary(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Job Type</label>
                  <select className="input-field mt-1" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea required rows="4" className="input-field mt-1" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Requirements (Bullet points)</label>
                <textarea required rows="4" className="input-field mt-1" placeholder="- 3 years React&#10;- Knowledge of Node.js" value={requirements} onChange={e => setRequirements(e.target.value)}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPostJob(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        ) : selectedJob ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Applicants for {selectedJob.title}
              </h2>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {applications.length} Candidates
              </span>
            </div>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {app.profiles.avatar_url ? (
                        <img src={app.profiles.avatar_url} alt="avatar" className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                          {app.profiles.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{app.profiles.full_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-teal-600 hover:text-teal-700">
                            <ExternalLink className="w-4 h-4 mr-1" /> View Resume
                          </a>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {app.job_match_results?.[0] && (
                      <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          <span className="font-medium text-slate-700 text-sm">AI Analysis</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-900 mr-2">Matched Skills:</span>
                          {app.job_match_results[0].matched_skills?.join(', ') || 'None'}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-semibold text-red-900 mr-2">Missing Skills:</span>
                          {app.job_match_results[0].missing_skills?.join(', ') || 'None'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0 lg:w-48 lg:border-l lg:border-slate-100 lg:pl-6">
                    <div className="text-center w-full">
                      <div className="text-3xl font-extrabold text-teal-600">
                        {app.job_match_results?.[0]?.match_percentage || 0}%
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                        Match Score
                      </div>
                      <div className="text-sm font-medium mt-1">
                        <span className={`${app.job_match_results?.[0]?.fit_level?.includes('Excellent') ? 'text-green-600' :
                            app.job_match_results?.[0]?.fit_level?.includes('Good') ? 'text-teal-600' : 'text-amber-600'
                          }`}>
                          {app.job_match_results?.[0]?.fit_level || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full mt-4 flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase">Status: {app.status}</div>
                      {app.status === 'applied' && (
                        <>
                          <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} className="w-full btn-primary py-1.5 text-sm">Shortlist</button>
                          <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="w-full btn-secondary text-red-600 py-1.5 text-sm border-red-200 hover:bg-red-50">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                  No applicants for this job yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl">
            Select a job from the sidebar to view applicants
          </div>
        )
        }
      </div >
    </div >
  )
}
