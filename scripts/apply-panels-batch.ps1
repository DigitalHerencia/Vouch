# scripts/apply-panels-batch.ps1

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
$OperationName = "panels-batch"
$RepoRoot = (Get-Location).ProviderPath
$LogDir = Join-Path $RepoRoot ".agent-logs"
$BackupRoot = Join-Path $RepoRoot ".agent-backups\$OperationName-$BatchId"
$ManifestPath = Join-Path $LogDir "$OperationName-$BatchId.json"
$LatestManifestPath = Join-Path $LogDir "$OperationName-last.json"
$FailureLogPath = Join-Path $LogDir "$OperationName-$BatchId.failure.log"

$Files = @(
    @{
        RelativePath = "components/shared/process-panel.tsx"
        Content = @'
// components/shared/process-panel.tsx

import type { LucideIcon } from "lucide-react"

import {
    Surface,
    SurfaceFooter,
    SurfaceHeader,
} from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface ProcessStep {
    number: string
    title: string
    body: string
    icon: LucideIcon
}

export interface ProcessPanelProps {
    title: string
    steps: ProcessStep[]
    footer?: string | undefined
    className?: string | undefined
}

export function ProcessPanel({
    title,
    steps,
    footer,
    className,
}: ProcessPanelProps) {
    return (
        <Surface
            as="aside"
            className={cn("w-full", className)}
        >
            <SurfaceHeader>
                <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
                    {title}
                </p>
            </SurfaceHeader>

            <div>
                {steps.map((step) => {
                    const Icon = step.icon

                    return (
                        <div
                            key={`${step.number}-${step.title}`}
                            className="grid min-h-31 grid-cols-[1fr_92px] border-b border-neutral-800 sm:grid-cols-[1fr_124px] lg:min-h-34"
                        >
                            <div className="flex items-center gap-5 px-5 py-5 sm:gap-6 sm:px-7">
                                <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-11 sm:text-lg">
                                    {step.number}
                                </div>

                                <div>
                                    <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.07em] text-white uppercase sm:text-3xl lg:text-[34px]">
                                        {step.title}
                                    </h2>
                                    <p className="mt-2 max-w-65 text-base leading-tight font-semibold text-neutral-400 sm:text-lg">
                                        {step.body}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center border-l border-neutral-800">
                                <Icon
                                    className="size-9 text-white sm:size-10"
                                    strokeWidth={1.8}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {footer ? <SurfaceFooter variant="blue">{footer}</SurfaceFooter> : null}
        </Surface>
    )
}

export { ProcessPanel as BrutalistProcessPanel }
'@
    },
    @{
        RelativePath = "components/shared/callout-panel.tsx"
        Content = @'
// components/shared/callout-panel.tsx

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Surface } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface CalloutPanelProps {
    title: ReactNode
    body?: ReactNode | undefined
    icon?: LucideIcon | undefined
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function CalloutPanel({
    title,
    body,
    icon: Icon,
    actions,
    className,
}: CalloutPanelProps) {
    return (
        <Surface
            className={cn(
                "grid gap-6 p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center",
                className,
            )}
        >
            <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
                {Icon ? (
                    <div className="flex size-16 items-center justify-center">
                        <Icon
                            className="size-16 p-1 text-white"
                            strokeWidth={1.7}
                        />
                    </div>
                ) : null}

                <div>
                    <h2 className="font-(family-name:--font-display) text-[32px] leading-none tracking-wider text-white uppercase">
                        {title}
                    </h2>

                    {body ? (
                        <p className="mt-2 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                            {body}
                        </p>
                    ) : null}
                </div>
            </div>

            {actions ? (
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                    {actions}
                </div>
            ) : null}
        </Surface>
    )
}

export { CalloutPanel as BrutalistCalloutPanel }
'@
    },
    @{
        RelativePath = "components/shared/rule-panel.tsx"
        Content = @'
// components/shared/rule-panel.tsx

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface RulePanelItem {
    title: string
    body: string
    label?: string | undefined
    icon?: LucideIcon | undefined
}

export interface RulePanelProps {
    title: ReactNode
    body?: ReactNode | undefined
    items: RulePanelItem[]
    className?: string | undefined
}

export function RulePanel({ title, body, items, className }: RulePanelProps) {
    return (
        <Surface className={cn(className)}>
            <SurfaceHeader>
                <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase sm:text-[38px]">
                    {title}
                </h2>

                {body ? (
                    <p className="mt-3 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                        {body}
                    </p>
                ) : null}
            </SurfaceHeader>

            <div>
                {items.map((item, index) => {
                    const Icon = item.icon

                    return (
                        <article
                            key={`${item.title}-${index}`}
                            className="grid gap-5 border-b border-neutral-800 p-6 last:border-b-0 sm:grid-cols-[76px_1fr_auto] sm:p-7"
                        >
                            <div className="flex size-11 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-12 sm:text-lg">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <div>
                                <h3 className="font-(family-name:--font-display) text-[28px] leading-none tracking-[0.04em] text-white uppercase sm:text-[34px]">
                                    {item.title}
                                </h3>
                                <p className="mt-3 max-w-190 text-base leading-[1.35] font-semibold text-neutral-400 sm:text-lg">
                                    {item.body}
                                </p>
                            </div>

                            <div
                                className={cn(
                                    "flex items-start justify-end",
                                    !Icon && !item.label ? "hidden" : undefined,
                                )}
                            >
                                {Icon ? (
                                    <Icon
                                        className="size-8 text-white"
                                        strokeWidth={1.8}
                                    />
                                ) : (
                                    <span className="font-(family-name:--font-display) text-[14px] tracking-[0.08em] text-primary uppercase">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </article>
                    )
                })}
            </div>
        </Surface>
    )
}

export { RulePanel as BrutalistRulePanel }
'@
    },
    @{
        RelativePath = "components/shared/summary-panel.tsx"
        Content = @'
// components/shared/summary-panel.tsx

import type { ReactNode } from "react"

import { Surface, SurfaceHeader } from "@/components/shared/surface"
import { cn } from "@/lib/utils"

export interface SummaryPanelRow {
    label: string
    value: ReactNode
    description?: ReactNode | undefined
}

export interface SummaryPanelProps {
    title?: ReactNode | undefined
    body?: ReactNode | undefined
    rows: SummaryPanelRow[]
    actions?: ReactNode | undefined
    className?: string | undefined
}

export function SummaryPanel({
    title,
    body,
    rows,
    actions,
    className,
}: SummaryPanelProps) {
    return (
        <Surface className={cn(className)}>
            {title || body ? (
                <SurfaceHeader>
                    {title ? (
                        <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase sm:text-[38px]">
                            {title}
                        </h2>
                    ) : null}

                    {body ? (
                        <p className="mt-3 max-w-175 text-[16px] leading-[1.35] font-semibold text-neutral-400">
                            {body}
                        </p>
                    ) : null}
                </SurfaceHeader>
            ) : null}

            <dl>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="grid gap-3 border-b border-neutral-800 p-5 last:border-b-0 sm:grid-cols-[220px_1fr] sm:p-6"
                    >
                        <dt className="font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-neutral-500 uppercase">
                            {row.label}
                        </dt>
                        <dd>
                            <div className="font-mono text-[14px] font-bold break-words text-white sm:text-[15px]">
                                {row.value}
                            </div>

                            {row.description ? (
                                <p className="mt-2 max-w-160 text-[14px] leading-[1.35] font-semibold text-neutral-500">
                                    {row.description}
                                </p>
                            ) : null}
                        </dd>
                    </div>
                ))}
            </dl>

            {actions ? (
                <div className="border-t border-neutral-800 p-6">{actions}</div>
            ) : null}
        </Surface>
    )
}

export { SummaryPanel as BrutalistSummaryPanel }
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
        "components/shared/surface.tsx",
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