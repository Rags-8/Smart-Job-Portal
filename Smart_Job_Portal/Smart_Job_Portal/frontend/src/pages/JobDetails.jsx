import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, Building, CheckCircle, Clock, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'

const extractSkills = (rawSkills) => {
  if (Array.isArray(rawSkills)) return rawSkills.join(', ')
  if (typeof rawSkills === 'string') return rawSkills
  if (rawSkills && typeof rawSkills === 'object') {
    return Object.values(rawSkills).flat().filter(Boolean).join(', ')
  }
  return ''
}

const getPersonalInfo = (resumeData) => {
  return resumeData?.personal || resumeData?.personalInfo || {}
}

export function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [savedResumes, setSavedResumes] = useState([])
  const [selectedSavedResume, setSelectedSavedResume] = useState(null)
  const [showResumeSelector, setShowResumeSelector] = useState(false)
  const [applying, setApplying] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const selectorRef = useRef(null)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone_number: '',
    linkedin_url: '',
    github_url: '',
    skills: '',
    resume_url: null,
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setShowResumeSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await api.get(`/jobs`)
        const foundJob = response.data.find(j => String(j.id) === String(id))
        if (foundJob) {
          setJob(foundJob)


        } else {
          setError('Job not found')
        }

        if (user && user.role === 'user') {
          try {
            const resData = await api.get('/resumes')
            const resumes = Array.isArray(resData.data) ? resData.data : []
            setSavedResumes(resumes)
            if (resumes.length > 0) {
              const latest = resumes[0]
              const rData = latest.resume_data || {}
              const pInfo = getPersonalInfo(rData)

              setSelectedSavedResume(latest)
              const skillsStr = extractSkills(rData.skills)
              const resumeName = pInfo.fullName || user?.name || 'My Resume'

              setFormData(prev => ({
                ...prev,
                email: pInfo.email || prev.email,
                phone_number: pInfo.phone || prev.phone_number,
                linkedin_url: pInfo.linkedin || prev.linkedin_url,
                github_url: pInfo.github || prev.github_url,
                skills: skillsStr,
                resume_url: `saved:${latest.id}:${resumeName}`,
              }))
            }
          } catch (e) {
            console.log('No saved resumes found')
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
    const file = e.target.files[0]
    if (file) {
      setPendingFile(file)
      setSelectedFileName(file.name)
      setSelectedSavedResume(null)
      // Store just the filename as resume_url for the payload; actual file upload handled via form
      setFormData(prev => ({ ...prev, resume_url: `file:${file.name}` }))
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const selectSavedResume = (resume) => {
    const rData = resume.resume_data || {}
    const pInfo = getPersonalInfo(rData)
    const skillsStr = extractSkills(rData.skills)
    const resumeName = pInfo.fullName || user?.name || 'My Resume'

    setSelectedSavedResume(resume)
    setFormData(prev => ({
      ...prev,
      email: pInfo.email || prev.email,
      phone_number: pInfo.phone || prev.phone_number,
      linkedin_url: pInfo.linkedin || prev.linkedin_url,
      github_url: pInfo.github || prev.github_url,
      skills: skillsStr,
      resume_url: `saved:${resume.id}:${resumeName}`,
    }))
    setSelectedFileName(null)
    setShowResumeSelector(false)

  }

  const clearSelectedResume = () => {
    setFormData(prev => ({ ...prev, resume_url: null }))
    setSelectedSavedResume(null)
    setSelectedFileName(null)
  }

  const isSavedResumeSelected =
    formData.resume_url && formData.resume_url.startsWith('saved:')
  const isLocalFileSelected =
    formData.resume_url && formData.resume_url.startsWith('file:')

  const getDisplayName = () => {
    if (isSavedResumeSelected) {
      const parts = formData.resume_url.split(':')
      return parts.slice(2).join(':') || 'Saved Resume'
    }
    return selectedFileName || ''
  }

  const handlePreview = () => {
    if (isSavedResumeSelected && selectedSavedResume) {
      window.open(`/resume-builder/${selectedSavedResume.id}?preview=true`, '_blank')
    } else if (isLocalFileSelected && pendingFile) {
      const fileURL = URL.createObjectURL(pendingFile)
      window.open(fileURL, '_blank')
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user || user.role !== 'user') {
      setError('You must be logged in as a Job Seeker to apply.')
      return
    }
    if (!formData.resume_url) {
      setError('Please select a resume — choose a saved resume or upload a local file.')
      return
    }
    if (!formData.phone_number) {
      setError('Please enter your phone number.')
      return
    }

    setApplying(true)
    setError(null)

    try {
      let resumeContent = ''
      if (isSavedResumeSelected && selectedSavedResume) {
        const rd = selectedSavedResume.resume_data || {}
        const pInfo = getPersonalInfo(rd)

        // Robust formatting for skills and experience
        const skillsText = Array.isArray(rd.skills) ? rd.skills.join(', ') : (typeof rd.skills === 'string' ? rd.skills : '')
        const expItems = Array.isArray(rd.experience) ? rd.experience : []

        resumeContent = `RESUME PROFILE\n==============\nNAME: ${pInfo.fullName || user.name}\nEMAIL: ${pInfo.email || user.email}\nSUMMARY: ${pInfo.summary || 'N/A'}\n\nSKILLS: ${skillsText}\n\nEXPERIENCE:\n${expItems.map(exp => `- ${exp.title} at ${exp.company} (${exp.duration || 'N/A'})\n  ${exp.description || ''}`).join('\n\n')}`
      } else if (isLocalFileSelected && pendingFile) {
        // Convert file to Data URL
        const reader = new FileReader()
        const filePromise = new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = (e) => reject(e)
        })
        reader.readAsDataURL(pendingFile)
        resumeContent = await filePromise
      } else {
        resumeContent = 'Selected Resume Label: ' + getDisplayName()
      }

      const payload = {
        full_name: user?.name || 'Applicant',
        email: formData.email,
        phone_number: formData.phone_number,
        skills: formData.skills || 'Not specified',
        experience: job?.experience_required || '0',
        resume_url: resumeContent,
        github_url: formData.github_url || '',
        linkedin_url: formData.linkedin_url || '',
      }

      await api.post(`/applications/${id}`, payload)
      setStep(3)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || err.message || 'Failed to submit application')
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

                {(job.requirements || job.benefits) && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
                    {job.requirements && (
                      <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-900 border-b-4 border-violet-100 inline-block pb-1 mb-6 uppercase tracking-tight">Requirements</h2>
                        <div className="text-slate-600 leading-relaxed font-bold whitespace-pre-wrap text-sm">{job.requirements}</div>
                      </div>
                    )}
                    {job.benefits && (
                      <div>
                        <h2 className="text-xl font-black text-slate-900 border-b-4 border-violet-100 inline-block pb-1 mb-6 uppercase tracking-tight">Perks & Benefits</h2>
                        <div className="text-slate-600 leading-relaxed font-bold whitespace-pre-wrap text-sm">{job.benefits}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
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
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{job.company_description}"</p>
                    </div>
                  )}
                </div>

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

            {/* Footer Apply CTA */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 p-8 sm:p-12 mb-20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex-1 w-full lg:w-auto">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Apply with saved resume</p>

                  {/* Resume selector card */}
                  <div className="relative" ref={selectorRef}>
                    <div
                      onClick={() => savedResumes.length > 0 && setShowResumeSelector(prev => !prev)}
                      className={`flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border transition-all group/res ${savedResumes.length > 0 ? 'cursor-pointer hover:bg-white hover:border-blue-200 border-gray-100' : 'border-gray-100 opacity-60'}`}
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover/res:scale-110 flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {selectedSavedResume
                            ? (selectedSavedResume.resume_data?.personalInfo?.fullName || user?.name || 'My Resume') + ' — Saved Resume'
                            : savedResumes.length > 0 ? 'Select a Saved Resume' : 'No saved resumes'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {savedResumes.length > 0 ? `${savedResumes.length} resume${savedResumes.length > 1 ? 's' : ''} available — click to choose` : 'Build a resume first'}
                        </span>
                      </div>
                      {savedResumes.length > 0 && (
                        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${showResumeSelector ? 'rotate-180' : ''}`} />
                      )}
                    </div>

                    {/* Dropdown list */}
                    {showResumeSelector && savedResumes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Saved Resumes</p>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {savedResumes.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => selectSavedResume(r)}
                              className={`px-4 py-3 cursor-pointer hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group/item ${selectedSavedResume?.id === r.id ? 'bg-violet-50/60' : ''}`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-slate-900 group-hover/item:text-violet-600 transition-colors truncate">
                                  {r.resume_data?.personalInfo?.fullName || user?.name || 'My Resume'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400">
                                  {r.resume_data?.personalInfo?.jobTitle || 'Resume'} &bull; {new Date(r.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              {selectedSavedResume?.id === r.id && (
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">


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

              {/* Selected resume banner */}
              {selectedSavedResume && (
                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-violet-700 truncate">
                        {selectedSavedResume.resume_data?.personalInfo?.fullName || user?.name}
                      </p>
                      <p className="text-[10px] font-bold text-violet-400">
                        {selectedSavedResume.resume_data?.personalInfo?.jobTitle || 'Saved Resume'} — auto-filled
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-1.5 bg-white text-violet-600 rounded-xl text-[10px] font-black shadow-sm border border-violet-100 hover:bg-violet-50 transition-colors flex-shrink-0"
                  >
                    Change
                  </button>
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
                <textarea name="skills" required value={formData.skills} onChange={handleChange} rows="3" placeholder="React, Node.js, Python..." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-4 focus:ring-violet-100 transition-all resize-none"></textarea>
              </div>

              {/* Resume attachment area */}
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center hover:border-violet-300 transition-colors group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Attach Resume (PDF/DOCX) *
                </label>

                {isSavedResumeSelected ? (
                  /* Saved resume selected — show card */
                  <div className="flex flex-col items-center gap-3">
                    <div
                      onClick={handlePreview}
                      className="flex items-center gap-3 px-6 py-4 bg-white shadow-xl shadow-slate-200/50 border border-violet-100 rounded-2xl cursor-pointer hover:border-violet-500 hover:bg-violet-50/50 group/preview transition-all"
                      title="Click to Preview Resume"
                    >
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 group-hover/preview:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 group-hover/preview:text-violet-700 transition-colors">{getDisplayName()}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">✓ Auto-selected — Click to verify</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={clearSelectedResume}
                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                      >
                        ✕ Replace with local file
                      </button>
                      {savedResumes.length > 1 && (
                        <>
                          <span className="text-slate-200 font-bold">|</span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-[10px] font-black text-violet-400 hover:text-violet-600 uppercase tracking-widest transition-colors"
                          >
                            ↺ Choose other saved
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : isLocalFileSelected ? (
                  /* Local file selected */
                  <div className="flex flex-col items-center gap-3">
                    <div
                      onClick={handlePreview}
                      className="flex items-center gap-3 px-6 py-4 bg-white shadow-xl shadow-slate-200/50 border border-blue-100 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 group/preview transition-all"
                      title="Click to Preview Uploaded File"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover/preview:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 max-w-[200px] truncate group-hover/preview:text-blue-700 transition-colors">{selectedFileName}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">✓ Local file — Click to verify</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedResume}
                      className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      ✕ Remove file
                    </button>
                  </div>
                ) : (
                  /* Nothing selected */
                  <>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="resume-upload" />
                    <label htmlFor="resume-upload" className="inline-flex items-center px-8 py-3 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 cursor-pointer group-hover:text-violet-600 transition-all">
                      Choose local file
                    </label>
                    {savedResumes.length > 0 && (
                      <p className="mt-3 text-[10px] font-bold text-slate-400">or go back to select a saved resume</p>
                    )}
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full px-8 py-5 font-black text-lg rounded-2xl text-white bg-violet-600 hover:bg-violet-700 shadow-2xl shadow-violet-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : 'Confirm & Apply'}
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
