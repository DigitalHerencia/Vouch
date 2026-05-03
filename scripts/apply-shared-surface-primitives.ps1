# scripts/apply-shared-surface-primitives.ps1

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Remediate,
    [switch]$RollbackOnQualityFailure,
    [switch]$SkipQualityGates,

    [ValidateSet("typegen", "typecheck", "lint", "test", "format-check", "build", "full")]
    [string[]]$QualityGate = @("typecheck")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$BatchId = Get-Date -Format "yyyyMMdd-HHmmss"
$OperationName = "shared-surface-primitives"
$RepoRoot = (Get-Location).ProviderPath
$LogDir = Join-Path $RepoRoot ".agent-logs"
$BackupRoot = Join-Path $RepoRoot ".agent-backups\$OperationName-$BatchId"
$ManifestPath = Join-Path $LogDir "$OperationName-$BatchId.json"
$LatestManifestPath = Join-Path $LogDir "$OperationName-last.json"
$FailureLogPath = Join-Path $LogDir "$OperationName-$BatchId.failure.log"

$TargetFiles = @(
    @{
        RelativePath = "components/shared/surface.tsx"
        Content = @'
// components/shared/surface.tsx

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva("rounded-none", {
    variants: {
        variant: {
            panel: "border border-neutral-700 bg-black/55 backdrop-blur-[2px]",
            solid: "border border-neutral-800 bg-black",
            muted: "border border-neutral-800 bg-neutral-950",
            ghost: "bg-transparent",
            blue: "border border-primary bg-primary text-primary-foreground",
        },
        padding: {
            none: "p-0",
            sm: "p-4",
            md: "p-6",
            lg: "p-7 sm:p-8",
            xl: "p-8 sm:p-10 lg:p-12",
        },
    },
    defaultVariants: {
        variant: "panel",
        padding: "none",
    },
})

type SurfaceOwnProps<TElement extends ElementType> = {
    as?: TElement
    children: ReactNode
    className?: string
} & VariantProps<typeof surfaceVariants>

type SurfaceProps<TElement extends ElementType> = SurfaceOwnProps<TElement> &
    Omit<
        ComponentPropsWithoutRef<TElement>,
        keyof SurfaceOwnProps<TElement>
    >

export function Surface<TElement extends ElementType = "section">({
    as,
    children,
    className,
    variant,
    padding,
    ...props
}: SurfaceProps<TElement>) {
    const Component = as ?? "section"

    return (
        <Component
            className={cn(surfaceVariants({ variant, padding }), className)}
            {...props}
        >
            {children}
        </Component>
    )
}

export function SurfaceHeader({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div className={cn("border-b border-neutral-800 px-6 py-6", className)}>
            {children}
        </div>
    )
}

export function SurfaceBody({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return <div className={cn("p-6 sm:p-8", className)}>{children}</div>
}

export function SurfaceFooter({
    children,
    className,
    variant = "default",
}: {
    children: ReactNode
    className?: string
    variant?: "default" | "blue"
}) {
    return (
        <div
            className={cn(
                variant === "blue" ?
                    "bg-primary px-5 py-5 text-center font-(family-name:--font-display) text-sm leading-none tracking-widest text-primary-foreground uppercase sm:text-base lg:text-lg"
                :   "border-t border-neutral-800 px-6 py-6",
                className,
            )}
        >
            {children}
        </div>
    )
}

export { surfaceVariants }
'@
    },
    @{
        RelativePath = "components/shared/action-row.tsx"
        Content = @'
// components/shared/action-row.tsx

import type { HTMLAttributes, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const actionRowVariants = cva("flex", {
    variants: {
        direction: {
            responsive: "flex-col sm:flex-row",
            row: "flex-row",
            column: "flex-col",
        },
        align: {
            start: "items-start",
            center: "items-center",
            end: "items-end",
            stretch: "items-stretch",
        },
        justify: {
            start: "justify-start",
            center: "justify-center",
            end: "justify-end",
            between: "justify-between",
        },
        gap: {
            sm: "gap-3",
            md: "gap-4",
            lg: "gap-6",
        },
        wrap: {
            true: "flex-wrap",
            false: "flex-nowrap",
        },
        margin: {
            none: "mt-0",
            sm: "mt-4",
            md: "mt-6",
            lg: "mt-8",
        },
    },
    defaultVariants: {
        direction: "responsive",
        align: "stretch",
        justify: "start",
        gap: "md",
        wrap: false,
        margin: "lg",
    },
})

export interface ActionRowProps
    extends HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof actionRowVariants> {
    children: ReactNode
}

export function ActionRow({
    children,
    className,
    direction,
    align,
    justify,
    gap,
    wrap,
    margin,
    ...props
}: ActionRowProps) {
    return (
        <div
            className={cn(
                actionRowVariants({
                    direction,
                    align,
                    justify,
                    gap,
                    wrap,
                    margin,
                }),
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export { actionRowVariants }
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

    $timestamp = Get-Date -Format "HH:mm:ss"
    $line = "[$timestamp][$Level] $Message"
    Write-Host $line
}

function Add-FailureLog {
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )

    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    Add-Content -Path $FailureLogPath -Value $Message
}

function Assert-RepoRoot {
    Write-Step "Checking repository root: $RepoRoot"

    $packageJson = Join-Path $RepoRoot "package.json"
    $appDir = Join-Path $RepoRoot "app"

    if (!(Test-Path $packageJson) -or !(Test-Path $appDir)) {
        throw "Run this script from the Vouch repository root. Missing package.json or app/."
    }

    Write-Step "Repository root verified." "OK"
}

function New-DirectoryIfNeeded {
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if (Test-Path $Path) {
        Write-Step "Directory exists: $Path" "OK"
        return
    }

    if ($DryRun) {
        Write-Step "Would create directory: $Path" "DRY"
        return
    }

    Write-Step "Creating directory: $Path"
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Write-Step "Directory created: $Path" "OK"
}

function Save-Manifest {
    param(
        [Parameter(Mandatory)]
        [object]$Manifest
    )

    if ($DryRun) {
        Write-Step "Would write manifest: $ManifestPath" "DRY"
        return
    }

    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    $json = $Manifest | ConvertTo-Json -Depth 12
    Set-Content -Path $ManifestPath -Value $json -Encoding utf8
    Set-Content -Path $LatestManifestPath -Value $json -Encoding utf8

    Write-Step "Manifest written: $ManifestPath" "OK"
    Write-Step "Latest manifest updated: $LatestManifestPath" "OK"
}

function Restore-FromManifest {
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if (!(Test-Path $Path)) {
        throw "No manifest found at $Path. Nothing to remediate."
    }

    Write-Step "Loading remediation manifest: $Path"
    $manifest = Get-Content -Path $Path -Raw | ConvertFrom-Json

    foreach ($entry in $manifest.Files) {
        $target = Join-Path $RepoRoot $entry.RelativePath

        if ($entry.HadExistingFile -eq $true) {
            if (!(Test-Path $entry.BackupPath)) {
                throw "Backup missing for $($entry.RelativePath): $($entry.BackupPath)"
            }

            if ($DryRun) {
                Write-Step "Would restore backup for $($entry.RelativePath)" "DRY"
                continue
            }

            New-DirectoryIfNeeded -Path (Split-Path -Parent $target)
            Copy-Item -Path $entry.BackupPath -Destination $target -Force
            Write-Step "Restored existing file: $($entry.RelativePath)" "OK"
            continue
        }

        if (Test-Path $target) {
            if ($DryRun) {
                Write-Step "Would remove newly-created file: $($entry.RelativePath)" "DRY"
                continue
            }

            Remove-Item -Path $target -Force
            Write-Step "Removed newly-created file: $($entry.RelativePath)" "OK"
        }
    }

    Write-Step "Remediation complete." "OK"
}

function Write-AtomicFile {
    param(
        [Parameter(Mandatory)]
        [string]$RelativePath,

        [Parameter(Mandatory)]
        [string]$Content
    )

    $targetPath = Join-Path $RepoRoot $RelativePath
    $targetDirectory = Split-Path -Parent $targetPath
    $tempPath = "$targetPath.tmp.$BatchId"
    $backupPath = Join-Path $BackupRoot $RelativePath
    $backupDirectory = Split-Path -Parent $backupPath
    $hadExistingFile = Test-Path $targetPath

    $record = [ordered]@{
        RelativePath = $RelativePath
        TargetPath = $targetPath
        TempPath = $tempPath
        BackupPath = $backupPath
        HadExistingFile = $hadExistingFile
        Applied = $false
    }

    Write-Step "Preparing write: $RelativePath"
    New-DirectoryIfNeeded -Path $targetDirectory

    if ($hadExistingFile) {
        Write-Step "Existing file detected: $RelativePath"

        if ($DryRun) {
            Write-Step "Would backup existing file to: $backupPath" "DRY"
        }
        else {
            New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
            Copy-Item -Path $targetPath -Destination $backupPath -Force
            Write-Step "Backup created: $backupPath" "OK"
        }
    }
    else {
        Write-Step "File does not exist yet: $RelativePath"
    }

    if ($DryRun) {
        Write-Step "Would atomically write file: $RelativePath" "DRY"
        $record.Applied = $false
        return [pscustomobject]$record
    }

    try {
        $normalizedContent = $Content.TrimEnd() + [Environment]::NewLine
        $utf8NoBom = [System.Text.UTF8Encoding]::new($false)

        Write-Step "Writing temporary file: $tempPath"
        [System.IO.File]::WriteAllText($tempPath, $normalizedContent, $utf8NoBom)

        $roundTrip = [System.IO.File]::ReadAllText($tempPath, [System.Text.Encoding]::UTF8)
        if ($roundTrip -ne $normalizedContent) {
            throw "Write verification failed for $RelativePath."
        }

        Write-Step "Replacing target file: $RelativePath"
        Move-Item -Path $tempPath -Destination $targetPath -Force

        $record.Applied = $true
        Write-Step "File write complete: $RelativePath" "OK"

        return [pscustomobject]$record
    }
    catch {
        $message = "Failed while writing $RelativePath. $($_.Exception.Message)"
        Add-FailureLog -Message $message
        Write-Step $message "ERROR"

        if (Test-Path $tempPath) {
            Remove-Item -Path $tempPath -Force
            Write-Step "Removed incomplete temporary file: $tempPath" "WARN"
        }

        if ($hadExistingFile -and (Test-Path $backupPath)) {
            Copy-Item -Path $backupPath -Destination $targetPath -Force
            Write-Step "Restored backup after failed write: $RelativePath" "WARN"
        }
        elseif (!$hadExistingFile -and (Test-Path $targetPath)) {
            Remove-Item -Path $targetPath -Force
            Write-Step "Removed incomplete newly-created file: $RelativePath" "WARN"
        }

        throw
    }
}

function Invoke-QualityGate {
    param(
        [Parameter(Mandatory)]
        [string[]]$Gates
    )

    if ($SkipQualityGates) {
        Write-Step "Skipping quality gates by request." "WARN"
        return
    }

    $scriptByGate = @{
        "typegen" = "typegen"
        "typecheck" = "typecheck"
        "lint" = "lint"
        "test" = "test"
        "format-check" = "format:check"
        "build" = "build"
        "full" = "validate"
    }

    foreach ($gate in $Gates) {
        $scriptName = $scriptByGate[$gate]

        if ([string]::IsNullOrWhiteSpace($scriptName)) {
            throw "Unknown quality gate: $gate"
        }

        Write-Step "Running QA gate: pnpm run $scriptName"
        & pnpm run $scriptName

        if ($LASTEXITCODE -ne 0) {
            throw "QA gate failed: pnpm run $scriptName"
        }

        Write-Step "QA gate passed: pnpm run $scriptName" "OK"
    }
}

function Invoke-Apply {
    Assert-RepoRoot

    if ($Remediate) {
        Restore-FromManifest -Path $LatestManifestPath
        return
    }

    if (!$DryRun) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    }

    $records = @()

    foreach ($file in $TargetFiles) {
        $records += Write-AtomicFile `
            -RelativePath $file.RelativePath `
            -Content $file.Content
    }

    $manifest = [ordered]@{
        Operation = $OperationName
        BatchId = $BatchId
        RepoRoot = $RepoRoot
        DryRun = [bool]$DryRun
        CreatedAt = (Get-Date).ToString("o")
        Files = $records
    }

    Save-Manifest -Manifest $manifest

    if ($DryRun) {
        Write-Step "Dry run complete. No files were changed." "OK"
        return
    }

    try {
        Invoke-QualityGate -Gates $QualityGate
    }
    catch {
        Add-FailureLog -Message $_.Exception.Message
        Write-Step $_.Exception.Message "ERROR"

        if ($RollbackOnQualityFailure) {
            Write-Step "Rollback requested after QA failure." "WARN"
            Restore-FromManifest -Path $ManifestPath
        }

        throw
    }

    Write-Step "Operation complete: $OperationName" "OK"
}

try {
    Invoke-Apply
}
catch {
    Add-FailureLog -Message "Operation failed. $($_.Exception.Message)"
    Write-Step "Operation failed. See log: $FailureLogPath" "ERROR"
    exit 1
}