import type { getErrorPageCountdown } from "@/components/blocks/error-pages"
import type { badgeVariants } from "@/components/ui/badge"
import type { buttonVariants } from "@/components/ui/button"
import type { emptyStateVariants, iconContainerVariants } from "@/components/ui/empty-state"
import type { statCardVariants } from "@/components/ui/statcard"
import type { timelineConnectorVariants, timelineDotVariants } from "@/components/ui/timeline"
import type { Prisma, PrismaClient } from "@prisma/client/extension"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type {
  ConfirmationStateInput,
  VouchCountdownProps,
  VouchStatus,
  VouchStatusTone,
} from "./vouchTypes"

export type ID = string
export type PublicID = string
export type UserID = string
export type VouchID = string
export type ISODateTime = string
export type CurrencyCode = "usd"
export type MoneyCents = number
export type PercentageBasisPoints = number

export type Environment = "development" | "preview" | "production"
export type SortDirection = "asc" | "desc"
export type AsyncStatus = "idle" | "pending" | "success" | "error"
export type PageMode = "default" | "loading" | "error" | "empty" | "blocked" | "success"
export type DeviceVariant = "desktop" | "mobile"

export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface PaginationState {
  page: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

export interface DateRangeInput {
  from?: ISODateTime
  to?: ISODateTime
}

export interface SelectOption<TValue extends string = string> {
  value: TValue
  label: string
  disabled?: boolean
}

export interface FieldErrorState {
  field: string
  message: string
}

export interface ServerErrorState {
  code: string
  title: string
  message: string
  retryable: boolean
}

// Timeline Context
interface TimelineContextValue {
  orientation: "vertical" | "horizontal"
}

// Timeline Root
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "completed" | "current" | "upcoming"
}

export interface TimelineDotProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof timelineDotVariants> {}

export interface TimelineConnectorProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof timelineConnectorVariants>, "orientation"> {}

export interface StatCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "color">,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  progress?: { value: number; label?: string }
  comparison?: string
  /** @deprecated Use colorScheme instead */
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "destructive"
}

type ToasterProps = React.ComponentProps<typeof Sonner>

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to display in the marquee */
  children: React.ReactNode
  /** Direction of the marquee animation */
  direction?: "left" | "right"
  /** Speed of the animation: 'slow' | 'normal' | 'fast' */
  speed?: "slow" | "normal" | "fast"
  /** Pause animation on hover */
  pauseOnHover?: boolean
  /** Show neubrutalism border styling */
  bordered?: boolean
  /** Number of times to repeat the content (for seamless loop) */
  repeat?: number
}

interface MarqueeItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

interface MarqueeSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Separator character or element */
  children?: React.ReactNode
}

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {}

export interface EmptyStateIconProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof iconContainerVariants> {
  /** Custom icon size independent of container */
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl"
}

// ============================================================================
// Empty State Illustration (for custom SVGs/images)
// ============================================================================

export interface EmptyStateIllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width for the illustration */
  maxWidth?: string | number
}

// ============================================================================
// Empty State Title
// ============================================================================

export type EmptyStateTitleProps = React.HTMLAttributes<HTMLHeadingElement>

// ============================================================================
// Empty State Description
// ============================================================================

export type EmptyStateDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

// ============================================================================
// Empty State Actions
// ============================================================================

export type EmptyStateActionsProps = React.HTMLAttributes<HTMLDivElement>

// ============================================================================
// Presets
// ============================================================================

export type EmptyStatePresetType =
  | "no-results"
  | "no-data"
  | "empty-inbox"
  | "empty-folder"
  | "no-users"
  | "empty-cart"
  | "no-notifications"
  | "no-images"
  // New presets
  | "error"
  | "offline"
  | "permission-denied"
  | "coming-soon"
  | "maintenance"
  | "upload"

interface PresetConfig {
  icon: React.ReactNode
  title: string
  description: string
  iconColor?: VariantProps<typeof iconContainerVariants>["iconColor"]
}

export interface EmptyStatePresetProps
  extends
    Omit<EmptyStateProps, "children">,
    Omit<VariantProps<typeof iconContainerVariants>, "size"> {
  preset: EmptyStatePresetType
  action?: React.ReactNode
  customTitle?: string
  customDescription?: string
  /** Custom icon to override the preset icon */
  customIcon?: React.ReactNode
  /** Custom illustration (overrides icon completely) */
  illustration?: React.ReactNode
  /** Icon container size */
  iconSize?: VariantProps<typeof iconContainerVariants>["size"]
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export interface AlertActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows an inline spinner and disables the button automatically */
  loading?: boolean
}

