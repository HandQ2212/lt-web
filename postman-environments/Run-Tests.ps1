# ELC System API - Automated Role-Based Testing Script
# Dùng Newman để test tất cả roles cùng lúc
# Requirement: npm install -g newman newman-reporter-htmlextra

param(
    [string]$Role = "all",  # all, teacher, manager, student, accountant
    [string]$Folder = "",   # Để trống = test tất cả, hoặc chỉ định folder
    [switch]$GenerateHtml   # Tạo HTML report
)

# Configuration
$CollectionPath = ".\ELC_System_API_Postman_Collection_v2.json"
$EnvironmentDir = ".\postman-environments"
$ReportDir = ".\postman-test-reports"

# Roles to test
$Roles = @{
    "teacher" = @{
        "env" = "$EnvironmentDir\TEACHER-env.json"
        "name" = "TEACHER Environment"
    }
    "manager" = @{
        "env" = "$EnvironmentDir\MANAGER-env.json"
        "name" = "MANAGER Environment"
    }
    "student" = @{
        "env" = "$EnvironmentDir\STUDENT-env.json"
        "name" = "STUDENT Environment"
    }
    "accountant" = @{
        "env" = "$EnvironmentDir\ACCOUNTANT-env.json"
        "name" = "ACCOUNTANT Environment"
    }
}

# Check if collection exists
if (-not (Test-Path $CollectionPath)) {
    Write-Host "❌ Collection file not found: $CollectionPath" -ForegroundColor Red
    exit 1
}

# Create report directory
if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
    Write-Host "📁 Created report directory: $ReportDir"
}

# Function to run test
function Run-Test {
    param(
        [string]$RoleName,
        [string]$EnvironmentPath,
        [string]$RoleDisplayName
    )
    
    Write-Host "`n================================" -ForegroundColor Cyan
    Write-Host "🧪 Testing $RoleDisplayName" -ForegroundColor Cyan
    Write-Host "================================`n" -ForegroundColor Cyan
    
    # Check environment file
    if (-not (Test-Path $EnvironmentPath)) {
        Write-Host "❌ Environment file not found: $EnvironmentPath" -ForegroundColor Red
        return $false
    }
    
    # Build command
    $cmd = "newman run `"$CollectionPath`" -e `"$EnvironmentPath`""
    
    # Add folder filter if specified
    if ($Folder) {
        $cmd += " --folder `"$Folder`""
    }
    
    # Add reporters
    $cmd += " --reporters cli,json"
    
    # Add HTML reporter if requested
    if ($GenerateHtml) {
        $htmlReportFile = "$ReportDir\$RoleName`_report.html"
        $cmd += ",htmlextra"
        $cmd += " --reporter-htmlextra-export `"$htmlReportFile`""
    }
    
    # Add JSON export
    $jsonReportFile = "$ReportDir\$RoleName`_results.json"
    $cmd += " --reporter-json-export `"$jsonReportFile`""
    
    Write-Host "📊 Report: $jsonReportFile"
    
    # Run test
    Invoke-Expression $cmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ $RoleDisplayName testing completed successfully`n" -ForegroundColor Green
        return $true
    } else {
        Write-Host "`n⚠️  $RoleDisplayName testing had failures`n" -ForegroundColor Yellow
        return $false
    }
}

# Main execution
Write-Host "`n🚀 ELC System API - Role-Based Testing`n" -ForegroundColor Magenta
Write-Host "Collection: $CollectionPath" -ForegroundColor Gray
Write-Host "Environment Dir: $EnvironmentDir" -ForegroundColor Gray
Write-Host "Report Dir: $ReportDir`n" -ForegroundColor Gray

if ($Role -eq "all") {
    Write-Host "📌 Running tests for ALL roles...`n" -ForegroundColor Yellow
    
    $results = @{}
    foreach ($roleName in $Roles.Keys) {
        $results[$roleName] = Run-Test -RoleName $roleName `
                                        -EnvironmentPath $Roles[$roleName].env `
                                        -RoleDisplayName $Roles[$roleName].name
    }
    
    # Summary
    Write-Host "`n================================" -ForegroundColor Cyan
    Write-Host "📋 TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "================================`n" -ForegroundColor Cyan
    
    foreach ($roleName in $Roles.Keys) {
        $status = if ($results[$roleName]) { "✅ PASSED" } else { "❌ FAILED" }
        Write-Host "$status - $($Roles[$roleName].name)"
    }
    
} elseif ($Roles.ContainsKey($Role)) {
    Write-Host "📌 Running test for $Role role...`n" -ForegroundColor Yellow
    
    Run-Test -RoleName $Role `
             -EnvironmentPath $Roles[$Role].env `
             -RoleDisplayName $Roles[$Role].name
} else {
    Write-Host "❌ Invalid role: $Role" -ForegroundColor Red
    Write-Host "`nValid roles: all, teacher, manager, student, accountant" -ForegroundColor Yellow
    exit 1
}

# Show generated reports
Write-Host "`n📁 Generated Reports:`n" -ForegroundColor Cyan
Get-ChildItem -Path $ReportDir | ForEach-Object {
    Write-Host "   - $($_.Name)"
}

Write-Host "`n✨ Testing complete!`n" -ForegroundColor Green

# If HTML generated, show location
if ($GenerateHtml) {
    Write-Host "💻 Open HTML reports in browser:" -ForegroundColor Cyan
    $ReportDir | ForEach-Object {
        $htmlFiles = Get-ChildItem -Path $_ -Filter "*.html" | ForEach-Object { $_.FullName }
        $htmlFiles | ForEach-Object {
            Write-Host "   explorer $_"
        }
    }
}
