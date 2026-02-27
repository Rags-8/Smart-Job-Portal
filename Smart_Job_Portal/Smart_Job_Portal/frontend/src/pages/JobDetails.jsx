import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, Building, RupeeSign } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export function JobDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, profile, session } = useAuth()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [applying, setApplying] = useState(false)
    const [resumeFile, setResumeFile] = useState(null)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        setJob(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session) fetchJob()
  }, [id, session])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!resumeFile) return alert("Please select a resume file")

    setApplying(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_id', id)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/applications`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session.access_token}`
        }
      })
      alert("Application submitted successfully!")
      navigate('/user-dashboard')
    } catch (err) {
      alert("Error applying: " + err.message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!job) return <div className="p-8 text-center">Job not found.</div>

  const isUser = profile?.role === 'user'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 bg-slate-50 flex items-start gap-6">
           <div className="w-16 h-16 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-3xl shrink-0">
              {job.companies?.name?.charAt(0) || 'C'}
           </div>
           <div>
             <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
             <div className="mt-2 flex items-center gap-2 text-slate-600 text-lg">
                <Building className="w-5 h-5 text-slate-400" />
                <span>{job.companies?.name}</span>
             </div>
             
             <div className="flex flex-wrap items-center mt-6 gap-6 text-sm text-slate-500">
               <div className="flex items-center">
                 <MapPin className="w-4 h-4 mr-2" />
                 {job.location}
               </div>
               <div className="flex items-center">
                 <Briefcase className="w-4 h-4 mr-2" />
                 {job.job_type}
               </div>
               <div className="flex items-center">
                 <RupeeSign className="w-4 h-4 mr-2" />
                 ₹{job.salary?.toLocaleString('en-IN')}
               </div>
             </div>
           </div>
        </div>

        {/* Body */}
        <div className="p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                <div className="prose text-slate-600 max-w-none whitespace-pre-wrap">
                  {job.description}
                </div>
             </section>

             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                <div className="prose text-slate-600 max-w-none whitespace-pre-wrap flex flex-col gap-2">
                   {job.requirements.split('\n').map((req, i) => (
                      <div key={i} className="flex items-start">
                         <span className="w-2 h-2 mt-2 mr-3 bg-teal-500 rounded-full shrink-0"></span>
                         <span>{req}</span>
                      </div>
                   ))}
                </div>
             </section>
          </div>

          <div className="md:col-span-1">
             <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-6">
                <h3 className="font-bold text-slate-900 mb-2">Apply for this job</h3>
                {isUser ? (
                  <form onSubmit={handleApply} className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume (PDF, TXT, DOCX)</label>
                      <input 
                        type="file" 
                        accept=".pdf,.txt,.docx" 
                        required
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 border border-slate-200 rounded-lg cursor-pointer bg-white"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={applying}
                      className="w-full btn-primary"
                    >
                      {applying ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-2">
                       Your resume will automatically be analyzed by our AI system.
                    </p>
                  </form>
                ) : (
                  <div className="mt-4 p-4 text-sm text-slate-700 bg-slate-100 rounded-lg">
                    You must be logged in as a Job Seeker to apply for this position.
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
