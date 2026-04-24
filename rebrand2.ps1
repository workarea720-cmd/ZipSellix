# ZipSellix Brand Recoloring Script - Pass 2
# Catches remaining emerald references that weren't caught by the first pass

$srcPath = "c:\Users\Kamran Ali\Desktop\ZipSellix\src"
$files = Get-ChildItem -Path $srcPath -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if (-not $content) { continue }
    
    $original = $content

    # Remaining emerald-400 references
    $content = $content -replace 'bg-emerald-400', 'bg-brand-primary'
    $content = $content -replace 'text-emerald-400', 'text-brand-primary'
    $content = $content -replace 'bg-emerald-200', 'bg-brand-primary-light'
    $content = $content -replace 'bg-emerald-300', 'bg-brand-primary-light'
    $content = $content -replace 'hover:bg-emerald-200', 'hover:bg-brand-primary-light'
    
    # Ring emerald-100 and emerald-200
    $content = $content -replace 'ring-emerald-100', 'ring-brand-primary-light'
    $content = $content -replace 'ring-emerald-200', 'ring-brand-primary/20'

    # focus:ring-emerald-400/10 
    $content = $content -replace 'focus:ring-emerald-400/10', 'focus:ring-brand-primary/10'

    # shadow-emerald-500/20, shadow-emerald-500/50
    $content = $content -replace 'shadow-emerald-500/20', 'shadow-brand-primary/20'
    $content = $content -replace 'shadow-emerald-500/50', 'shadow-brand-primary/50'
    $content = $content -replace 'shadow-emerald-500/30', 'shadow-brand-primary/30'
    $content = $content -replace 'shadow-red-500/50', 'shadow-red-500/50'

    # text-emerald-900
    $content = $content -replace 'text-emerald-900', 'text-brand-heading'

    # hover:text-emerald-400
    $content = $content -replace 'hover:text-emerald-400', 'hover:text-brand-primary'

    # text-emerald-50, text-emerald-100
    $content = $content -replace 'text-emerald-50', 'text-brand-primary-light'
    $content = $content -replace 'text-emerald-100', 'text-brand-primary-light'

    # placeholder:text-emerald-300
    $content = $content -replace 'placeholder:text-emerald-300', 'placeholder:text-brand-primary/40'

    # from-emerald-50
    $content = $content -replace 'from-emerald-50', 'from-brand-primary-light'
    $content = $content -replace 'from-emerald-200', 'from-brand-primary-light'
    $content = $content -replace 'to-green-50', 'to-brand-primary-light'
    $content = $content -replace 'from-green-50', 'from-brand-primary-light'
    
    # selection:bg-emerald-200
    $content = $content -replace 'selection:bg-emerald-200', 'selection:bg-brand-primary-light'

    # hover:bg-emerald-200/50
    $content = $content -replace 'hover:bg-emerald-200/50', 'hover:bg-brand-primary-light'

    # focus-within:ring-emerald-100
    $content = $content -replace 'focus-within:ring-emerald-100', 'focus-within:ring-brand-primary-light'

    # Only write if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nPass 2 complete!"
