# Stops everything start-prawnstars.ps1 started.
$Logs = Join-Path $PSScriptRoot "logs"
foreach ($name in "tunnel", "caddy", "node", "relay") {
  $pidFile = Join-Path $Logs "$name.pid"
  if (-not (Test-Path $pidFile)) { continue }
  $id = [int](Get-Content $pidFile)
  $proc = Get-Process -Id $id -ErrorAction SilentlyContinue
  if ($proc) {
    Stop-Process -Id $id -Force
    Write-Host "Stopped $name (pid $id)"
  }
  Remove-Item $pidFile -Force
}
