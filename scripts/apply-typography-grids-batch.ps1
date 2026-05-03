# scripts/apply-typography-grids-batch.ps1

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
$OperationName = "typography-grids-batch"
$RepoRoot = (Get-Location).ProviderPath
$LogDir = Join-Path $RepoRoot ".agent-logs"
$BackupRoot = Join-Path $RepoRoot ".agent-backups\$OperationName-$BatchId"
$ManifestPath = Join-Path $LogDir "$OperationName-$BatchId.json"
$LatestManifestPath = Join-Path $LogDir "$OperationName-last.json"
$FailureLogPath = Join-Path $LogDir "$OperationName-$BatchId.failure.log"

$Files = @(
    @{
        RelativePath = "components/shared/page-header.tsx"
        Content = @'
// components/shared/page-header.tsx

import type { ReactNode } from "react"

import { ActionRow } from "@/components/shared/action-row"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
    eyebrow?: ReactNode
    title: ReactNode
    body?: ReactNode
    actions?: ReactNode
    className?: string
    titleClassName?: string
    bodyClassName?: string
}

export function PageHeader({
    eyebrow,
    title,
    body,
    actions,
    className,
    titleClassName,
    bodyClassName,
}: PageHeaderProps) {
    return (
        <header className={cn("max-w-170", className)}>
            {eyebrow ? (
                <div className="flex items-center gap-3">
                    <span className="size-3 bg-primary" />
                    <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
                        {eyebrow}
                    </p>
                </div>
            ) : null}

            <h1
                className={cn(
                    "font-(family-name:--font-display) text-[64px] leading-[0.86] tracking-[0.015em] text-white uppercase sm:text-[88px] lg:text-[108px]",
                    eyebrow ? "mt-6" : undefined,
                    titleClassName,
                )}
            >
                {title}
            </h1>

            {body ? (
                <p
                    className={cn(
                        "mt-7 max-w-140 text-[18px] leading-[1.35] font-semibold text-neutral-300",
                        bodyClassName,
                    )}
                >
                    {body}
                </p>
            ) : null}

            {actions ? <ActionRow>{actions}</ActionRow> : null}
        </header>
    )
}

export { PageHeader as BrutalistPageHeader }
'@
    },
    @{
        RelativePath = "components/shared/section-intro.tsx"
        Content = @'
// components/shared/section-intro.tsx

import type { ReactNode } from "react"

import { ActionRow } from "@/components/shared/action-row"
import { cn } from "@/lib/utils"

export interface SectionIntroProps {
    eyebrow?: ReactNode
    title: ReactNode
    body?: ReactNode
    actions?: ReactNode
    className?: string
    titleClassName?: string
    bodyClassName?: string
}

export function SectionIntro({
    eyebrow,
    title,
    body,
    actions,
    className,
    titleClassName,
    bodyClassName,
}: SectionIntroProps) {
    return (
        <section className={cn("max-w-212.5", className)}>
            {eyebrow ? (
                <div className="flex items-center gap-3">
                    <span className="size-3 bg-primary" />
                    <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.08em] text-white uppercase">
                        {eyebrow}
                    </p>
                </div>
            ) : null}

            <h2
                className={cn(
                    "mt-6 max-w-212.5 font-(family-name:--font-display) text-[48px] leading-[0.92] tracking-[0.02em] text-white uppercase sm:text-[64px]",
                    !eyebrow ? "mt-0" : undefined,
                    titleClassName,
                )}
            >
                {title}
            </h2>

            {body ? (
                <p
                    className={cn(
                        "mt-4 max-w-170 text-[17px] leading-[1.35] font-semibold text-neutral-400",
                        bodyClassName,
                    )}
                >
                    {body}
                </p>
            ) : null}

            {actions ? <ActionRow>{actions}</ActionRow> : null}
        </section>
    )
}

export { SectionIntro as BrutalistSectionIntro }
'@
    },
    @{
        RelativePath = "components/shared/metric-grid.tsx"
        Content = @'
// components/shared/metric-grid.tsx

import { cn } from "@/lib/utils"

export interface MetricGridItem {
    label: string
    value: string
    body: string
}

export interface MetricGridProps {
    items: MetricGridItem[]
    className?: string
    tileClassName?: string
}

function getMetricTileClassName(index: number, total: number) {
    if (total === 4) {
        return cn(
            "min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0",
            "sm:nth-[2n-1]:border-r",
            "lg:border-r lg:border-b-0 lg:last:border-r-0",
        )
    }

    return cn(
        "min-h-37.5 border-b border-neutral-800 p-6 last:border-b-0",
        index < total - 1 ? "lg:border-r lg:border-b-0" : undefined,
    )
}

export function MetricGrid({
    items,
    className,
    tileClassName,
}: MetricGridProps) {
    return (
        <section
            className={cn(
                "grid border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
                items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3",
                className,
            )}
        >
            {items.map((metric, index) => (
                <MetricTile
                    key={`${metric.label}-${metric.value}`}
                    metric={metric}
                    className={cn(
                        getMetricTileClassName(index, items.length),
                        tileClassName,
                    )}
                />
            ))}
        </section>
    )
}

export function MetricTile({
    metric,
    className,
}: {
    metric: MetricGridItem
    className?: string
}) {
    return (
        <article className={className}>
            <p className="font-(family-name:--font-display) text-[15px] leading-none tracking-[0.07em] text-white uppercase">
                {metric.label}
            </p>
            <p className="mt-4 font-(family-name:--font-display) text-[54px] leading-[0.85] tracking-[0.02em] text-white uppercase">
                {metric.value}
            </p>
            <p className="mt-3 max-w-52.5 text-[15px] leading-[1.22] font-semibold text-neutral-300">
                {metric.body}
            </p>
        </article>
    )
}

export { MetricGrid as BrutalistMetricGrid }
'@
    },
    @{
        RelativePath = "components/shared/card-grid.tsx"
        Content = @'
// components/shared/card-grid.tsx

import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export interface CardGridItem {
    title: string
    body: string
    icon?: LucideIcon
    href?: string
    actionLabel?: string
}

export interface CardGridProps {
    items: CardGridItem[]
    className?: string
    cardClassName?: string
}

export function CardGrid({ items, className, cardClassName }: CardGridProps) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
            {items.map((item) => (
                <CardGridTile key={item.title} item={item} className={cardClassName} />
            ))}
        </div>
    )
}

export function CardGridTile({
    item,
    className,
}: {
    item: CardGridItem
    className?: string
}) {
    const Icon = item.icon

    const tileClassName = cn(
        "min-h-52.5 border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px]",
        item.href ? "transition-all duration-[160ms] hover:-translate-y-px hover:border-primary" : undefined,
        className,
    )

    const content = (
        <>
            {Icon ? <Icon className="size-9 text-white" strokeWidth={1.7} /> : null}

            <h3
                className={cn(
                    "font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase",
                    Icon ? "mt-8" : undefined,
                )}
            >
                {item.title}
            </h3>

            <p className="mt-4 text-[15px] leading-[1.28] font-semibold text-neutral-400">
                {item.body}
            </p>

            {item.actionLabel ? (
                <p className="mt-6 font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-primary uppercase">
                    {item.actionLabel}
                </p>
            ) : null}
        </>
    )

    if (item.href) {
        return (
            <Link href={item.href} className={tileClassName}>
                {content}
            </Link>
        )
    }

    return <article className={tileClassName}>{content}</article>
}

export { CardGrid as BrutalistCardGrid }
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
        "components/shared/action-row.tsx",
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