type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

type RootLayoutProps = {
  children: React.ReactNode
}

type LogoLockupProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
}

type WordmarkProps = {
  asImage?: boolean
}

type AuthShellProps = { children: React.ReactNode }
type PublicShellProps = { children: React.ReactNode; withMobileBottomNav?: boolean }
type TenantStripeAction = ((formData: FormData) => void | Promise<void>) | undefined
type TenantShellProps = {
  children: React.ReactNode
  connectAction?: TenantStripeAction
  withMobileBottomNav?: boolean
}

type PublicHeaderNavItem = { label: string; href: string }
type PublicHeaderProps = {
  logo?: React.ReactNode
  navItems?: readonly PublicHeaderNavItem[]
  items?: readonly PublicHeaderNavItem[]
}
type PublicFooterLink = { label: string; href: string }
type PublicFooterProps = { links?: readonly PublicFooterLink[] }

type TenantHeaderNavItem = { label: string; href: string }
type TenantHeaderProps = {
  navItems?: readonly TenantHeaderNavItem[]
  items?: readonly TenantHeaderNavItem[]
  connectAction?: TenantStripeAction
}
type TenantFooterLink = { label: string; href: string }
type TenantFooterProps = {
  links?: readonly TenantFooterLink[]
  connectAction?: TenantStripeAction
}
type MobileBottomNavWarning = {
  title: string
  consequence: string
  context: string
  finePrint: string
}
type MobileBottomNavItem = {
  label: string
  href?: string | undefined
  action?: TenantStripeAction
  icon?: React.ComponentType<{ className?: string }>
  kind?: "link" | "action" | "account"
  primary?: boolean
  warning?: MobileBottomNavWarning
}
type ActionItem = {
  label: string
  action?: TenantStripeAction
  icon?: React.ComponentType<{ className?: string }>
  primary?: boolean
  warning?: MobileBottomNavWarning
}
type MobileBottomNavProps = {
  items: readonly MobileBottomNavItem[]
  actions?: readonly ActionItem[]
  "aria-label"?: string
}
type TenantMobileBottomNavProps = {
  connectAction?: TenantStripeAction
}
type UserMenuProps = { size?: "default" | "sm" | "compact" }

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  import("class-variance-authority").VariantProps<
    typeof import("@/components/ui/button").buttonVariants
  > & {
    asChild?: boolean
  }
type BadgeProps = React.ComponentPropsWithoutRef<"span"> &
  import("class-variance-authority").VariantProps<
    typeof import("@/components/ui/badge").badgeVariants
  >
type AlertActionProps = React.ComponentPropsWithoutRef<"button"> & { loading?: boolean }
type SheetContentProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
}
type ToasterProps = React.ComponentPropsWithoutRef<"div">
type StatCardProps = React.ComponentPropsWithoutRef<"div"> & {
  label?: string
  title?: string
  value?: string
  description?: string
  variant?: "default" | "compact" | "large"
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "destructive"
  colorScheme?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "destructive"
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  progress?: { label?: string; value: number }
  comparison?: string
}

type TimelineStatus = "completed" | "current" | "upcoming"
type TimelineContextValue = { orientation: "vertical" | "horizontal" }
type TimelineProps = React.ComponentPropsWithoutRef<"div"> & {
  orientation?: TimelineContextValue["orientation"]
}
type TimelineItemProps = React.ComponentPropsWithoutRef<"div"> & { status?: TimelineStatus }
type TimelineDotProps = React.ComponentPropsWithoutRef<"div"> & {
  status?: TimelineStatus
  size?: "sm" | "md" | "lg"
}
type TimelineConnectorProps = React.ComponentPropsWithoutRef<"div"> & { status?: TimelineStatus }

type EmptyStatePresetType =
  | "no-results"
  | "no-data"
  | "empty-inbox"
  | "empty-folder"
  | "no-users"
  | "empty-cart"
  | "no-notifications"
  | "no-images"
  | "error"
  | "offline"
  | "permission-denied"
  | "coming-soon"
  | "maintenance"
  | "upload"
