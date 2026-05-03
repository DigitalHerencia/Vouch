# terminal

# Dry run: no writes.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -DryRun

# Real run: write all files, then one narrow final gate.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -FinalQualityGate typecheck

# Real run: typecheck after every section, then final typecheck.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -RunSectionGates -SectionQualityGate typecheck -FinalQualityGate typecheck

# Stronger real run: typecheck sections, then final typecheck + lint.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -RunSectionGates -SectionQualityGate typecheck -FinalQualityGate typecheck,lint

# Auto-rollback if any QA gate fails.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -RunSectionGates -SectionQualityGate typecheck -FinalQualityGate typecheck,lint -RollbackOnQualityFailure

# Post-failure remediation from latest manifest.
pwsh -File .\scripts\apply-design-system-component-batch.ps1 -Remediate