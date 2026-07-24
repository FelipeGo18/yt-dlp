# Desactiva Laragon de la variable PATH en la sesión actual de PowerShell
$env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notmatch 'laragon' }) -join ';'
Write-Host "✅ Laragon ha sido removido del PATH para esta sesión." -ForegroundColor Green