type PresetConfig = {
  title: string
  description: string
  icon?: React.ReactNode
  iconColor?: EmptyStateIconProps["iconColor"]
}
type EmptyStateProps = React.ComponentPropsWithoutRef<"div"> & {
  title?: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  variant?: "default" | "filled" | "card" | undefined
  size?: "compact" | "sm" | "md" | "lg" | undefined
  layout?: "vertical" | "horizontal" | undefined
  animation?: "none" | "fadeIn" | "bounce" | "scale" | undefined
}
type EmptyStateIconProps = React.ComponentPropsWithoutRef<"div"> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  iconColor?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "muted"
    | "destructive"
    | "warning"
    | "success"
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl"
}
type EmptyStateIllustrationProps = React.ComponentPropsWithoutRef<"div"> & { maxWidth?: string }
type EmptyStateTitleProps = React.ComponentPropsWithoutRef<"h2">
type EmptyStateDescriptionProps = React.ComponentPropsWithoutRef<"p">
type EmptyStateActionsProps = React.ComponentPropsWithoutRef<"div">
type EmptyStatePresetProps = EmptyStateProps & {
  preset: EmptyStatePresetType
  customTitle?: string
  customDescription?: string
  customIcon?: React.ReactNode
  illustration?: React.ReactNode
  action?: React.ReactNode
  iconColor?: EmptyStateIconProps["iconColor"]
  iconSize?: EmptyStateIconProps["size"]
}

type MarqueeProps = React.ComponentPropsWithoutRef<"div"> & {
  speed?: "slow" | "normal" | "fast"
  direction?: "left" | "right"
  pauseOnHover?: boolean
  bordered?: boolean
  repeat?: number
}
type MarqueeItemProps = React.ComponentPropsWithoutRef<"div">
type MarqueeSeparatorProps = React.ComponentPropsWithoutRef<"div">

type AuthAction = { label: string; href?: string; onClick?: () => void }
type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
  logo?: React.ReactNode
  title?: string
  description?: string
  notice?: string | null
  error?: string | null | undefined
  children?: React.ReactNode
  footer?: React.ReactNode
  signUpHref?: string
  signUpPrompt?: string
  signUpLabel?: string
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: string[]
  emailInputProps?: React.ComponentPropsWithoutRef<"input">
  passwordInputProps?: React.ComponentPropsWithoutRef<"input">
  emailError?: string | undefined
  passwordError?: string | undefined
  passwordDescription?: string
  disabled?: boolean
  isSubmitting?: boolean
  submitLabel?: string
}
type SignUpFormProps = LoginFormProps & {
  signInHref?: string
  signInPrompt?: string
  signInLabel?: string
  onSignIn?: () => void
  termsUrl?: string
  privacyUrl?: string
  firstNameInputProps?: React.ComponentPropsWithoutRef<"input">
  lastNameInputProps?: React.ComponentPropsWithoutRef<"input">
  firstNameError?: string | undefined
  lastNameError?: string | undefined
  agreementError?: string | undefined
  agreementChecked?: boolean | undefined
  agreementLabel?: React.ReactNode
  onAgreementChange?: (checked: boolean) => void
  captcha?: React.ReactNode
}
type ForgotPasswordFormProps = {
  logo?: React.ReactNode
  title?: string
  description?: string
  onBackToLogin?: () => void
}
type OTPVerificationFormProps = {
  logo?: React.ReactNode
  title?: string
  description?: string
  email?: string
  length?: number
  value?: string
  notice?: string | null
  error?: string | undefined
  rootError?: string | undefined
  disabled?: boolean
  submitLabel?: string
  resendLabel?: string
  backLabel?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onResend?: () => void
  onBackToLogin?: () => void
  isSubmitting?: boolean
  isResending?: boolean
  isResetting?: boolean
  actions?: React.ReactNode
}
type AuthSplitLayoutProps = {
  children: React.ReactNode
  brandContent?: React.ReactNode
  position?: "left" | "right"
}

