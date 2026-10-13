[Setup]
AppId={{82F09E79-14DA-4E58-9167-3705E675AD8A}
AppName=AqarManagerPro
AppVersion=1.0.0
DefaultDirName={localappdata}\Programs\AqarManagerPro
PrivilegesRequired=lowest
OutputDir=release
OutputBaseFilename=AqarManagerPro_Setup
SetupIconFile=assets\app.ico
UninstallDisplayIcon={app}\AqarManagerPro.exe
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
[Files]
Source: "dist\AqarManagerPro\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "CUSTOMER_GUIDE_AR.txt"; DestDir: "{app}"; Flags: ignoreversion
[Icons]
Name: "{userdesktop}\AqarManagerPro"; Filename: "{app}\AqarManagerPro.exe"
Name: "{userprograms}\AqarManagerPro"; Filename: "{app}\AqarManagerPro.exe"
[Run]
Filename: "{app}\AqarManagerPro.exe"; Description: "Launch AqarManagerPro"; Flags: nowait postinstall skipifsilent
