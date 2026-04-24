# ZipSellix Brand Recoloring Script
# Replaces emerald/green Tailwind classes with brand-primary tokens across all .tsx files in src/
# Safe: only touches className strings, no logic changes

$srcPath = "c:\Users\Kamran Ali\Desktop\ZipSellix\src"

# Get all .tsx files
$files = Get-ChildItem -Path $srcPath -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if (-not $content) { continue }
    
    $original = $content

    # ── Primary Color Swaps (emerald → brand-primary / brand-primary-light) ──

    # Backgrounds
    $content = $content -replace 'bg-emerald-600', 'bg-brand-primary'
    $content = $content -replace 'bg-emerald-700', 'bg-brand-primary-hover'
    $content = $content -replace 'bg-emerald-500', 'bg-brand-primary'
    $content = $content -replace 'bg-emerald-50', 'bg-brand-primary-light'
    $content = $content -replace 'bg-emerald-100', 'bg-brand-primary-light'
    $content = $content -replace "bg-\[#10b981\]", 'bg-brand-primary'
    $content = $content -replace "bg-\[#bbf7d0\]", 'bg-brand-primary-light'

    # Text colors
    $content = $content -replace 'text-emerald-700', 'text-brand-primary'
    $content = $content -replace 'text-emerald-800', 'text-brand-primary'
    $content = $content -replace 'text-emerald-600', 'text-brand-primary'
    $content = $content -replace 'text-emerald-500', 'text-brand-primary'
    $content = $content -replace "text-\[#10b981\]", 'text-brand-primary'
    $content = $content -replace "text-\[#065f46\]", 'text-brand-primary'

    # Border colors
    $content = $content -replace 'border-emerald-500', 'border-brand-primary'
    $content = $content -replace 'border-emerald-400', 'border-brand-primary'
    $content = $content -replace 'border-emerald-300', 'border-brand-primary'
    $content = $content -replace 'border-emerald-200', 'border-brand-primary/30'
    $content = $content -replace 'border-emerald-100', 'border-brand-primary/20'
    $content = $content -replace "border-\[#10b981\]", 'border-brand-primary'

    # Focus rings
    $content = $content -replace 'focus:ring-emerald-500', 'focus:ring-brand-primary'
    $content = $content -replace 'focus:ring-emerald-50', 'focus:ring-brand-primary-light'
    $content = $content -replace 'focus:ring-emerald-100', 'focus:ring-brand-primary-light'
    $content = $content -replace 'ring-emerald-500', 'ring-brand-primary'
    $content = $content -replace 'ring-emerald-50', 'ring-brand-primary-light'
    $content = $content -replace "ring-emerald-500/20", 'ring-brand-primary/20'

    # Focus border
    $content = $content -replace 'focus:border-emerald-500', 'focus:border-brand-primary'
    $content = $content -replace 'focus:border-emerald-400', 'focus:border-brand-primary'
    $content = $content -replace 'focus:border-emerald-300', 'focus:border-brand-primary'
    $content = $content -replace "focus:border-\[#10b981\]", 'focus:border-brand-primary'
    $content = $content -replace "focus:ring-\[#10b981\]", 'focus:ring-brand-primary'

    # Hover backgrounds
    $content = $content -replace 'hover:bg-emerald-700', 'hover:bg-brand-primary-hover'
    $content = $content -replace 'hover:bg-emerald-600', 'hover:bg-brand-primary'
    $content = $content -replace 'hover:bg-emerald-100', 'hover:bg-brand-primary-light'
    $content = $content -replace 'hover:bg-emerald-50', 'hover:bg-brand-primary-light'

    # Hover text
    $content = $content -replace 'hover:text-emerald-800', 'hover:text-brand-primary'
    $content = $content -replace 'hover:text-emerald-700', 'hover:text-brand-primary'
    $content = $content -replace 'hover:text-emerald-600', 'hover:text-brand-primary'
    $content = $content -replace 'hover:text-emerald-500', 'hover:text-brand-primary'

    # Hover border
    $content = $content -replace 'hover:border-emerald-400', 'hover:border-brand-primary'
    $content = $content -replace 'hover:border-emerald-300', 'hover:border-brand-primary'

    # Shadow
    $content = $content -replace 'shadow-emerald-600/30', 'shadow-brand-primary/30'
    $content = $content -replace 'shadow-emerald-600/20', 'shadow-brand-primary/20'
    $content = $content -replace 'shadow-emerald-200', 'shadow-brand-primary/20'
    $content = $content -replace 'shadow-emerald-100', 'shadow-brand-primary/10'
    $content = $content -replace "shadow-emerald-500/10", 'shadow-brand-primary/10'

    # Accent
    $content = $content -replace 'accent-emerald-600', 'accent-brand-primary'

    # Group hover
    $content = $content -replace 'group-hover:text-emerald-500', 'group-hover:text-brand-primary'
    $content = $content -replace 'group-hover:text-emerald-600', 'group-hover:text-brand-primary'

    # focus:bg
    $content = $content -replace 'focus:bg-emerald-50', 'focus:bg-brand-primary-light'

    # Selection
    $content = $content -replace 'selection:bg-emerald-100', 'selection:bg-brand-primary-light'
    $content = $content -replace 'selection:text-emerald-900', 'selection:text-brand-primary'

    # Green classes (from invoice template selector)
    $content = $content -replace 'bg-green-50', 'bg-brand-primary-light'
    $content = $content -replace 'bg-green-100', 'bg-brand-primary-light'
    $content = $content -replace 'bg-green-200', 'bg-brand-primary-light'
    $content = $content -replace 'bg-green-600', 'bg-brand-primary'
    $content = $content -replace 'border-green-500', 'border-brand-primary'
    $content = $content -replace 'border-green-300', 'border-brand-primary'
    $content = $content -replace 'text-green-700', 'text-brand-primary'
    $content = $content -replace 'text-green-600', 'text-brand-primary'

    # Hex-based emerald colors in style/className 
    $content = $content -replace "bg-\[#f0fdf4\]", 'bg-brand-primary-light'

    # ── Gradients / from/to/via ──
    $content = $content -replace 'from-emerald-500', 'from-brand-primary'
    $content = $content -replace 'via-emerald-500', 'via-brand-primary'
    $content = $content -replace 'to-emerald-500', 'to-brand-primary'
    $content = $content -replace 'from-emerald-600', 'from-brand-primary'
    $content = $content -replace 'to-emerald-600', 'to-brand-primary'

    # ── Dark (brand-secondary) action buttons: bg-slate-900/bg-[#0f172a] → brand-secondary ──
    $content = $content -replace "bg-\[#0f172a\]", 'bg-brand-secondary'
    $content = $content -replace 'bg-slate-900', 'bg-brand-secondary'
    $content = $content -replace 'bg-slate-950', 'bg-brand-secondary'
    $content = $content -replace 'hover:bg-black', 'hover:bg-brand-secondary-hover'
    $content = $content -replace "text-\[#0f172a\]", 'text-brand-heading'
    
    # ── Heading text colors ──  
    $content = $content -replace 'text-slate-900', 'text-brand-heading'

    # Only write if changed
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nDone! All emerald/green references replaced with brand tokens."
