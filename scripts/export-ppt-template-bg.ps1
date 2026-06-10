$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root 'presentations\assets'
$folder = Get-ChildItem 'D:\PPT' -Directory | Select-Object -First 1
if (-not $folder) { throw 'Template folder not found under D:\PPT' }
$pptx = Join-Path $folder.FullName '_new_3241083.pptx'
if (-not (Test-Path $pptx)) { throw "Template not found: $pptx" }
New-Item -ItemType Directory -Force -Path $out | Out-Null

$app = New-Object -ComObject PowerPoint.Application
$pres = $app.Presentations.Open($pptx, $true, $false, $false)

$s1 = $pres.Slides.Item(1)
foreach ($i in 4, 5) {
  $sh = $s1.Shapes.Item($i)
  if ($sh.HasTextFrame -eq -1) { $sh.TextFrame.TextRange.Text = '' }
  $sh.Visible = 0
}

$s15 = $pres.Slides.Item(15)
$grp = $s15.Shapes.Item(1)
$titleShape = $grp.GroupItems.Item(1)
if ($titleShape.HasTextFrame -eq -1) { $titleShape.TextFrame.TextRange.Text = '' }
$titleShape.Visible = 0
for ($i = $s15.Shapes.Count; $i -ge 2; $i--) {
  $sh = $s15.Shapes.Item($i)
  if ($sh.HasTextFrame -eq -1) { $sh.Delete() }
}

$s1.Export((Join-Path $out 'template-slide01.png'), 'PNG', 1920, 1080)
$s15.Export((Join-Path $out 'template-slide15.png'), 'PNG', 1920, 1080)

$pres.Close()
$app.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($app) | Out-Null
Write-Host "Exported clean backgrounds to $out"
