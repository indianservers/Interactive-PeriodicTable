param(
  [string]$OutputDirectory = "docs\pharma-chemistry-review",
  [int]$ExpectedCount = 10
)

$resolvedOutput = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputDirectory))
[IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null
$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:5557/capture/")
$listener.Start()

try {
  for ($index = 0; $index -lt $ExpectedCount; $index += 1) {
    $context = $listener.GetContext()
    $name = $context.Request.QueryString["name"]
    if ($name -notmatch '^page-(0[1-9]|10)-after\.png$') {
      $context.Response.StatusCode = 400
      $context.Response.Close()
      continue
    }
    $target = [IO.Path]::GetFullPath((Join-Path $resolvedOutput $name))
    if (-not $target.StartsWith($resolvedOutput, [StringComparison]::OrdinalIgnoreCase)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }
    $stream = [IO.File]::Open($target, [IO.FileMode]::Create, [IO.FileAccess]::Write)
    try { $context.Request.InputStream.CopyTo($stream) } finally { $stream.Dispose() }
    $context.Response.StatusCode = 204
    $context.Response.Close()
    Write-Output "$name saved"
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
