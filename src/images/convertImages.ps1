$files = Get-Item * | Where-Object { $_.FullName.EndsWith(".jpg") -and $_.Name -eq "close.jpg" }

function IsBase64 {
    param (
        [string]$Content
    )
    try { $null = [Convert]::FromBase64String($Content); return $true } catch { return $false }
}

foreach ($file in $files) {
    Write-Host "File: $($file.FullName)"
    $b64 = Get-Content -Path $file.FullName

    if ($b64.Length -eq 0) {
        Write-Host "$b64 length zero, skipping."
        continue;
    }

    if ($file.Extension -eq ".svg") {
        Write-Host "svg, skipping."
        continue;
    }

    if ($file.Extension -eq ".png") {
        $len = 'module.exports = "data:image/png;base64,'.Length;
    }
    else {
        $len = 'module.exports = "data:image/jpeg;base64,'.Length;
    }
    
    $cropped = $b64.Substring($len, $b64.Length - $len - 1)

    $bytes = [Convert]::FromBase64String($cropped)
    [IO.File]::WriteAllBytes($file.FullName, $bytes)
}

