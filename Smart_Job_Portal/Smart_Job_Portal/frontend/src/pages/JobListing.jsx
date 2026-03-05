import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export function JobListing() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        setJobs(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session) fetchJobs()
  }, [session])

  if (loading) return <div className="p-8 text-center text-slate-500">Loading jobs...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Opportunities</h1>
          <p className="mt-2 text-slate-600">Find the next step in your career.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No jobs posted yet. Check back later!
          </div>
        ) : (
          jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card block transition-all hover:shadow-lg hover:-translate-y-1 group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      {job.company_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                      <p className="text-sm font-semibold text-violet-600">{job.company_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    {new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-4">
                  <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-500 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    {job.job_type}
                  </div>
                </div>

                {job.skills_required && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.skills_required.split(',').slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                        {skill.trim()}
                      </span>
                    ))}
                    {job.skills_required.split(',').length > 3 && (
                      <span className="text-[11px] font-bold text-slate-400 py-1">
                        +{job.skills_required.split(',').length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
