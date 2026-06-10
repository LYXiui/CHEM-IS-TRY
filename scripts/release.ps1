# CHEM-IS-TRY 一鍵驗證、提交、推送並觸發 GitHub Pages 部署
param(
  [Parameter(Mandatory = $false)]
  [string]$Message = ''
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host '=== CHEM-IS-TRY Release ===' -ForegroundColor Cyan

Write-Host '[1/4] 執行測試 (test:ci)…' -ForegroundColor Yellow
npm run test:ci
if ($LASTEXITCODE -ne 0) { throw 'test:ci failed' }

Write-Host '[2/4] 建置 (build)…' -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw 'build failed' }

Write-Host '[3/4] 檢查 Git 變更…' -ForegroundColor Yellow
$status = git status --porcelain
if (-not $status) {
  Write-Host '沒有需要提交的變更。' -ForegroundColor Green
  Write-Host '線上版：https://lyxiui.github.io/CHEM-IS-TRY/' -ForegroundColor Green
  exit 0
}

if (-not $Message) {
  $Message = Read-Host '請輸入 commit 訊息'
  if (-not $Message) { throw 'commit message required (-Message)' }
}

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) { throw 'git commit failed' }

Write-Host '[4/4] 推送至 origin main…' -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'git push failed' }

Write-Host ''
Write-Host '已推送。GitHub Actions 將自動部署至 Pages。' -ForegroundColor Green
Write-Host 'Repo ：https://github.com/LYXiui/CHEM-IS-TRY' -ForegroundColor Green
Write-Host '線上版：https://lyxiui.github.io/CHEM-IS-TRY/' -ForegroundColor Green

if (Get-Command gh -ErrorAction SilentlyContinue) {
  Write-Host '部署狀態：gh run list --workflow=deploy.yml --repo LYXiui/CHEM-IS-TRY' -ForegroundColor DarkGra