'use client'

import { useAuth } from '../../contexts/AuthContext'

interface NavbarProps {
  onReset?: () => void
}

export default function Navbar({ onReset }: NavbarProps) {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Task Planner</div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-gray-300">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            </>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </nav>
  )
} 