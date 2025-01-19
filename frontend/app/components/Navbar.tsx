'use client'

import { useAuth } from '../../contexts/AuthContext'

interface NavbarProps {
  onSigningOut?: (isSigningOut: boolean) => void
}

export default function Navbar({ onSigningOut }: NavbarProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    if (onSigningOut) {
      onSigningOut(true);
    }
    await signOut();
  };

  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              Kairos
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-300">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 