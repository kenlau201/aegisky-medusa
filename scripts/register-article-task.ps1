# ============================================================
#  Aegisky GUTN - Register Article Pipeline Scheduled Task
#
#  Creates a Windows Scheduled Task that runs the article
#  collection pipeline daily at 3:00 AM.
#
#  Run as Administrator:
#    powershell -ExecutionPolicy Bypass -File register-article-task.ps1
# ============================================================

$TaskName = "Aegisky-ArticlePipeline"
$ScriptPath = "D:\项目备份\Aegisky-Medusa\aegisky-medusa\scripts\run-article-pipeline.bat"
$ProjectDir = "D:\项目备份\Aegisky-Medusa\aegisky-medusa"

Write-Host "Registering scheduled task: $TaskName" -ForegroundColor Cyan

# Remove existing task if present
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create action
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`"" -WorkingDirectory $ProjectDir

# Create trigger: daily at 3:00 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At "3:00AM"

# Settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 10)

# Principal (run as current user, not elevated needed)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Register
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Aegisky GUTN: Daily GEO-driven article collection and lifecycle management. Crawls industry RSS feeds, scores articles by GEO value, maintains max 6 articles per brand."

Write-Host "`nTask registered successfully!" -ForegroundColor Green
Write-Host "  Name: $TaskName"
Write-Host "  Schedule: Daily at 3:00 AM"
Write-Host "  Script: $ScriptPath"
Write-Host "`nTo run manually: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "To view status:  Get-ScheduledTaskInfo -TaskName '$TaskName'"
Write-Host "To remove:      Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
