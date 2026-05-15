import { handlers } from './auth'

export const { GET, POST } = handlers
export { auth, signIn, signOut } from './auth'
export { signUpSchema, loginSchema, refreshSchema, type SignUpInput, type LoginInput, type RefreshInput } from './schemas'
export { signOutAction } from './actions/sign-out'
