"""Seller-only utility. Never ship private key or this tool to customers."""
import argparse,base64,json
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding,PublicFormat,PrivateFormat,NoEncryption
p=argparse.ArgumentParser(); p.add_argument('action',choices=['init','issue']); p.add_argument('--private',required=True); p.add_argument('--machine'); p.add_argument('--customer'); a=p.parse_args()
if a.action=='init':
    path=Path(a.private)
    if path.exists(): raise SystemExit('Refusing to overwrite existing key')
    k=Ed25519PrivateKey.generate(); path.write_bytes(k.private_bytes(Encoding.Raw,PrivateFormat.Raw,NoEncryption())); path.chmod(0o600)
    (Path(__file__).resolve().parents[1]/'assets/public_key.bin').write_bytes(k.public_key().public_bytes(Encoding.Raw,PublicFormat.Raw))
else:
    if not a.machine or not a.customer: p.error('--machine and --customer required')
    k=Ed25519PrivateKey.from_private_bytes(Path(a.private).read_bytes()); payload=json.dumps({'product':'AqarManagerPro','machine':a.machine.strip().upper(),'customer':a.customer},ensure_ascii=False,separators=(',',':')).encode()
    enc=lambda b:base64.urlsafe_b64encode(b).decode().rstrip('=')
    print(enc(payload)+'.'+enc(k.sign(payload)))
