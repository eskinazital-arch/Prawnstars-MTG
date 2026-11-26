# Starts Prawnstars MTG on this PC: relay, game node, Caddy and a Cloudflare
# Tunnel, each in the background with a log in .\logs. Stop with
# stop-prawnstars.ps1.
#
# Without a named tunnel configured in secrets.local.ps1 it opens a temporary
# https://<random>.trycloudflare.com link (new each start). With $TunnelName set
# (after the custom domain is on Cloudflare) it runs that named tunnel instead.
#
# First run creates secrets.local.ps1 (git-ignored) holding the group password.
# -NoTunnel runs everything on http://localhost:8080 only, for a local check.
param([switch]$NoTunnel)
$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot
$Repo = (Resolve-Path (Join-Path $Here "..\..")).Path
$Logs = Join-Path $Here "logs"
$Secrets = Join-Path $Here "secrets.local.ps1"
New-Item -ItemType Directory -Force $Logs | Out-Null

$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine") }

if (-not (Test-Path $Secrets)) {
  $words = "prawn","shrimp","krill","lobster","crab","squid","kelp","reef","tide","coral","shell","pearl","eel","clam","wave","anchor","mana","forest","island","swamp","mountain","plains","dragon","goblin","wizard","zombie","angel","sliver","myr","elf","treasure","clue"
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $bytes = New-Object byte[] 4
  $rng.GetBytes($bytes)
  $pick = $bytes | ForEach-Object { $words[$_ % $words.Count] }
  $number = [BitConverter]::ToUInt16($bytes, 0) % 90 + 10
  $password = ($pick -join "-") + "-$number"
  $content = @(
    "# Prawnstars MTG secrets for this PC. Never commit this file.",
    "# Share the group password with the pod privately.",
    "`$GroupPassword = '$password'",
    "# After the custom domain is on Cloudflare, set the named tunnel here:",
    "`$TunnelName = ''"
  )
  [IO.File]::WriteAllLines($Secrets, $content, (New-Object Text.UTF8Encoding $false))
  Write-Host "Created $Secrets with a new group password." -ForegroundColor Yellow
}
. $Secrets
if (-not $GroupPassword) { throw "Set `$GroupPassword in $Secrets" }

# Each pod member signs in with their own password, cuck-<first name>, and the
# relay seats them as "Cuckold <Name>". Keep this list in step with
# src/lib/podMembers.ts. Set $MemberKeys in secrets.local.ps1 to override.
if (-not $MemberKeys) {
  $MemberKeys = (@("Tal", "Eden", "Dante", "Mitchell", "Jackson", "Dillon") |
    ForEach-Object { "cuck-$($_.ToLower())=Cuckold $_" }) -join ","
}

$Dist = Join-Path $Repo "dist"
if (-not (Test-Path (Join-Path $Dist "index.html"))) { throw "No build found. Run 'yarn build:web' in $Repo first." }
Copy-Item (Join-Path $Here "config.js") (Join-Path $Dist "config.js") -Force

function Start-Part($Name, $FilePath, $Arguments, $Environment) {
  foreach ($key in $Environment.Keys) { Set-Item "env:$key" $Environment[$key] }
  $log = Join-Path $Logs "$Name.log"
  $options = @{
    FilePath = $FilePath; WorkingDirectory = $Repo; WindowStyle = "Hidden"; PassThru = $true
    RedirectStandardOutput = $log; RedirectStandardError = "$log.err"
  }
  # Windows PowerShell refuses an empty -ArgumentList.
  if ($Arguments.Count -gt 0) { $options.ArgumentList = $Arguments }
  $proc = Start-Process @options
  Set-Content (Join-Path $Logs "$Name.pid") $proc.Id
  Write-Host "Started $Name (pid $($proc.Id))"
}

$Bin = Join-Path $Repo "target\release"
Start-Part "relay" (Join-Path $Bin "manabrew-server.exe") @() @{
  FORGE_HOST = "127.0.0.1"; FORGE_PORT = "9443"; FORGE_HEALTH_PORT = "9444"
  MANABREW_SERVER_KEY = $GroupPassword
  MANABREW_DIRECT_TRANSPORT = "1"; MANABREW_GUEST_LOBBY_CHAT = "1"
  MANABREW_MEMBER_KEYS = $MemberKeys
  MANABREW_ICE_SERVERS = "stun:stun.l.google.com:19302"
  RUST_LOG = "manabrew_server=info"
}
Start-Sleep -Seconds 2
Start-Part "node" (Join-Path $Bin "self-hosted-node.exe") @() @{
  SELF_HOSTED_NODE_RELAY_URL = "ws://127.0.0.1:9443"
  SELF_HOSTED_NODE_SERVER_KEY = $GroupPassword
  SELF_HOSTED_NODE_ENGINE_BACKEND = "forge"
  SELF_HOSTED_NODE_ROOM_NAME = "Prawnstars Pod"
  SELF_HOSTED_NODE_MAX_GAMES = "2"
  RUST_LOG = "info"
}
Start-Part "caddy" "caddy" @("run", "--config", (Join-Path $Here "Caddyfile"), "--adapter", "caddyfile") @{
  PRAWNSTARS_DIST = $Dist
}

if ($NoTunnel) {
  Write-Host "Prawnstars MTG is running locally at http://localhost:8080 (no tunnel)." -ForegroundColor Green
} elseif ($TunnelName) {
  Start-Part "tunnel" "cloudflared" @("tunnel", "--no-autoupdate", "run", "--url", "http://127.0.0.1:8080", $TunnelName) @{}
  Write-Host "Prawnstars MTG is starting on your named tunnel '$TunnelName'." -ForegroundColor Green
} else {
  Start-Part "tunnel" "cloudflared" @("tunnel", "--no-autoupdate", "--url", "http://127.0.0.1:8080") @{}
  $url = $null
  foreach ($i in 1..30) {
    Start-Sleep -Seconds 1
    $url = Select-String -Path (Join-Path $Logs "tunnel.log.err") -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue |
      Select-Object -First 1 | ForEach-Object { $_.Matches[0].Value }
    if ($url) { break }
  }
  if ($url) {
    Set-Content (Join-Path $Logs "link.txt") $url
    Write-Host "Prawnstars MTG is live at: $url" -ForegroundColor Green
  } else {
    Write-Host "Tunnel started, but no link yet; check $Logs\tunnel.log.err" -ForegroundColor Yellow
  }
}