export interface TenantShellProps {
  children: ReactNode
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  withMobileBottomNav?: boolean | undefined
}

type TenantProviderAction = (formData: FormData) => void | Promise<void>

export interface TenantHeaderNavItem {
  href: string
  label: string
}

export interface TenantHeaderProps {
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  navItems?: readonly TenantHeaderNavItem[] | undefined
}

export interface TenantFooterLink {
  label: string
  href: string
}

export interface TenantFooterProps {
  connectAction: TenantProviderAction
  paymentAction: TenantProviderAction
  links?: readonly TenantFooterLink[] | undefined
}

export interface PublicShellProps {
  children: ReactNode
  withMobileBottomNav?: boolean | undefined
}

export interface PublicHeaderNavItem {
  label: string
  href: string
}

export interface PublicHeaderProps {
  logo?: ReactNode | undefined
  navItems?: readonly PublicHeaderNavItem[] | undefined
}

export interface PublicFooterLink {
  label: string
  href: string
}

export interface PublicFooterProps {
  links?: readonly PublicFooterLink[] | undefined
}

type WarningCopy = {
  title: string
  consequence: string
  context: string
  finePrint: string
}

type BaseItem = {
  label: string
  icon: LucideIcon
  primary?: boolean
}

type LinkItem = BaseItem & {
  kind: "link"
  href: string
}

type ActionItem = BaseItem & {
  kind: "action"
  warning: WarningCopy
  action: (formData: FormData) => void | Promise<void>
}

type MobileBottomNavItem = LinkItem | ActionItem | AccountItem

type MobileBottomNavProps = {
  items: readonly MobileBottomNavItem[]
  "aria-label"?: string
}

type TenantMobileBottomNavProps = {
  connectAction: (formData: FormData) => void | Promise<void>
  paymentAction: (formData: FormData) => void | Promise<void>
}

export interface WordmarkProps {
  asImage?: boolean
}

export interface LogoLockupProps {
  className?: string
  iconClassName?: string
  textClassName?: string
}

export interface StatItem {
  value: string
  label: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

// ============================================================================
// STATS VARIANT 1: Simple Grid
// ============================================================================
export interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}

// ============================================================================
// STATS VARIANT 2: With Cards
// ============================================================================
export interface StatsCardsProps {
  title?: string
  subtitle?: string
  stats: StatItem[]
}

// ============================================================================
// STATS VARIANT 3: Split with Content
// ============================================================================
export interface StatsSplitProps {
  subtitle?: string
  title: string
  description: string
  stats: StatItem[]
  contentPosition?: "left" | "right"
}

// ============================================================================
// STATS VARIANT 4: Inline
// ============================================================================
export interface StatsInlineProps {
  stats: StatItem[]
}

// ============================================================================
// STATS VARIANT 5: With Icons
// ============================================================================
export interface StatWithIconItem extends StatItem {
  icon: React.ReactNode
}

export interface StatsWithIconsProps {
  stats: StatWithIconItem[]
}

// ============================================================================
// SETTINGS VARIANT 2: Notification Settings
// ============================================================================
export interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
}

export interface NotificationSettingsProps {
  notifications?: NotificationSetting[]
  onSave?: (settings: NotificationSetting[]) => void
}

// ============================================================================
// SETTINGS VARIANT 3: Security Settings
// ============================================================================
export interface SecuritySettingsProps {
  twoFactorEnabled?: boolean
  sessions?: Array<{
    id: string
    device: string
    location: string
    lastActive: string
    current?: boolean
  }>
  onChangePassword?: () => void
  onToggleTwoFactor?: (enabled: boolean) => void
  onRevokeSession?: (sessionId: string) => void
}

// ============================================================================
// SETTINGS VARIANT 4: Appearance Settings
// ============================================================================
export interface AppearanceSettingsProps {
  theme?: "light" | "dark" | "system"
  accentColor?: string
  onThemeChange?: (theme: "light" | "dark" | "system") => void
  onAccentColorChange?: (color: string) => void
}

// ============================================================================
// SETTINGS VARIANT 5: Danger Zone
// ============================================================================
export interface DangerZoneProps {
  onExportData?: () => void
  onDeactivate?: () => void
  onDelete?: () => void
}

// ============================================================================
// SETTINGS VARIANT 6: Full Settings Page
// ============================================================================
export interface SettingsPageProps {
  defaultTab?: string
}

