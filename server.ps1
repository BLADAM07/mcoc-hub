$port = 8080
$folder = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")
$listener.Start()

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   MCOC MASTER HUB - LOCAL WI-FI SERVER ACTIVE!       " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  On this PC:         http://localhost:$port" -ForegroundColor Green
Write-Host "  On Friend's Phone:  http://${ip}:$port" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  (Ensure friend is connected to the same Wi-Fi/Hotspot)" -ForegroundColor Gray
Write-Host "  Press Ctrl+C in this window to stop the server.`n" -ForegroundColor Gray

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath
    if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }
    $localFile = Join-Path $folder ($urlPath.TrimStart('/') -replace '/', '\')

    if (Test-Path $localFile -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
        $contentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".jpeg" { "image/jpeg" }
            ".webp" { "image/webp" }
            ".svg"  { "image/svg+xml" }
            default { "application/octet-stream" }
        }

        $response.ContentType = $contentType
        $bytes = [System.IO.File]::ReadAllBytes($localFile)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($buf, 0, $buf.Length)
    }
    $response.OutputStream.Close()
}