import { AuthRepository } from '../../domain/context/AuthRepository'

export const loginUser = async (credentials) => AuthRepository.login(credentials)
