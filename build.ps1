$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$outputRoot = Join-Path $projectRoot "dist"

if (Test-Path -LiteralPath $outputRoot) {
  Remove-Item -Recurse -Force -LiteralPath $outputRoot
}

New-Item -ItemType Directory -Path $outputRoot | Out-Null
$draftPages = @("news-group-update.html", "news-opportunity-update.html", "news-publication-update.html")
# Flatten categorized source pages into the existing public URLs.
$pages = @(Get-ChildItem -LiteralPath $projectRoot -Filter "*.html" -File) +
  @(Get-ChildItem -LiteralPath (Join-Path $projectRoot "pages") -Filter "*.html" -File -Recurse)
$pages = @($pages | Where-Object { $_.Name -notin $draftPages })
$duplicate = $pages | Group-Object Name | Where-Object { $_.Count -gt 1 } | Select-Object -First 1
if ($duplicate) {
  throw "Duplicate page name: $($duplicate.Name). Public page names must be unique."
}
$pages | Copy-Item -Destination $outputRoot

$measurementId = $env:GA4_MEASUREMENT_ID
if ($measurementId) {
  if ($measurementId -cnotmatch '^G-[A-Z0-9]+$') {
    throw "GA4_MEASUREMENT_ID must be a valid G- measurement ID."
  }

  $googleTag = @"
<script async src="https://www.googletagmanager.com/gtag/js?id=$measurementId"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '$measurementId');
</script>
"@

  Get-ChildItem -LiteralPath $outputRoot -Filter "*.html" -File | ForEach-Object {
    $html = [System.IO.File]::ReadAllText($_.FullName)
    if (-not $html.Contains('<head>')) {
      throw "Missing head element in $($_.Name)."
    }
    $html = $html.Replace('<head>', "<head>`n$googleTag")
    [System.IO.File]::WriteAllText($_.FullName, $html, [System.Text.UTF8Encoding]::new($false))
  }
}
$assetsOutput = Join-Path $outputRoot "assets"
$sourceOutput = Join-Path $outputRoot "src"
New-Item -ItemType Directory -Path $assetsOutput, $sourceOutput | Out-Null
Copy-Item -Recurse -Force (Join-Path (Join-Path $projectRoot "assets") "*") $assetsOutput
Copy-Item -Recurse -Force (Join-Path (Join-Path $projectRoot "src") "*") $sourceOutput

# Give every local asset URL a content-based version in the deployment copy.
$python = "python"
& $python (Join-Path $projectRoot "version_site_assets.py") $outputRoot
if ($LASTEXITCODE -ne 0) {
  throw "Asset versioning failed."
}

Write-Output "Static site prepared in $outputRoot"
