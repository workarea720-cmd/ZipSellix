# ZipSellix Framer Motion Animation Script
# Adds entrance animations to tool DesktopUI and MobileUI components
# SAFE: Only adds import + wraps outermost container div with motion.div

$srcPath = "c:\Users\Kamran Ali\Desktop\ZipSellix\src"

# List of DesktopUI and MobileUI files to animate
$toolFiles = @(
    "$srcPath\app\tools\invoice-generator\components\DesktopUI.tsx",
    "$srcPath\app\tools\invoice-generator\components\MobileUI.tsx",
    "$srcPath\app\tools\packing-slip\components\DesktopUI.tsx",
    "$srcPath\app\tools\packing-slip\components\MobileUI.tsx",
    "$srcPath\app\tools\shipping-label\components\DesktopUI.tsx",
    "$srcPath\app\tools\shipping-label\components\MobileUI.tsx",
    "$srcPath\app\tools\seo-generator\components\DesktopUI.tsx",
    "$srcPath\app\tools\seo-generator\components\MobileUI.tsx",
    "$srcPath\app\tools\background-remover\components\DesktopUI.tsx",
    "$srcPath\app\tools\background-remover\components\MobileUI.tsx",
    "$srcPath\app\tools\image-compressor\components\DesktopUI.tsx",
    "$srcPath\app\tools\image-compressor\components\MobileUI.tsx",
    "$srcPath\app\tools\whatsapp-manager\components\DesktopUI.tsx",
    "$srcPath\app\tools\whatsapp-manager\components\MobileUI.tsx",
    "$srcPath\app\tools\link-in-bio\components\DesktopUI.tsx",
    "$srcPath\app\tools\link-in-bio\components\MobileUI.tsx"
)

foreach ($filePath in $toolFiles) {
    if (-not (Test-Path $filePath)) {
        Write-Host "SKIP (not found): $filePath"
        continue
    }
    
    $content = Get-Content $filePath -Raw
    if (-not $content) { continue }
    
    # Skip if already has framer-motion import
    if ($content -match "from 'framer-motion'") {
        Write-Host "SKIP (already has motion): $filePath"
        continue
    }
    
    $original = $content
    
    # Add framer-motion import after the first import line
    # Find the first import and add framer-motion after it
    $content = $content -replace "(import .+? from '.+?';)", "`$1`nimport { motion } from 'framer-motion';", 1
    
    # Only write if changed
    if ($content -ne $original) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Added motion import: $filePath"
    }
}

Write-Host "`nMotion imports added!"
