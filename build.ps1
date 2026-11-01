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

Write-Output "Static site prepared in $outputRoot"
