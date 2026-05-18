export { signUpSchema, type SignUpInput } from './sign-up'
export { loginSchema, type LoginInput } from './login'
export { refreshSchema, type RefreshInput } from './refresh'
export { forgotPasswordSchema, type ForgotPasswordInput } from './forgot-password'
export { resetPasswordSchema, type ResetPasswordInput } from './reset-password'
export { updateProfileSchema, type UpdateProfileInput } from './update-profile'
export {
  setPasswordSchema,
  changePasswordSchema,
  type SetPasswordInput,
  type ChangePasswordInput,
} from './set-password'
export { deleteAccountSchema, type DeleteAccountInput } from './delete-account'
export { oauthProviderSchema, type OAuthProvider } from './unlink-oauth'
export {
  avatarFileSchema,
  parseAvatarFile,
  AVATAR_MAX_BYTES,
  AVATAR_ACCEPTED_TYPES,
  type AvatarFileInput,
} from './avatar'
export {
  cinFileSchema,
  parseCinFile,
  CIN_MAX_BYTES,
  CIN_ACCEPTED_TYPES,
  type CinFileInput,
} from './cin'
export {
  listLoginEventsQuerySchema,
  type ListLoginEventsQuery,
} from './list-login-events'
export {
  loginAuthMethodSchema,
  recordLoginInputSchema,
  type RecordLoginPayload,
} from './record-login-event'
