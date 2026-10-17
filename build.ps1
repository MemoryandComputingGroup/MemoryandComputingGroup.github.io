$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$outputRoot = Join-Path $projectRoot "dist"

if (Test-Path -LiteralPath $outputRoot) {
  Remove-Item -Recurse -Force -LiteralPath $outputRoot
}

New-Item -ItemType Directory -Path $outputRoot | Out-Null
Copy-Item -Force (Join-Path $projectRoot "*.html") $outputRoot
New-Item -ItemType Directory -Path (Join-Path $outputRoot "assets"), (Join-Path $outputRoot "src") | Out-Null
Copy-Item -Recurse -Force (Join-Path $projectRoot "assets\*") (Join-Path $outputRoot "assets")
Copy-Item -Recurse -Force (Join-Path $projectRoot "src\*") (Join-Path $outputRoot "src")

Write-Output "Static site prepared in $outputRoot"