// ============================================================================
// Process Panel VARIANT 1: Table with Icons
// ============================================================================

export interface ProcessPanelStep {
  number: string
  title: string
  body: string
  icon: LucideIcon
}

export interface ProcessPanelProps {
  title: string
  steps: readonly ProcessPanelStep[]
  footer?: string | undefined
  id?: string | undefined
}

// ============================================================================
// Process Panel VARIANT 2: Stacked Legal Rows
// ============================================================================
export interface ProcessPanelListItem {
  number: string
  title: string
  body: string
}

export interface ProcessPanelListProps {
  title: string
  items: readonly ProcessPanelListItem[]
  eyebrow?: string | undefined
  body?: string | undefined
  id?: string | undefined
}

// ============================================================================
// Process Panel VARIANT 3: Rule Grid
// ============================================================================
export interface ProcessPanelRuleItem {
  label: string
  value: string
}

export interface ProcessPanelRuleGridProps {
  title: string
  items: readonly ProcessPanelRuleItem[]
  footer?: string | undefined
  id?: string | undefined
}

// ============================================================================
// Process Panel VARIANT 4: Callout
// ============================================================================
export interface ProcessPanelCalloutProps {
  title: string
  body: string
  action: string
  icon: LucideIcon
  id?: string | undefined
}

// ============================================================================
// Process Panel VARIANT 5: Bordered Content Grid
// ============================================================================
export interface ProcessPanelGridItem {
  name: string
  logo: React.ReactNode
  detail?: string | undefined
  icon?: LucideIcon | undefined
}

export interface ProcessPanelGridProps {
  title?: string | undefined
  subtitle?: string | undefined
  logos: readonly ProcessPanelGridItem[]
  footer?: string | undefined
}

export interface OnboardingStep {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  content: React.ReactNode
  optional?: boolean
}

export interface OnboardingWizardProps {
  steps: OnboardingStep[]
  currentStep: number
  onStepChange: (stepIndex: number) => void
  onComplete?: () => void
  showProgress?: boolean
}

export interface WelcomeScreenProps {
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  features?: Array<{ icon: React.ReactNode; title: string; description: string }>
  primaryAction?: { label: string; onClick?: () => void }
  secondaryAction?: { label: string; onClick?: () => void }
}

export interface WorkspaceSetupProps {
  title?: string
  description?: string
  workspaceName: string
  memberEmail: string
  members: string[]
  onWorkspaceNameChange: (name: string) => void
  onMemberEmailChange: (email: string) => void
  onAddMember: () => void
  onRemoveMember: (email: string) => void
  onSubmit?: () => void
  onSkip?: () => void
}

export interface GoalSelectionProps {
  goals: Array<{ id: string; title: string; description: string; icon: React.ReactNode }>
  selectedGoals: string[]
  onGoalToggle: (goalId: string) => void
  onSubmit?: () => void
  minSelection?: number
  maxSelection?: number
}

export interface CompletionScreenProps {
  title?: string
  subtitle?: string
  features?: Array<{ title: string; description: string }>
  primaryAction?: { label: string; onClick?: () => void }
}

// ============================================================================
// Common Types
// ============================================================================
export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  unitPriceLabel?: string
  total?: number
  totalLabel?: string
}

export interface InvoiceAddress {
  name: string
  company?: string
  address: string
  city: string
  state?: string
  zip: string
  country?: string
  email?: string
  phone?: string
}

export interface InvoiceData {
  title?: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status?: "paid" | "pending" | "overdue" | string
  from: InvoiceAddress
  to: InvoiceAddress
  items: InvoiceItem[]
  subtotal: number
  tax?: { label: string; rate: number; amount: number }
  discount?: { label: string; amount: number }
  total: number
  notes?: string
  terms?: string
  details?: Array<{ label: string; value: string }>
  actions?: React.ReactNode
  paymentInfo?: {
    bankName?: string
    accountNumber?: string
    routingNumber?: string
    paymentMethods?: string[]
  }
}

// ============================================================================
// INVOICE VARIANT 1: Full Invoice
// ============================================================================
export interface InvoiceProps {
  data: InvoiceData
  logo?: React.ReactNode
  onDownload?: () => void
  onPrint?: () => void
  onSendEmail?: () => void
}

