# Starts the club automatically when you sign in to Windows, so a reboot does
# not take cockmagic.xyz offline. Registers a per-user scheduled task named
# "Cock Magic Club" that runs start-prawnstars.ps1 one minute after sign-in.
# Undo with:  .\install-autostart.ps1 -Remove
param([switch]$Remove)

$TaskName = "Cock Magic Club"

if ($Remove) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Removed the '$TaskName' sign-in task."
  return
}

$Start = Join-Path $PSScriptRoot "start-prawnstars.ps1"
$Action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Start`"" `
  -WorkingDirectory $PSScriptRoot
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$Trigger.Delay = "PT1M"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger `
  -Settings $Settings -Description "Starts the Cock Magic Club server and tunnel." -Force | Out-Null
Write-Host "The club now starts one minute after you sign in to Windows."