type FAQItem = { question: string; answer: string; category?: string }
type FAQCategory = { name: string; items: FAQItem[] }
type FAQAccordionProps = {
  title?: string
  subtitle?: string
  description?: string
  items: readonly FAQItem[]
}
type FAQTwoColumnsProps = FAQAccordionProps
type FAQWithCategoriesProps = Omit<FAQAccordionProps, "items"> & {
  categories: readonly FAQCategory[]
  items?: readonly FAQItem[]
  activeCategory?: number
  onCategoryChange?: (category: number) => void
}
type FAQWithContactProps = FAQAccordionProps & {
  contactTitle?: string
  contactDescription?: string
  contactAction?: CTAAction
}
type FAQSimpleListProps = { title?: string; subtitle?: string; items: readonly FAQItem[] }

type CTAAction = AuthAction
type CTASimpleProps = {
  title: string
  description?: string
  primaryAction?: CTAAction | undefined
  secondaryAction?: CTAAction | undefined
}
type CTAWithBackgroundProps = CTASimpleProps & {
  variant?: "primary" | "secondary" | "accent" | "muted"
  icon?: React.ReactNode
  backgroundColor?: "primary" | "secondary" | "accent" | "muted"
}
type CTANewsletterProps = CTASimpleProps & {
  placeholder?: string
  buttonLabel?: string
  email?: string
  onEmailChange?: (value: string) => void
  onSubmit?: () => void
}
type CTASplitProps = CTASimpleProps & {
  image?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}
type CTABannerProps = CTASimpleProps & {
  variant?: "primary" | "secondary" | "accent" | "warning"
  text?: string
  action?: CTAAction
  dismissible?: boolean
  isVisible?: boolean
  onDismiss?: () => void
}

type FeatureGridItem = {
  title: string
  description?: string
  icon?: React.ReactNode
  image?: string
  size?: "normal" | "wide" | "tall"
  span?: string
}
type FeatureGridWithIconsProps = {
  title?: string
  subtitle?: string
  description?: string
  features: readonly FeatureGridItem[]
  columns?: 2 | 3 | 4
}
type FeatureGridWithImagesProps = {
  title?: string
  subtitle?: string
  features: readonly FeatureGridItem[]
}
type FeatureGridAlternatingProps = { features: readonly FeatureGridItem[] }
type FeatureBentoGridProps = {
  title?: string
  subtitle?: string
  align?: "left" | "center"
  features: readonly FeatureGridItem[]
}

type HeroAction = AuthAction
type HeroCenteredProps = {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  align?: "left" | "center"
}
type HeroSplitProps = HeroCenteredProps & {
  imageSrc: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}
type HeroSplitPanelProps = HeroCenteredProps & {
  panelTitle: string
  panelSteps: Array<{
    number: string
    title: string
    body: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }>
  panelFooter?: string
  panelId?: string
  panelPosition?: "left" | "right"
}
type HeroWithStatsProps = HeroCenteredProps & {
  subtitle?: string
  stats: Array<{ label: string; value: string; body?: string }>
}
type HeroMinimalProps = { title: string; description?: string; primaryAction?: HeroAction }
type HeroWithVideoProps = HeroCenteredProps & { videoThumbnail: string; onPlayClick?: () => void }

type StatItem = {
  label: string
  value: string
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  body?: string
}
type StatsGridProps = { stats: StatItem[]; columns?: 2 | 3 | 4 }
type StatsCardsProps = { title?: string; subtitle?: string; stats: StatItem[] }
type StatsSplitProps = {
  subtitle?: string
  title: string
  description?: string
  stats: StatItem[]
  contentPosition?: "left" | "right"
}
type StatsInlineProps = { stats: StatItem[] }
type StatsWithIconsProps = { stats: StatItem[] }

