from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
with zipfile.ZipFile(root/'release/AqarManagerPro-Source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in root.rglob('*'):
  rel=f.relative_to(root)
  if f.is_file() and not any(x in {'build','dist','release','__pycache__','seller-build','seller-dist'} for x in rel.parts) and not f.name.endswith('test.json'):
   z.write(f,Path('AqarManagerPro')/rel)
 workflow=root.parent/'.github/workflows/aqar-windows.yml'
 if workflow.exists():z.write(workflow,'.github/workflows/aqar-windows.yml')
