# 上傳至 https://github.com/LYXiui/CHEM-IS-TRY
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host '檢查 GitHub 登入狀態…' -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host '請先登入 GitHub（瀏覽器會開啟）：' -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
}

git branch -M main

Write-Host '建立遠端儲存庫並推送…' -ForegroundColor Cyan
if (git remote get-url origin 2>$null) {
  git push -u origin main
} else {
  gh repo create CHEM-IS-TRY --public --source=. --remote=origin --push --description 'CHEM-IS-TRY — 118 元素化學實驗網頁（React + Vite）'
}

Write-Host '啟用 GitHub Pages（GitHub Actions）…' -ForegroundColor Cyan
gh api -X POST repos/LYXiui/CHEM-IS-TRY/pages -f build_type=workflow 2>$null
gh workflow run 'Deploy to GitHub Pages' --repo LYXiui/CHEM-IS-TRY 2>$null

Write-Host ''
Write-Host '完成：https://github.com/LYXiui/CHEM-IS-TRY' -ForegroundColor Green
Write-Host '線上版：https://lyxiui.github.io/CHEM-IS-TRY/' -ForegroundColor Green