type ProcessPanelStep = {
  number?: string
  label?: string
  value?: string
  title?: string
  body?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}
type ProcessPanelProps = {
  title?: string
  steps: readonly ProcessPanelStep[]
  footer?: string | React.ReactNode
  id?: string
}
type ProcessPanelListProps = {
  title?: string
  items: readonly ProcessPanelStep[]
  eyebrow?: string
  body?: string
  id?: string
}
type ProcessPanelRuleGridProps = {
  title?: string
  items: readonly ProcessPanelStep[]
  footer?: string | React.ReactNode
  id?: string
}
type ProcessPanelCalloutProps = {
  title?: string
  body?: string
  action?: React.ReactNode
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  id?: string
}
type ProcessPanelGridItem = { name: string; logo: React.ReactNode; detail?: string }
type ProcessPanelGridProps = {
  title?: string
  subtitle?: string
  logos: readonly ProcessPanelGridItem[]
  footer?: string
}

type OnboardingStep = {
  id: string
  title: string
  description?: string
  content?: React.ReactNode
  icon?: React.ReactNode
  optional?: boolean
  canContinue?: boolean
  actionLabel?: string
}
type OnboardingWizardProps = {
  steps: readonly OnboardingStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete?: () => void
  showProgress?: boolean
  disabled?: boolean
}
type OnboardingFeature = {
  title: string
  description?: string
  icon?: React.ReactNode
  [key: string]: unknown
}
type OnboardingAction = { label: string; onClick?: () => void }
type OnboardingOption = { value: string; label: string }
type WelcomeScreenProps = {
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  features?: readonly OnboardingFeature[]
  primaryAction?: OnboardingAction
  secondaryAction?: OnboardingAction
  onGetStarted?: () => void
}
type ProfileSetupProps = {
  name?: string
  role?: string
  interests: readonly string[]
  avatarPreview?: string
  avatarError?: string
  availableRoles?: readonly OnboardingOption[]
  availableInterests?: readonly OnboardingOption[]
  onNameChange: (value: string) => void
  onRoleChange: (value: string) => void
  onInterestToggle: (value: string) => void
  onAvatarInputClick?: () => void
  onAvatarChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: () => void
}
type WorkspaceSetupProps = {
  title?: string
  description?: string
  workspaceName?: string
  memberEmail?: string
  members: readonly string[]
  onWorkspaceNameChange: (value: string) => void
  onMemberEmailChange: (value: string) => void
  onAddMember: () => void
  onRemoveMember: (email: string) => void
  onSubmit?: () => void
  onSkip?: () => void
}
type GoalSelectionProps = {
  goals: readonly { id: string; title: string; description?: string; icon?: React.ReactNode }[]
  selectedGoals: readonly string[]
  onGoalToggle: (goal: string) => void
  onToggleGoal?: (goal: string) => void
  onSubmit?: () => void
  onContinue?: () => void
  minSelection?: number
  maxSelection?: number
}
type CompletionScreenProps = {
  title?: string
  subtitle?: string
  features?: readonly OnboardingFeature[]
  primaryAction?: OnboardingAction
  onComplete?: () => void
}

