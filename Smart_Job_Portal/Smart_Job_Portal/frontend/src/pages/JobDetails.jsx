import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, Building, CheckCircle, Clock } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'

export function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applying, setApplying] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone_number: '',
    linkedin_url: '',
    github_url: '',
    skills: '',
    resume_url: null, // Will hold base64 string
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // Since user might not be logged in to view details, we use the public GET /jobs and find the specific one for now
        // Alternatively, if there's a GET /jobs/:id, we use that. Assuming we need to find it from the list.
        const response = await api.get(`/jobs`);
        const foundJob = response.data.find(j => String(j.id) === String(id));
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, resume_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user || user.role !== 'user') {
      setError("You must be logged in as a Job Seeker to apply.");
      return;
    }

    if (!formData.resume_url) return alert("Please select a resume file")

    setApplying(true)
    setError(null);

    try {
      const payload = {
        full_name: user?.name || 'Applicant',
        email: formData.email,
        phone_number: formData.phone_number,
        skills: formData.skills,
        experience: job?.experience_required || '0', // Defaulting based on job
        resume_url: formData.resume_url, // Base64 string representing the file
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url
      };

      await api.post(`/applications/${id}`, payload);
      alert("Application submitted successfully!")
      navigate('/my-applications')
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to submit application");
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-5rem)]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
    </div>
  )
  if (error && !job) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>
  if (!job) return <div className="p-8 text-center font-bold">Job not found.</div>

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-5rem)] py-8 font-['Inter',sans-serif]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{job.title}</h1>
            <div className="flex items-center text-xl font-bold text-violet-600 mb-6">
              <Building className="w-5 h-5 mr-2" />
              {job.company_name}
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {job.location || 'N/A'}
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" /> {job.job_type || 'N/A'}
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> {job.experience_required || 'Fresher'}
              </div>
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                <span className="font-bold">₹{job.salary?.toLocaleString('en-IN') || 'Competitive'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Details Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-6 font-display">About the Role</h2>
            <div className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {job.description}
            </div>

            {job.responsibilities && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 font-display">Key Responsibilities</h3>
                <ul className="list-disc list-outside pl-5 space-y-2 text-gray-700 font-medium whitespace-pre-wrap">
                  {job.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}>{line.replace(/^[•\-*]\s*/, '').trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 font-display">Requirements</h3>
                <div className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Apply Panel (Now at bottom full width) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
        {!showForm ? (
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-center">Ready to join {job.company_name}?</h3>
            {user && user.role === 'user' ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full px-6 py-3 font-extrabold rounded-xl text-white bg-violet-400 hover:bg-violet-500 shadow-lg shadow-violet-400/30 transition-all hover:-translate-y-0.5"
              >
                Apply Now
              </button>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-xl text-sm font-semibold text-gray-600">
                Please log in as a Job Seeker to apply for this position.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Application Form</h3>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
              <input type="tel" name="phone_number" required value={formData.phone_number} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">GitHub / Portfolio URL</label>
              <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Top Skills (comma separated) *</label>
              <textarea name="skills" required value={formData.skills} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Upload Resume (PDF/DOCX) *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                required
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full mt-4 flex justify-center items-center px-6 py-3 font-extrabold rounded-xl text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 transition-all"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full mt-2 text-xs font-bold text-gray-500 hover:text-gray-800 text-center"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

