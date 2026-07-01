import { handlers } from './auth'

export const { GET, POST } = handlers
export { auth, signIn, signOut } from './auth'
export { signUpSchema, loginSchema, refreshSchema, type SignUpInput, type LoginInput, type RefreshInput } from './schemas'
export { signOutAction } from './actions/sign-out'
// Client form + section components — safe re-exports (no `'server-only'` imports).
export { SignInClient } from './components/SignInClient'
export { SignUpClient } from './components/SignUpClient'
export { ForgotPasswordForm } from './components/ForgotPasswordForm'
export { ResetPasswordForm } from './components/ResetPasswordForm'
export { VerifiedOwnerBadge } from './components/VerifiedOwnerBadge'
export { ProfileForm } from './components/ProfileForm'
export { PasswordSection } from './components/PasswordSection'
export { OAuthConnectionsSection } from './components/OAuthConnectionsSection'
export { DeleteAccountSection } from './components/DeleteAccountSection'
export { LoginEventsSection } from './components/LoginEventsSection'
export { NotificationsSection } from './components/NotificationsSection'
export { ResendVerificationButton } from './components/ResendVerificationButton'
export { DataExportSection } from './components/DataExportSection'
export { VerifiedSuccessToast } from './components/VerifiedSuccessToast'
export { SignInReasonToast } from './components/SignInReasonToast'
export { DashboardReasonToast } from './components/DashboardReasonToast'
export { AuthBroadcastListener } from './components/AuthBroadcastListener'
export { broadcastAuthChange } from './lib/broadcast'
export { TwoFactorSection } from './components/TwoFactorSection'
export { CinUploadForm } from './components/CinUploadForm'
export {
  updateNotifPrefsAction,
  type UpdateNotifPrefsActionState,
} from './actions/update-notif-prefs'
export { NotifPrefToggle } from './components/NotifPrefToggle'
export {
  deleteAccountAction,
  cancelAccountDeletionAction,
} from './actions/delete-account'
export { PendingDeletionBanner } from './components/PendingDeletionBanner'
