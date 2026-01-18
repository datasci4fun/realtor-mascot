export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'agent'
  phone?: string | null
  avatarUrl?: string | null
  isActive: boolean
  createdAt: string
  lastLogin: string | null
}

export interface UserFilters {
  role?: 'admin' | 'agent'
  isActive?: boolean
  search?: string
}

export interface CreateUserInput {
  email: string
  password: string
  name?: string
  role?: 'admin' | 'agent'
  phone?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: 'admin' | 'agent'
  phone?: string
  isActive?: boolean
  password?: string
}

export interface UserInvitation {
  id: string
  email: string
  token: string
  role: 'admin' | 'agent'
  invitedBy: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
}
