import { useContext } from 'react'
import { AuthContext } from './authContext'

// Hook tiện lợi: const { user, loading, refresh } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
