import { loginUser } from '../../infrastructure/api/authApi'

export const AuthRepository = {
  login: async (credentials) => loginUser(credentials),
}
