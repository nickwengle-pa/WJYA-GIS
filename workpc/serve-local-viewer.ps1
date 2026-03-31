param(
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'

$appRoot = Join-Path $PSScriptRoot 'app'
if (-not (Test-Path -LiteralPath $appRoot -PathType Container)) {
  throw "Unable to find the packaged app folder at $appRoot"
}

if (-not ('System.Net.Http.HttpClientHandler' -as [type])) {
  Add-Type -AssemblyName 'System.Net.Http'
}

$mimeTypes = @{
  '.css'  = 'text/css'
  '.html' = 'text/html; charset=utf-8'
  '.ico'  = 'image/x-icon'
  '.js'   = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.map'  = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.txt'  = 'text/plain; charset=utf-8'
}

$qgisProxyPrefix = 'qgis/'
$qgisProxyBaseUri = [Uri]'http://127.0.0.1:9090/'
$httpClientHandler = [System.Net.Http.HttpClientHandler]::new()
$httpClientHandler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
$httpClient = [System.Net.Http.HttpClient]::new($httpClientHandler)
$httpClient.Timeout = [TimeSpan]::FromSeconds(100)

$listener = New-Object System.Net.HttpListener
$prefixes = @(
  "http://127.0.0.1:$Port/",
  "http://localhost:$Port/"
)

foreach ($prefix in $prefixes) {
  $listener.Prefixes.Add($prefix)
}

$listener.Start()

Write-Host "Serving County Parcel Viewer from $appRoot"
Write-Host "Open http://localhost:$Port or http://127.0.0.1:$Port in your browser"
Write-Host "Press Ctrl+C to stop"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = 'index.html'
    }

    if ($requestPath -eq 'app-config.json') {
      $configPath = Join-Path $appRoot 'app-config.json'
      $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
      $proxyBaseUrl = "$($context.Request.Url.Scheme)://$($context.Request.Url.Authority)/qgis/ows/"
      $config.VITE_QGIS_BASE_URL = $proxyBaseUrl
      $config.VITE_SEARCH_URL = $proxyBaseUrl

      $bytes = [System.Text.Encoding]::UTF8.GetBytes(($config | ConvertTo-Json -Depth 10))
      $context.Response.StatusCode = 200
      $context.Response.ContentType = 'application/json; charset=utf-8'
      $context.Response.Headers['Cache-Control'] = 'no-store'
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.OutputStream.Close()
      continue
    }

    if ($requestPath.StartsWith($qgisProxyPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      $proxyPath = $requestPath.Substring($qgisProxyPrefix.Length)
      $targetUriBuilder = [System.UriBuilder]::new([Uri]::new($qgisProxyBaseUri, $proxyPath))
      $query = $context.Request.Url.Query.TrimStart('?')
      if (-not [string]::IsNullOrEmpty($query)) {
        $targetUriBuilder.Query = $query
      }

      try {
        $requestMessage = [System.Net.Http.HttpRequestMessage]::new(
          [System.Net.Http.HttpMethod]::new($context.Request.HttpMethod),
          $targetUriBuilder.Uri
        )

        if ($context.Request.HasEntityBody) {
          $requestBody = [System.IO.MemoryStream]::new()
          $context.Request.InputStream.CopyTo($requestBody)
          $requestMessage.Content = [System.Net.Http.ByteArrayContent]::new($requestBody.ToArray())
          if ($context.Request.ContentType) {
            $null = $requestMessage.Content.Headers.TryAddWithoutValidation('Content-Type', $context.Request.ContentType)
          }
          $requestBody.Dispose()
        }

        $proxyResponse = $httpClient.SendAsync(
          $requestMessage,
          [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead
        ).GetAwaiter().GetResult()

        try {
          $proxyBytes = $proxyResponse.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
          $context.Response.StatusCode = [int]$proxyResponse.StatusCode

          if ($proxyResponse.Content.Headers.ContentType) {
            $context.Response.ContentType = $proxyResponse.Content.Headers.ContentType.ToString()
          }

          if ($proxyResponse.Content.Headers.ContentLength) {
            $context.Response.ContentLength64 = [int64]$proxyResponse.Content.Headers.ContentLength
          } else {
            $context.Response.ContentLength64 = $proxyBytes.Length
          }

          $context.Response.OutputStream.Write($proxyBytes, 0, $proxyBytes.Length)
        } finally {
          $proxyResponse.Dispose()
          $requestMessage.Dispose()
        }
      } catch {
        $message = "QGIS proxy request failed: $($_.Exception.Message)"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($message)
        $context.Response.StatusCode = 502
        $context.Response.ContentType = 'text/plain; charset=utf-8'
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } finally {
        $context.Response.OutputStream.Close()
      }

      continue
    }

    $candidatePath = Join-Path $appRoot $requestPath
    if (Test-Path -LiteralPath $candidatePath -PathType Container) {
      $candidatePath = Join-Path $candidatePath 'index.html'
    }

    if (-not (Test-Path -LiteralPath $candidatePath -PathType Leaf)) {
      $candidatePath = Join-Path $appRoot 'index.html'
    }

    $extension = [System.IO.Path]::GetExtension($candidatePath).ToLowerInvariant()
    $contentType = $mimeTypes[$extension]
    if (-not $contentType) {
      $contentType = 'application/octet-stream'
    }

    $bytes = [System.IO.File]::ReadAllBytes($candidatePath)
    $context.Response.StatusCode = 200
    $context.Response.ContentType = $contentType
    $context.Response.Headers['Cache-Control'] = 'no-store'
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  }
} finally {
  $httpClient.Dispose()
  $httpClientHandler.Dispose()
  $listener.Stop()
  $listener.Close()
}