// ============================================================================
// INVOICE VARIANT 2: Compact Receipt
// ============================================================================
export interface ReceiptData {
  receiptNumber: string
  date: string
  merchant: {
    name: string
    address?: string
    phone?: string
  }
  items: Array<{
    name: string
    quantity?: number
    price: number
  }>
  subtotal: number
  tax?: number
  total: number
  paymentMethod?: string
  cardLast4?: string
}

export interface ReceiptProps {
  data: ReceiptData
  logo?: React.ReactNode
  onDownload?: () => void
}

// ============================================================================
// INVOICE VARIANT 3: Invoice Summary Card
// ============================================================================
export interface InvoiceSummaryProps {
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  amount: number
  amountLabel?: string
  status: string
  statusTone?: VouchStatusTone
  href: string
  vouchId?: string
  appointmentLabel?: string
  confirmationWindowLabel?: string
  protectedAmountLabel?: string
  countdown?: VouchCountdownProps | undefined
  label: string
  expiresAtLabel: string
  remainingLabel: string
  percentRemaining?: number
  tone?: VouchStatusTone
  onView?: () => void
  onDownload?: () => void
}

// ============================================================================
// INVOICE VARIANT 4: Invoice List
// ============================================================================
export interface InvoiceListItem {
  id: string
  invoiceNumber: string
  clientName: string
  date: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

export interface InvoiceListProps {
  invoices: InvoiceListItem[]
  onView?: (id: string) => void
  onDownload?: (id: string) => void
}

// ============================================================================
// HERO VARIANT 1: Centered
// ============================================================================
export interface HeroCenteredProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  align?: "center" | "left"
}

// ============================================================================
// HERO VARIANT 2: Split with Image
// ============================================================================
export interface HeroSplitProps {
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  imageSrc: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}

// ============================================================================
// HERO VARIANT 2 Duplicate: Split with Process Panel
// ============================================================================
export interface HeroSplitPanelProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }

  panelTitle: string
  panelSteps: readonly {
    number: string
    title: string
    body: string
    icon: LucideIcon
  }[]
  panelFooter?: string | undefined
  panelId?: string | undefined

  panelPosition?: "left" | "right"
}

// ============================================================================
// HERO VARIANT 3: With Stats
// ============================================================================
export interface HeroWithStatsProps {
  subtitle?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  stats: Array<{ value: string; label: string; body?: string }>
  align?: "center" | "left"
}

// ============================================================================
// HERO VARIANT 4: Minimal
// ============================================================================
export interface HeroMinimalProps {
  title: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
}

// ============================================================================
// HERO VARIANT 5: With Video
// ============================================================================
export interface HeroWithVideoProps {
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  videoThumbnail: string
  onPlayClick?: () => void
}

// ============================================================================
// FEATURE GRID VARIANT 1: With Icons
// ============================================================================
export interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

export interface FeatureGridWithIconsProps {
  title?: string
  subtitle?: string
  description?: string
  features: FeatureItem[]
  columns?: 2 | 3 | 4
}

// ============================================================================
// FEATURE GRID VARIANT 2: With Images
// ============================================================================
export interface FeatureWithImageItem {
  image: string
  title: string
  description: string
}

export interface FeatureGridWithImagesProps {
  title?: string
  subtitle?: string
  features: FeatureWithImageItem[]
}

// ============================================================================
// FEATURE GRID VARIANT 3: Alternating
// ============================================================================
export interface FeatureAlternatingItem {
  icon: React.ReactNode
  title: string
  description: string
  image?: string
}

export interface FeatureGridAlternatingProps {
  features: FeatureAlternatingItem[]
}

// ============================================================================
// FEATURE GRID VARIANT 4: Bento Grid
// ============================================================================
export interface BentoFeatureItem {
  icon: React.ReactNode
  title: string
  description: string
  span?: "normal" | "wide" | "tall"
}

export interface FeatureBentoGridProps {
  title?: string
  subtitle?: string
  features: BentoFeatureItem[]
  align?: "center" | "left"
}

export interface FAQItem {
  question: string
  answer: string
}

// ============================================================================
// FAQ VARIANT 1: Simple Accordion
// ============================================================================
export interface FAQAccordionProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

// ============================================================================
// FAQ VARIANT 2: Two Columns
// ============================================================================
export interface FAQTwoColumnsProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

// ============================================================================
// FAQ VARIANT 3: With Categories
// ============================================================================
export interface FAQCategory {
  name: string
  items: FAQItem[]
}

export interface FAQWithCategoriesProps {
  title?: string
  subtitle?: string
  description?: string
  categories: FAQCategory[]
  activeCategory?: number
  onCategoryChange?: (categoryIndex: number) => void
}

