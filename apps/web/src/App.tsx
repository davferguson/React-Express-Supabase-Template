import { useEffect, useState } from 'react'
// Removed local CSS in favor of Tailwind utility classes
import { supabase } from './lib/supabaseClient'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [apiResult, setApiResult] = useState<string>('')

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const callProfile = async () => {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
    setApiResult(await res.text())
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">React + Supabase + Express Template</h1>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500" onClick={signIn}>
          Sign In
        </button>
        <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-300" onClick={signOut}>
          Sign Out
        </button>
      </div>
      <div className="text-sm text-gray-700">Session: {userEmail ?? 'none'}</div>
      <div className="mt-3">
        <button className="border px-4 py-2 rounded hover:bg-gray-50" onClick={callProfile}>
          Call /api/profile
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap border rounded p-3 bg-gray-50 text-gray-800">{apiResult}</pre>
    </div>
  )
}

export default App