type InvoiceAddress = {
  name: string
  company?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  email?: string
  phone?: string
}
type InvoiceLineItem = {
  description: string
  quantity: number
  unitPrice: number
  total?: number
  unitPriceLabel?: string
  totalLabel?: string
}
type InvoiceProps = {
  data: {
    title?: string
    invoiceNumber: string
    status?: string
    dueDate: string
    issueDate: string
    from: InvoiceAddress
    to: InvoiceAddress
    items: readonly InvoiceLineItem[]
    subtotal: number
    tax?: { label: string; rate: number; amount: number }
    discount?: { label: string; amount: number }
    total: number
    paymentInfo?: {
      bankName?: string
      accountNumber?: string
      routingNumber?: string
      paymentMethods?: readonly string[]
    }
    notes?: string
    terms?: string
    details?: readonly { label: string; value: string }[]
    actions?: React.ReactNode
  }
  logo?: React.ReactNode
  onDownload?: () => void
  onPrint?: () => void
  onSendEmail?: () => void
}
type ReceiptProps = {
  data: {
    merchant: { name: string; address?: string; phone?: string }
    receiptNumber: string
    date: string
    items: readonly { name: string; quantity?: number; price: number }[]
    subtotal: number
    tax?: number
    total: number
    paymentMethod?: string
    cardLast4?: string
  }
  logo?: React.ReactNode
  onDownload?: () => void
}
type InvoiceSummaryProps = {
  invoiceNumber: string
  clientName: string
  issueDate?: string
  dueDate?: string
  amount: number
  amountLabel?: string
  status?: string
  statusTone?: VouchStatusTone
  href: string
  vouchId?: string
  appointmentLabel?: string
  confirmationWindowLabel?: string
  protectedAmountLabel?: string
  label?: string
  expiresAtLabel?: string
  remainingLabel?: string
  percentRemaining?: number
  tone?: VouchStatusTone
  disabled?: boolean
}
type InvoiceListProps = {
  invoices: Array<{
    id: string
    invoiceNumber: string
    clientName: string
    date: string
    amount: number
    status: "paid" | "pending" | "overdue"
  }>
}

type VouchStatusTone = "active" | "pending" | "complete" | "failed" | "expired" | "offline"
type VouchCountdownProps = {
  label: string
  expiresAtLabel: string
  remainingLabel: string
  startsAt?: string
  expiresAt?: string
  percentRemaining?: number
  tone?: VouchStatusTone
}
type VouchStatusTimelineItem = {
  id: string
  title: string
  description: string
  state: TimelineStatus
  timeLabel?: string
  meta?: string
}
type VouchStatusDocumentData = {
  title: string
  publicId: string
  status: string
  statusTone?: VouchStatusTone
  amountLabel: string
  merchantLabel: string
  customerLabel: string
  appointmentLabel: string
  confirmationOpensLabel: string
  confirmationExpiresLabel: string
  paymentStatusLabel: string
  settlementStatusLabel: string
  merchantReceivesLabel: string
  customerTotalLabel: string
  countdown?: VouchCountdownProps
  confirmations: {
    merchantConfirmed: boolean
    customerConfirmed: boolean
    action?: React.ReactNode
  }
  timeline: VouchStatusTimelineItem[]
  audit?: Array<{ label: string; value: string }>
}
type VouchCreationWizardProps = {
  steps: readonly OnboardingStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete?: () => void
  showProgress?: boolean
  disabled?: boolean
}

type ProfileSettingsProps = {
  user?: {
    name: string
    email: string
    avatar?: string
    bio?: string
    company?: string
    location?: string
    website?: string
  }
}
type NotificationSetting = {
  id: string
  title?: string
  label?: string
  description?: string
  email?: boolean
  push?: boolean
  enabled?: boolean
}
type NotificationSettingsProps = {
  notifications?: readonly NotificationSetting[]
  settings?: readonly NotificationSetting[]
  onToggle?: (id: string, enabled: boolean) => void
}
type SecuritySession = {
  id: string
  device: string
  location?: string
  lastActive: string
  current?: boolean
}
type SecuritySettingsProps = { twoFactorEnabled?: boolean; sessions?: readonly SecuritySession[] }
type AppearanceSettingsProps = {
  theme?: "light" | "dark" | "system"
  onThemeChange?: (theme: string) => void
}
type DangerZoneProps = { onDeleteAccount?: () => void }
type SettingsPageProps = {
  defaultTab?: string
  user?: ProfileSettingsProps["user"]
  notificationSettings?: readonly NotificationSetting[]
  sessions?: readonly SecuritySession[]
}