// ============================================================================
// FAQ VARIANT 4: With Contact CTA
// ============================================================================
export interface FAQWithContactProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
  contactTitle?: string
  contactDescription?: string
  contactAction?: { label: string; onClick?: () => void }
}

// ============================================================================
// FAQ VARIANT 5: Simple List
// ============================================================================
export interface FAQSimpleListProps {
  title?: string
  subtitle?: string
  description?: string
  items: FAQItem[]
}

// ============================================================================
// ERROR PAGE VARIANT 1: 404 Not Found
// ============================================================================
export interface NotFoundPageProps {
  title?: string
  description?: string
  showSearch?: boolean
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  onSearch?: (query: string) => void
  homeHref?: string
  backHref?: string
}

// ============================================================================
// ERROR PAGE VARIANT 2: 500 Server Error
// ============================================================================
export interface ServerErrorPageProps {
  title?: string
  description?: string
  errorId?: string
  onRetry?: () => void
  homeHref?: string
  supportEmail?: string
}

// ============================================================================
// ERROR PAGE VARIANT 3: Maintenance Page
// ============================================================================
export interface MaintenancePageProps {
  title?: string
  description?: string
  estimatedTime?: string
  features?: string[]
  statusPageUrl?: string
}

// ============================================================================
// ERROR PAGE VARIANT 4: Offline Page
// ============================================================================
export interface OfflinePageProps {
  title?: string
  description?: string
  onRetry?: () => void
}

// ============================================================================
// ERROR PAGE VARIANT 5: 403 Forbidden
// ============================================================================
export interface ForbiddenPageProps {
  title?: string
  description?: string
  homeHref?: string
  loginHref?: string
}

export interface ComingSoonPageProps {
  title?: string
  description?: string
  launchDate?: Date
  onNotify?: (email: string) => void
  email?: string
  onEmailChange?: (email: string) => void
  submitted?: boolean
  timeRemaining?: ReturnType<typeof getErrorPageCountdown>
}

// ============================================================================
export interface GenericErrorPageProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "outline"
  }>
}

export interface CTAAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface CTASimpleProps {
  title: string
  description?: string
  primaryAction: CTAAction
  secondaryAction?: CTAAction
}

export interface CTAWithBackgroundProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryAction: CTAAction
  backgroundColor?: "primary" | "secondary" | "accent" | "muted"
}

export interface CTANewsletterProps {
  title: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  email: string
  onEmailChange: (email: string) => void
  onSubmit?: () => void
}

export interface CTASplitProps {
  title: string
  description?: string
  primaryAction: CTAAction
  secondaryAction?: CTAAction
  imageSrc: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}

export interface CTABannerProps {
  text: string
  action: CTAAction
  dismissible?: boolean
  isVisible?: boolean
  onDismiss?: () => void
  variant?: "primary" | "secondary" | "accent" | "warning"
}

// ============================================================================
// AUTH VARIANT 3: Forgot Password Form
// ============================================================================
export interface ForgotPasswordFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  onSubmit?: (email: string) => void
  onBackToLogin?: () => void
}

// ============================================================================
// AUTH VARIANT 4: OTP Verification Form
// ============================================================================
export interface OTPVerificationFormProps {
  logo?: React.ReactNode
  title?: string
  description?: string
  email?: string
  length?: number
  value?: string
  notice?: React.ReactNode
  error?: string | undefined
  rootError?: React.ReactNode
  disabled?: boolean
  submitLabel?: string
  resendLabel?: string
  backLabel?: string
  onChange?: (otp: string) => void
  onSubmit?: (otp: string) => void
  onResend?: () => void
  onBackToLogin?: () => void
  isSubmitting?: boolean
  isResending?: boolean
  isResetting?: boolean
  actions?: React.ReactNode
}

export type DeriveDetailVariantInput = ConfirmationStateInput & {
  status: VouchStatus
}

type ParticipantRole = "merchant" | "customer"

type StatusFilterInput = {
  userId?: string
  status?: VouchStatus
  page?: number
  pageSize?: number
}

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type FieldErrorsSource = {
  flatten(): { fieldErrors: Record<string, string[]> }
}

type ProviderRedirectResult = {
  redirectTo: string
  clientSecret?: string | null
}

type ReadinessResult = {
  userId: string
  readiness: "not_started" | "requires_action" | "ready" | "restricted" | "failed"
}
