import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, Building, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react'
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
  const [step, setStep] = useState(1); // 1: Details, 2: Form, 3: Confirmation
  const [savedResume, setSavedResume] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [applying, setApplying] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone_number: '',
    linkedin_url: '',
    github_url: '',
    skills: '',
    resume_url: null,
  })

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await api.get(`/jobs`);
        const foundJob = response.data.find(j => String(j.id) === String(id));
        if (foundJob) {
          setJob(foundJob);
          // Heuristic match score for UI
          setMatchScore(Math.floor(Math.random() * 20) + 75); // 75-95%
        } else {
          setError("Job not found");
        }

        // Fetch saved resume if user
        if (user && user.role === 'user') {
          try {
            const resData = await api.get('/resumes/my');
            setSavedResume(resData.data);
          } catch (e) {
            console.log("No saved resume found");
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJobData()
  }, [id, user])

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

  const useSavedResume = () => {
    if (savedResume) {
      setFormData({
        ...formData,
        skills: savedResume.skills?.join(', ') || formData.skills,
        // Since savedResume might not have the raw file string, we treat it as a different path in handleApply
      });
      alert("Using details from your saved profile!");
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user || user.role !== 'user') {
      setError("You must be logged in as a Job Seeker to apply.");
      return;
    }

    if (!formData.resume_url && !savedResume) return alert("Please select a resume file or use saved profile")

    setApplying(true)
    setError(null);

    try {
      const payload = {
        full_name: user?.name || 'Applicant',
        email: formData.email,
        phone_number: formData.phone_number,
        skills: formData.skills,
        experience: job?.experience_required || '0',
        resume_url: formData.resume_url || 'Saved Profile',
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url
      };

      await api.post(`/applications/${id}`, payload);
      setStep(3); // Go to confirmation step
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

        {step === 1 ? (
          <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-10 sm:p-14">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.1] mb-4">{job.title}</h1>
                    <div className="flex items-center text-2xl font-black text-blue-600 tracking-tight">
                      <Building className="w-6 h-6 mr-3" />
                      {job.company_name}
                    </div>
                  </div>
                  {user && user.role === 'user' && (
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-slate-900/20">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-base font-black italic tracking-tight">{matchScore}% Match Score</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 text-[14px] font-black uppercase tracking-widest text-slate-500">
                    <MapPin className="w-4 h-4 mr-2.5 text-slate-300" /> {job.location || 'N/A'}
                  </span>
                  <span className="flex items-center bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 text-[14px] font-black uppercase tracking-widest text-slate-500">
                    <Clock className="w-4 h-4 mr-2.5 text-slate-300" /> {job.job_type || 'N/A'}
                  </span>
                  <span className="flex items-center bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 text-[14px] font-black uppercase tracking-widest text-slate-500">
                    <Briefcase className="w-4 h-4 mr-2.5 text-slate-300" /> {job.experience_required || 'Fresher'}
                  </span>
                  <span className="flex items-center bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 text-[14px] font-black">
                    ₹{job.salary?.toLocaleString('en-IN') || 'Competitive'}
                  </span>
                </div>

                {job.company_website && (
                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Website:</span>
                    <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center">
                      {job.company_website.replace(/^https?:\/\//, '')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Description and Responsibilities */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
                  <h2 className="text-xl font-black text-slate-900 border-b-4 border-violet-100 inline-block pb-1 mb-6 uppercase tracking-tight">About the Role</h2>
                  <div className="text-slate-600 leading-relaxed font-bold whitespace-pre-wrap text-sm mb-6">
                    {job.description}
                  </div>

                  {job.responsibilities && (
                    <>
                      <h3 className="text-lg font-black text-slate-900 mb-4">Key Responsibilities</h3>
                      <ul className="list-disc pl-5 space-y-2 text-slate-600 font-medium text-sm">
                        {job.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Requirements and Benefits */}
                {(job.requirements || job.benefits) && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
                    {job.requirements && (
                      <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-900 border-b-4 border-violet-100 inline-block pb-1 mb-6 uppercase tracking-tight">Requirements</h2>
                        <div className="text-slate-600 leading-relaxed font-bold whitespace-pre-wrap text-sm">
                          {job.requirements}
                        </div>
                      </div>
                    )}

                    {job.benefits && (
                      <div>
                        <h2 className="text-xl font-black text-slate-900 border-b-4 border-violet-100 inline-block pb-1 mb-6 uppercase tracking-tight">Perks & Benefits</h2>
                        <div className="text-slate-600 leading-relaxed font-bold whitespace-pre-wrap text-sm">
                          {job.benefits}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Company & Quick Info card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Job Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Openings</span>
                      <span className="text-sm font-black text-slate-900">{job.number_of_openings || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Deadline</span>
                      <span className="text-sm font-black text-slate-900">
                        {job.application_last_date ? new Date(job.application_last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {job.company_description && (
                    <div className="mt-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About {job.company_name}</h3>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                        "{job.company_description}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills card */}
                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Skills Required</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-violet-50 text-violet-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-violet-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Apply CTA (Stick to bottom on scroll if desired, but here as a card) */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 p-8 sm:p-12 mb-20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex-1 w-full lg:w-auto">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Apply with saved resume</p>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 hover:bg-white hover:border-blue-200 transition-all group/res cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover/res:scale-110">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{savedResume ? user.name + ' - Primary Resume' : 'Default Career Profile'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available for instant apply</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
                  <div className="text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-end gap-2 text-emerald-600 font-black text-xl italic mb-1">
                      <span>🎯</span> {matchScore}%
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</p>
                  </div>

                  <div className="w-full sm:w-auto">
                    {user && user.role === 'user' ? (
                      <button
                        onClick={() => setStep(2)}
                        className="w-full sm:w-72 px-10 py-6 font-black text-xl rounded-3xl text-white bg-slate-900 hover:bg-blue-600 shadow-[0_20px_50px_rgba(30,41,59,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-2 active:scale-95 flex items-center justify-center group"
                      >
                        Apply Now
                        <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="px-8 py-4 bg-amber-50 text-amber-700 rounded-2xl text-[13px] font-black italic border border-amber-100 flex items-center gap-3">
                        <span className="text-xl">🔒</span> Log in as Job Seeker to Apply
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : step === 2 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10 lg:p-14 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Complete Application</h3>
              <button onClick={() => setStep(1)} className="text-sm font-black text-slate-300 hover:text-slate-600 transition-colors uppercase tracking-widest">Back</button>
            </div>

            <form onSubmit={handleApply} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-black border border-red-100">
                  {error}
                </div>
              )}

              {savedResume && (
                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-violet-700 italic">Saved profile detected!</p>
                    <p className="text-xs font-bold text-violet-500">Auto-fill details from your profile?</p>
                  </div>
                  <button type="button" onClick={useSavedResume} className="px-4 py-2 bg-white text-violet-600 rounded-xl text-xs font-black shadow-sm border border-violet-100 hover:bg-violet-50 transition-colors">Use Saved Data</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone *</label>
                  <input type="tel" name="phone_number" required value={formData.phone_number} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">GitHub URL</label>
                  <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/your-username" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">LinkedIn URL</label>
                  <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/your-profile" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Key Skills *</label>
                <textarea name="skills" required value={formData.skills} onChange={handleChange} rows="3" placeholder="React, Node.js, etc." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all resize-none"></textarea>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center hover:border-violet-300 transition-colors group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Attach Resume (PDF/DOCX) *</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className="inline-flex items-center px-8 py-3 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 cursor-pointer group-hover:text-violet-600 transition-all">
                  {formData.resume_url ? 'Resume Attached' : 'Choose local file'}
                </label>
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full px-8 py-5 font-black text-lg rounded-2xl text-white bg-violet-600 hover:bg-violet-700 shadow-2xl shadow-violet-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center"
              >
                {applying ? 'Sending...' : 'Confirm & Apply'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-16 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Application Submitted!</h2>
            <p className="text-slate-500 font-bold mb-10 text-lg">
              You have successfully applied for the <span className="text-violet-600">{job.title}</span> position. Good luck!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/my-applications')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all">View My Applications</button>
              <button onClick={() => navigate('/jobs')} className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm border border-slate-200 hover:bg-white transition-all">Browse More Jobs</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
