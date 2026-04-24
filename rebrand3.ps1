# ZipSellix Brand Recoloring Script - Pass 3
# Catches remaining green-* references

$srcPath = "c:\Users\Kamran Ali\Desktop\ZipSellix\src"
$files = Get-ChildItem -Path $srcPath -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if (-not $content) { continue }
    
    $original = $content

    # focus:ring green-500
    $content = $content -replace 'ring-green-500/50', 'ring-brand-primary/50'
    $content = $content -replace 'ring-green-500', 'ring-brand-primary'

    # hover:bg-green-700
    $content = $content -replace 'hover:bg-green-700', 'hover:bg-brand-primary-hover'

    # shadow-green-200
    $content = $content -replace 'shadow-green-200', 'shadow-brand-primary/20'
    $content = $content -replace 'shadow-green-300', 'shadow-brand-primary/20'

    # border-green-600
    $content = $content -replace 'border-green-600', 'border-brand-primary'
    $content = $content -replace 'border-green-200/50', 'border-brand-primary/20'
    $content = $content -replace 'border-green-200', 'border-brand-primary/30'
    $content = $content -replace 'border-green-100', 'border-brand-primary/20'
    $content = $content -replace 'border-green-50', 'border-brand-primary/10'

    # text-green-800
    $content = $content -replace 'text-green-800', 'text-brand-primary'
    $content = $content -replace 'text-green-900', 'text-brand-primary'
    $content = $content -replace 'text-green-300', 'text-brand-primary/40'
    $content = $content -replace 'text-green-400', 'text-brand-primary'
    $content = $content -replace 'text-green-500', 'text-brand-primary'

    # accent-green-600
    $content = $content -replace 'accent-green-600', 'accent-brand-primary'

    # hover:border-green-200
    $content = $content -replace 'hover:border-green-200', 'hover:border-brand-primary/30'
    $content = $content -replace 'hover:border-green-300', 'hover:border-brand-primary'

    # hover:text-emerald 
    $content = $content -replace 'hover:text-green-400', 'hover:text-brand-primary'
    $content = $content -replace 'hover:text-green-500', 'hover:text-brand-primary'

    # bg-green-500
    $content = $content -replace 'bg-green-500', 'bg-brand-primary'
    $content = $content -replace 'bg-green-300', 'bg-brand-primary-light'
    $content = $content -replace 'bg-green-400', 'bg-brand-primary'
    $content = $content -replace 'bg-green-700', 'bg-brand-primary-hover'

    # from/to green
    $content = $content -replace 'from-green-50', 'from-brand-primary-light'
    $content = $content -replace 'to-green-50', 'to-brand-primary-light'
    $content = $content -replace 'from-green-500', 'from-brand-primary'
    $content = $content -replace 'to-green-500', 'to-brand-primary'

    # Only write if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nPass 3 complete!"
