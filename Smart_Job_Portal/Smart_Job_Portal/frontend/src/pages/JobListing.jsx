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
            <div key={job.id} className="card transition-all hover:shadow-md hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Placeholder for company logo if missing */}
                    <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
                      {job.companies?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.companies?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                    {job.job_type}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="w-full btn-secondary text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
