import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const useLocalAuth = import.meta.env.VITE_USE_LOCAL_AUTH === 'true'
    const apiUrl = import.meta.env.VITE_API_URL || ''

    useEffect(() => {
        let mounted = true

        async function initLocal() {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    if (mounted) setLoading(false)
                    return
                }
                const res = await fetch(`${apiUrl}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) {
                    localStorage.removeItem('token')
                    if (mounted) setLoading(false)
                    return
                }
                const json = await res.json()
                if (!mounted) return
                setSession({ token })
                setUser(json.user)
                setProfile(json.user)
            } catch (err) {
                console.error('Local auth init error:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        async function initSupabase() {
            try {
                const res = await supabase.auth.getSession()
                const sess = res?.data?.session ?? null
                if (!mounted) return
                setSession(sess)
                setUser(sess?.user ?? null)
                if (sess?.user) {
                    await fetchProfile(sess.user.id)
                }
            } catch (err) {
                console.error('Error getting session from Supabase:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (useLocalAuth) {
            initLocal()
            return () => { mounted = false }
        }

        initSupabase()

        const onAuth = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        const subscription = onAuth?.data?.subscription

        return () => {
            mounted = false
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe()
            }
        }
    }, [])

    const fetchProfile = async (userId) => {
        if (useLocalAuth) {
            // For local auth, profile is part of the user object returned by /auth/me
            setLoading(false)
            return
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error fetching profile:', error)
            }
            setProfile(data)
        } catch (err) {
            console.error('fetchProfile error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Will be passed down to Signup, Login and Logout components
    const loginLocal = (userData, token) => {
        localStorage.setItem('token', token)
        setUser(userData)
        setProfile(userData)
        setSession({ token })
    }

    const value = {
        session,
        user,
        profile,
        signOut: () => {
            if (useLocalAuth) {
                localStorage.removeItem('token')
                setUser(null)
                setProfile(null)
                setSession(null)
                return Promise.resolve()
            }
            return supabase.auth.signOut()
        },
        refreshProfile: () => user && fetchProfile(user.id),
        loginLocal
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-500">Loading...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
