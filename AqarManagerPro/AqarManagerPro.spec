from pathlib import Path
root=Path(SPECPATH)
a=Analysis([str(root/'app.py')],pathex=[str(root)],binaries=[],datas=[(str(root/'assets'),'assets')],hiddenimports=['PySide6.QtPrintSupport'],hookspath=[],hooksconfig={},runtime_hooks=[],excludes=[],noarchive=False)
pyz=PYZ(a.pure)
exe=EXE(pyz,a.scripts,[],exclude_binaries=True,name='AqarManagerPro',debug=False,bootloader_ignore_signals=False,strip=False,upx=False,console=False,icon=str(root/'assets/app.ico'))
coll=COLLECT(exe,a.binaries,a.datas,strip=False,upx=False,name='AqarManagerPro')
