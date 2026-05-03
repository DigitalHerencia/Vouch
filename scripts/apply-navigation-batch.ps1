# scripts/apply-navigation-batch.ps1

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Remediate,
    [switch]$RollbackOnQualityFailure,
    [switch]$SkipQualityGate,

    [ValidateSet("typegen", "typecheck", "lint", "test", "format-check", "build", "full")]
    [string]$QualityGate = "typecheck"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$BatchId = Get-Date -Format "yyyyMMdd-HHmmss"
$OperationName = "navigation-batch"
$RepoRoot = (Get-Location).ProviderPath
$LogDir = Join-Path $RepoRoot ".agent-logs"
$BackupRoot = Join-Path $RepoRoot ".agent-backups\$OperationName-$BatchId"
$ManifestPath = Join-Path $LogDir "$OperationName-$BatchId.json"
$LatestManifestPath = Join-Path $LogDir "$OperationName-last.json"
$FailureLogPath = Join-Path $LogDir "$OperationName-$BatchId.failure.log"

$Files = @(
    @{
        RelativePath = "components/navigation/public-header.tsx"
        Content = @'
// components/navigation/public-header.tsx

import type { ReactNode } from "react"
import Link from "next/link"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PublicHeaderNavItem {
    label: string
    href: string
}

export interface PublicHeaderProps {
    logo?: ReactNode | undefined
    navItems?: readonly PublicHeaderNavItem[] | undefined
    className?: string | undefined
}

export const defaultPublicNavItems = [
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly PublicHeaderNavItem[]

export function PublicHeader({
    logo = <LogoLockup />,
    navItems = defaultPublicNavItems,
    className,
}: PublicHeaderProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 h-21 w-full border-b border-neutral-900 bg-black",
                className,
            )}
        >
            <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10 md:flex lg:px-12">
                <Link
                    href="/"
                    aria-label="Vouch home"
                    className="flex shrink-0 items-center"
                >
                    {logo}
                </Link>

                <nav className="flex items-center gap-8 lg:gap-12">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant="nav"
                            size="nav"
                            render={<Link href={item.href} />}
                        >
                            {item.label}
                        </Button>
                    ))}
                </nav>

                <div className="flex items-center gap-4 lg:gap-5">
                    <Button
                        variant="secondary"
                        size="lg"
                        render={<Link href="/sign-in" />}
                    >
                        Sign in
                    </Button>

                    <Button
                        variant="primary"
                        size="lg"
                        className="min-w-40 sm:min-w-44 lg:min-w-48"
                        render={<Link href="/sign-up?return_to=/vouches/new" />}
                    >
                        Get started
                    </Button>
                </div>
            </div>

            <div className="flex h-full items-center justify-center px-6 md:hidden">
                <Link
                    href="/"
                    aria-label="Vouch home"
                    className="inline-flex items-center"
                >
                    <LogoLockup
                        className="justify-center"
                        iconClassName="size-9"
                        wordmarkClassName="text-[34px]"
                    />
                </Link>
            </div>
        </header>
    )
}
'@
    },
    @{
        RelativePath = "components/navigation/public-footer.tsx"
        Content = @'
// components/navigation/public-footer.tsx

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PublicFooterLink {
    label: string
    href: string
}

export interface PublicFooterProps {
    links?: readonly PublicFooterLink[] | undefined
    className?: string | undefined
}

export const defaultPublicFooterLinks = [
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy", href: "/legal/privacy" },
] satisfies readonly PublicFooterLink[]

export function PublicFooter({
    links = defaultPublicFooterLinks,
    className,
}: PublicFooterProps) {
    return (
        <footer className={cn("w-full border-t border-neutral-900 bg-black", className)}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-7 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                <p className="font-mono text-sm leading-none text-neutral-600 sm:text-base lg:text-lg">
                    © {new Date().getFullYear()} Vouch. Payment coordination, not escrow.
                </p>

                <nav className="flex flex-wrap gap-x-7 gap-y-4 sm:gap-x-9">
                    {links.map((item) => (
                        <Button
                            key={item.href}
                            variant="nav"
                            size="nav"
                            render={<Link href={item.href} />}
                        >
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </div>
        </footer>
    )
}
'@
    },
    @{
        RelativePath = "components/navigation/app-header.tsx"
        Content = @'
// components/navigation/app-header.tsx

"use client"

import { Bell, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogoLockup } from "@/components/brand/logo-lockup"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AppHeaderNavItem {
    href: string
    label: string
}

export interface AppHeaderProps {
    navItems?: readonly AppHeaderNavItem[] | undefined
    className?: string | undefined
}

export const defaultAppNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/vouches", label: "Vouches" },
    { href: "/setup", label: "Setup" },
    { href: "/settings", label: "Settings" },
] satisfies readonly AppHeaderNavItem[]

export function AppHeader({
    navItems = defaultAppNavItems,
    className,
}: AppHeaderProps) {
    const pathname = usePathname()

    return (
        <header
            className={cn(
                "sticky top-0 z-40 h-19 border-b border-neutral-900 bg-black/90 backdrop-blur supports-backdrop-filter:bg-black/78",
                className,
            )}
        >
            <div className="mx-auto hidden h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 md:flex lg:px-8">
                <div className="flex items-center gap-7 lg:gap-10">
                    <Link
                        href="/dashboard"
                        aria-label="Vouch dashboard"
                        className="inline-flex items-center text-neutral-50"
                    >
                        <LogoLockup />
                    </Link>

                    <nav
                        aria-label="Main navigation"
                        className="flex items-center gap-2"
                    >
                        {navItems.map((item) => {
                            const active =
                                pathname === item.href ||
                                pathname.startsWith(`${item.href}/`)

                            return (
                                <Button
                                    key={item.href}
                                    variant={active ? "secondary" : "ghost"}
                                    size="sm"
                                    render={<Link href={item.href} />}
                                >
                                    {item.label}
                                </Button>
                            )
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        size="lg"
                        render={<Link href="/vouches/new" />}
                    >
                        Create Vouch
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
                    >
                        <Bell />
                    </Button>

                    <UserMenu />
                </div>
            </div>

            <div className="flex h-full items-center justify-center px-6 md:hidden">
                <Link
                    href="/dashboard"
                    aria-label="Vouch dashboard"
                    className="inline-flex items-center"
                >
                    <LogoLockup
                        className="justify-center"
                        iconClassName="size-9"
                        wordmarkClassName="text-[34px]"
                    />
                </Link>

                <Menu
                    className="absolute right-6 size-6 text-neutral-500"
                    aria-hidden="true"
                />
            </div>
        </header>
    )
}
'@
    },
    @{
        RelativePath = "components/navigation/mobile-bottom-nav.tsx"
        Content = @'
// components/navigation/mobile-bottom-nav.tsx

"use client"

import {
    CalendarDays,
    FileText,
    HelpCircle,
    Home,
    Plus,
    Settings,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface MobileBottomNavItem {
    href: string
    label: string
    icon: LucideIcon
    primary?: boolean | undefined
}

export interface MobileBottomNavProps {
    items?: readonly MobileBottomNavItem[] | undefined
    className?: string | undefined
    "aria-label"?: string | undefined
}

export const defaultAppMobileBottomNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/vouches", label: "Vouches", icon: CalendarDays },
    { href: "/vouches/new", label: "Create", icon: Plus, primary: true },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/setup", label: "Setup", icon: ShieldCheck },
] satisfies readonly MobileBottomNavItem[]

export const defaultPublicMobileBottomNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pricing", label: "Pricing", icon: FileText },
    { href: "/sign-up?return_to=/vouches/new", label: "Create", icon: Plus, primary: true },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/sign-in", label: "Sign in", icon: ShieldCheck },
] satisfies readonly MobileBottomNavItem[]

export function MobileBottomNav({
    items = defaultAppMobileBottomNavItems,
    className,
    "aria-label": ariaLabel = "Mobile navigation",
}: MobileBottomNavProps) {
    const pathname = usePathname()

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-neutral-900 bg-black/92 px-2 py-2 backdrop-blur md:hidden",
                className,
            )}
        >
            {items.map((item) => {
                const Icon = item.icon
                const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 text-[11px] font-semibold text-neutral-500",
                            isActive ? "text-white" : undefined,
                        )}
                    >
                        <span
                            className={cn(
                                "grid place-items-center",
                                item.primary ?
                                    "size-11 bg-primary text-primary-foreground"
                                :   "size-6 text-primary",
                            )}
                        >
                            <Icon className={item.primary ? "size-5" : "size-4"} />
                        </span>
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}

export function AppMobileBottomNav(props: Omit<MobileBottomNavProps, "items">) {
    return (
        <MobileBottomNav
            items={defaultAppMobileBottomNavItems}
            {...props}
        />
    )
}

export function PublicMobileBottomNav(props: Omit<MobileBottomNavProps, "items">) {
    return (
        <MobileBottomNav
            items={defaultPublicMobileBottomNavItems}
            aria-label="Public mobile navigation"
            {...props}
        />
    )
}
'@
    }
)

function Write-Step {
    param(
        [Parameter(Mandatory)]
        [string]$Message,

        [ValidateSet("INFO", "OK", "WARN", "ERROR", "DRY")]
        [string]$Level = "INFO"
    )

    $Timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$Timestamp][$Level] $Message"
}

function Add-FailureLog {
    param([Parameter(Mandatory)][string]$Message)

    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    Add-Content -Path $FailureLogPath -Value $Message
}

function Assert-RepoRoot {
    Write-Step "Checking repository root: $RepoRoot"

    if (!(Test-Path (Join-Path $RepoRoot "package.json")) -or !(Test-Path (Join-Path $RepoRoot "app"))) {
        throw "Run this script from the Vouch repository root."
    }

    Write-Step "Repository root verified." "OK"
}

function Assert-Prerequisites {
    $RequiredFiles = @(
        "components/ui/button.tsx",
        "components/brand/logo-lockup.tsx",
        "components/auth/user-menu.tsx",
        "lib/utils.ts"
    )

    foreach ($File in $RequiredFiles) {
        if (!(Test-Path (Join-Path $RepoRoot $File))) {
            throw "Missing prerequisite file: $File"
        }
    }

    Write-Step "Prerequisites verified." "OK"
}

function New-DirectoryIfNeeded {
    param([Parameter(Mandatory)][string]$Path)

    if (Test-Path $Path) {
        Write-Step "Directory exists: $Path" "OK"
        return
    }

    if ($DryRun) {
        Write-Step "Would create directory: $Path" "DRY"
        return
    }

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Write-Step "Directory created: $Path" "OK"
}

function Write-AtomicFile {
    param(
        [Parameter(Mandatory)][string]$RelativePath,
        [Parameter(Mandatory)][string]$Content
    )

    $TargetPath = Join-Path $RepoRoot $RelativePath
    $TargetDirectory = Split-Path -Parent $TargetPath
    $TempPath = "$TargetPath.tmp.$BatchId"
    $BackupPath = Join-Path $BackupRoot $RelativePath
    $BackupDirectory = Split-Path -Parent $BackupPath
    $HadExistingFile = Test-Path $TargetPath

    $Record = [ordered]@{
        RelativePath = $RelativePath
        TargetPath = $TargetPath
        BackupPath = $BackupPath
        HadExistingFile = $HadExistingFile
        Applied = $false
    }

    Write-Step "Preparing write: $RelativePath"
    New-DirectoryIfNeeded -Path $TargetDirectory

    if ($HadExistingFile) {
        if ($DryRun) {
            Write-Step "Would backup existing file: $RelativePath" "DRY"
        }
        else {
            New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
            Copy-Item -Path $TargetPath -Destination $BackupPath -Force
            Write-Step "Backup created: $BackupPath" "OK"
        }
    }
    else {
        Write-Step "File does not exist yet: $RelativePath"
    }

    if ($DryRun) {
        Write-Step "Would write file atomically: $RelativePath" "DRY"
        return [pscustomobject]$Record
    }

    try {
        $NormalizedContent = $Content.TrimEnd() + [Environment]::NewLine
        $Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

        [System.IO.File]::WriteAllText($TempPath, $NormalizedContent, $Utf8NoBom)

        $RoundTrip = [System.IO.File]::ReadAllText($TempPath, [System.Text.Encoding]::UTF8)
        if ($RoundTrip -ne $NormalizedContent) {
            throw "Write verification failed."
        }

        Move-Item -Path $TempPath -Destination $TargetPath -Force
        $Record.Applied = $true

        Write-Step "File write complete: $RelativePath" "OK"
        return [pscustomobject]$Record
    }
    catch {
        Add-FailureLog -Message "Failed writing $RelativePath. $($_.Exception.Message)"

        if (Test-Path $TempPath) {
            Remove-Item -Path $TempPath -Force
        }

        if ($HadExistingFile -and (Test-Path $BackupPath)) {
            Copy-Item -Path $BackupPath -Destination $TargetPath -Force
        }
        elseif (!$HadExistingFile -and (Test-Path $TargetPath)) {
            Remove-Item -Path $TargetPath -Force
        }

        throw
    }
}

function Save-Manifest {
    param([Parameter(Mandatory)][object[]]$Records)

    if ($DryRun) {
        Write-Step "Would write manifest: $ManifestPath" "DRY"
        return
    }

    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    $Manifest = [ordered]@{
        Operation = $OperationName
        BatchId = $BatchId
        RepoRoot = $RepoRoot
        CreatedAt = (Get-Date).ToString("o")
        Files = $Records
    }

    $Json = $Manifest | ConvertTo-Json -Depth 10
    Set-Content -Path $ManifestPath -Value $Json -Encoding utf8
    Set-Content -Path $LatestManifestPath -Value $Json -Encoding utf8

    Write-Step "Manifest written: $ManifestPath" "OK"
}

function Restore-FromManifest {
    if (!(Test-Path $LatestManifestPath)) {
        throw "No latest manifest found for remediation: $LatestManifestPath"
    }

    $Manifest = Get-Content -Path $LatestManifestPath -Raw | ConvertFrom-Json

    foreach ($Entry in $Manifest.Files) {
        $TargetPath = Join-Path $RepoRoot $Entry.RelativePath

        if ($Entry.HadExistingFile -eq $true) {
            if (!(Test-Path $Entry.BackupPath)) {
                throw "Backup missing: $($Entry.BackupPath)"
            }

            if (!$DryRun) {
                Copy-Item -Path $Entry.BackupPath -Destination $TargetPath -Force
            }

            Write-Step "Restored: $($Entry.RelativePath)" "OK"
        }
        elseif (Test-Path $TargetPath) {
            if (!$DryRun) {
                Remove-Item -Path $TargetPath -Force
            }

            Write-Step "Removed created file: $($Entry.RelativePath)" "OK"
        }
    }
}

function Invoke-QualityGate {
    if ($SkipQualityGate) {
        Write-Step "Skipping quality gate." "WARN"
        return
    }

    $ScriptByGate = @{
        "typegen" = "typegen"
        "typecheck" = "typecheck"
        "lint" = "lint"
        "test" = "test"
        "format-check" = "format:check"
        "build" = "build"
        "full" = "validate"
    }

    $ScriptName = $ScriptByGate[$QualityGate]

    if ([string]::IsNullOrWhiteSpace($ScriptName)) {
        throw "Unknown quality gate: $QualityGate"
    }

    Write-Step "Running QA gate: pnpm run $ScriptName"
    & pnpm run $ScriptName

    if ($LASTEXITCODE -ne 0) {
        throw "QA gate failed: pnpm run $ScriptName"
    }

    Write-Step "QA gate passed: pnpm run $ScriptName" "OK"
}

try {
    Assert-RepoRoot

    if ($Remediate) {
        Restore-FromManifest
        exit 0
    }

    Assert-Prerequisites

    if (!$DryRun) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    }

    $Records = @()

    foreach ($File in $Files) {
        $Records += Write-AtomicFile -RelativePath $File.RelativePath -Content $File.Content
    }

    Save-Manifest -Records $Records

    if ($DryRun) {
        Write-Step "Dry run complete. No files changed." "OK"
        exit 0
    }

    try {
        Invoke-QualityGate
    }
    catch {
        Add-FailureLog -Message $_.Exception.Message

        if ($RollbackOnQualityFailure) {
            Write-Step "QA failed. Rolling back batch." "WARN"
            Restore-FromManifest
        }

        throw
    }

    Write-Step "Operation complete: $OperationName" "OK"
}
catch {
    Add-FailureLog -Message "Operation failed. $($_.Exception.Message)"
    Write-Step "Operation failed. See log: $FailureLogPath" "ERROR"
    exit 1
}