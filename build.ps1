$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$outputRoot = Join-Path $projectRoot "dist"

if (Test-Path -LiteralPath $outputRoot) {
  Remove-Item -Recurse -Force -LiteralPath $outputRoot
}

New-Item -ItemType Directory -Path $outputRoot | Out-Null
$draftPages = @("news-group-update.html", "news-opportunity-update.html", "news-publication-update.html")
Get-ChildItem -LiteralPath $projectRoot -Filter "*.html" -File |
  Where-Object { $_.Name -notin $draftPages } |
  Copy-Item -Destination $outputRoot -Force
$assetsOutput = Join-Path $outputRoot "assets"
$sourceOutput = Join-Path $outputRoot "src"
New-Item -ItemType Directory -Path $assetsOutput, $sourceOutput | Out-Null
Copy-Item -Recurse -Force (Join-Path (Join-Path $projectRoot "assets") "*") $assetsOutput
Copy-Item -Recurse -Force (Join-Path (Join-Path $projectRoot "src") "*") $sourceOutput

Write-Output "Static site prepared in $outputRoot"
