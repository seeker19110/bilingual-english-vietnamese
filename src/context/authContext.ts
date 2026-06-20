import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>  // gọi sau khi login/logout để cập nhật lại
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
})
