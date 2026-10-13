$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if ($env:OS -ne 'Windows_NT') { throw 'Windows is required to build a Windows EXE.' }
if (!(Test-Path assets/public_key.bin)) { throw 'Initialize your seller key first. See README_AR.md.' }
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw 'Dependency install failed' }
python -m unittest discover -s tests -v
if ($LASTEXITCODE -ne 0) { throw 'Database tests failed' }
$env:QT_QPA_PLATFORM='offscreen'
$env:AQAR_DATA_DIR=Join-Path $env:TEMP ('aqar-test-'+[guid]::NewGuid())
python app.py --self-test source-test.json
if ($LASTEXITCODE -ne 0) { throw 'Source test failed' }
python -m PyInstaller --noconfirm --clean AqarManagerPro.spec
if ($LASTEXITCODE -ne 0) { throw 'EXE build failed' }
$p=Start-Process -FilePath '.\dist\AqarManagerPro\AqarManagerPro.exe' -ArgumentList '--self-test', 'frozen-test.json' -Wait -PassThru
if ($p.ExitCode -ne 0 -or !(Test-Path frozen-test.json)) { throw 'Frozen test failed' }
Remove-Item Env:QT_QPA_PLATFORM
Remove-Item Env:AQAR_DATA_DIR
$iscc=Join-Path ${env:ProgramFiles(x86)} 'Inno Setup 6\ISCC.exe'
if (!(Test-Path $iscc)) { throw 'Install Inno Setup 6 then run this script again.' }
& $iscc installer.iss
if ($LASTEXITCODE -ne 0) { throw 'Installer build failed' }
$env:QT_QPA_PLATFORM='offscreen'
$env:AQAR_DATA_DIR=Join-Path $env:TEMP ('aqar-installed-data-'+[guid]::NewGuid())
$installDir=Join-Path $env:TEMP ('aqar-installed-'+[guid]::NewGuid())
$setup=Start-Process -FilePath '.\release\AqarManagerPro_Setup.exe' -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART',"/DIR=$installDir" -Wait -PassThru
if ($setup.ExitCode -ne 0) { throw 'Installer execution failed' }
$installedExe=Join-Path $installDir 'AqarManagerPro.exe'
$p=Start-Process -FilePath $installedExe -ArgumentList '--self-test','installed-test.json' -Wait -PassThru
if ($p.ExitCode -ne 0 -or !(Test-Path installed-test.json)) { throw 'Installed EXE test failed' }
$dataFile=Join-Path $env:AQAR_DATA_DIR 'aqar.sqlite3'
if (!(Test-Path $dataFile)) { throw 'External database missing' }
$desktop=[Environment]::GetFolderPath('Desktop')
if (!(Test-Path (Join-Path $desktop 'AqarManagerPro.lnk'))) { throw 'Desktop shortcut missing' }
$upgrade=Start-Process -FilePath '.\release\AqarManagerPro_Setup.exe' -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART',"/DIR=$installDir" -Wait -PassThru
if ($upgrade.ExitCode -ne 0 -or !(Test-Path $dataFile)) { throw 'Upgrade failed' }
$uninstall=Start-Process -FilePath (Join-Path $installDir 'unins000.exe') -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART' -Wait -PassThru
if ($uninstall.ExitCode -ne 0 -or !(Test-Path $dataFile)) { throw 'Uninstall data preservation failed' }
@{install='passed'; installed_exe='passed'; desktop_shortcut='passed'; reinstall='passed'; external_data_survives_uninstall='passed'; os=[Environment]::OSVersion.VersionString} | ConvertTo-Json | Set-Content release\installer-test.json
Copy-Item installed-test.json release
Remove-Item Env:QT_QPA_PLATFORM
Remove-Item Env:AQAR_DATA_DIR
Compress-Archive -Path dist\AqarManagerPro -DestinationPath release\AqarManagerPro-Portable.zip -Force
Copy-Item source-test.json,frozen-test.json release
python tools/package_source.py
if ($LASTEXITCODE -ne 0) { throw 'Source packaging failed' }
python -m PyInstaller --noconfirm --clean --onedir --windowed --name AqarSellerLicenseTool --distpath seller-dist --workpath seller-build tools/seller_gui.py
if ($LASTEXITCODE -ne 0) { throw 'Seller tool build failed' }
Compress-Archive -Path seller-dist\AqarSellerLicenseTool -DestinationPath release\AqarManagerPro-Seller-Tool.zip -Force
Write-Host 'Build complete. See release folder.' 
