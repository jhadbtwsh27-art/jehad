import os, sqlite3, json, base64, hashlib, platform, uuid
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
ROOT = Path(__file__).resolve().parent

def data_dir():
    d = Path(os.environ.get('AQAR_DATA_DIR') or Path(os.environ.get('LOCALAPPDATA', Path.home()/'.local/share'))/'AqarManagerPro')
    d.mkdir(parents=True, exist_ok=True)
    return d

def machine_id():
    if platform.system() == 'Windows':
        import winreg
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r'SOFTWARE\Microsoft\Cryptography', 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY) as k:
            value = winreg.QueryValueEx(k, 'MachineGuid')[0]
    else:
        value = str(uuid.getnode())
    return hashlib.sha256(value.encode()).hexdigest()[:24].upper()

def verify(token, public=None):
    try:
        a,b=token.strip().split('.')
        payload=base64.urlsafe_b64decode(a+'='*(-len(a)%4))
        signature=base64.urlsafe_b64decode(b+'='*(-len(b)%4))
        public=public or (ROOT/'assets/public_key.bin').read_bytes()
        Ed25519PublicKey.from_public_bytes(public).verify(signature,payload)
        obj=json.loads(payload)
        return obj['product']=='AqarManagerPro' and obj['machine']==machine_id() and bool(obj['customer'])
    except Exception:
        return False

def licensed():
    f=data_dir()/'license.txt'
    return f.exists() and verify(f.read_text())

FIELDS={
 'customers':[('name','الاسم'),('phone','الهاتف'),('notes','ملاحظات')],
 'properties':[('title','اسم العقار'),('city','المدينة'),('address','العنوان'),('kind','النوع'),('status','الحالة'),('price','السعر بالدينار'),('owner_id','رقم العميل المالك')],
 'contracts':[('property_id','رقم العقار'),('customer_id','رقم العميل'),('kind','بيع / إيجار'),('start_date','تاريخ البداية YYYY-MM-DD'),('end_date','تاريخ النهاية YYYY-MM-DD'),('amount','القيمة بالدينار'),('notes','ملاحظات')]
}
class Store:
    def __init__(self,path=None):
        self.path=Path(path or data_dir()/'aqar.sqlite3')
        self.db=sqlite3.connect(self.path)
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY,name TEXT NOT NULL,phone TEXT NOT NULL,notes TEXT);
        CREATE TABLE IF NOT EXISTS properties(id INTEGER PRIMARY KEY,title TEXT NOT NULL,city TEXT,address TEXT,kind TEXT,status TEXT,price INTEGER CHECK(price>=0),owner_id INTEGER REFERENCES customers(id));
        CREATE TABLE IF NOT EXISTS contracts(id INTEGER PRIMARY KEY,property_id INTEGER NOT NULL REFERENCES properties(id),customer_id INTEGER NOT NULL REFERENCES customers(id),kind TEXT,start_date TEXT,end_date TEXT,amount INTEGER CHECK(amount>=0),notes TEXT);
        PRAGMA user_version=1;
        ''')
        self.db.commit()
    def rows(self,table):
        if table not in FIELDS: raise ValueError('table')
        return self.db.execute('SELECT * FROM '+table+' ORDER BY id DESC').fetchall()
    def save(self,table,values,record=None):
        fields=[x[0] for x in FIELDS[table]]
        if len(values)!=len(fields): raise ValueError('fields')
        if table=='customers' and (not values[0].strip() or not values[1].strip()): raise ValueError('الاسم والهاتف مطلوبان')
        if table=='properties' and not values[0].strip(): raise ValueError('اسم العقار مطلوب')
        for i,f in enumerate(fields):
            if f in ('price','amount'):
                from decimal import Decimal
                v=Decimal(str(values[i]))
                if not v.is_finite() or v<0 or v.as_tuple().exponent < -2: raise ValueError('قيمة مالية غير صحيحة: منزلتان عشريتان كحد أقصى')
                values[i]=int(v*100)
            if f.endswith('_id'):
                values[i]=int(values[i]) if str(values[i]).strip() else None
        if table=='contracts':
            from datetime import date
            start=date.fromisoformat(values[3]); end=date.fromisoformat(values[4]) if values[4] else start
            if end<start: raise ValueError('نهاية العقد تسبق البداية')
        with self.db:
            if record is None:
                return self.db.execute('INSERT INTO '+table+' ('+','.join(fields)+') VALUES ('+','.join('?' for _ in fields)+')',values).lastrowid
            self.db.execute('UPDATE '+table+' SET '+','.join(f+'=?' for f in fields)+' WHERE id=?',values+[record])
    def delete(self,table,record):
        if table not in FIELDS: raise ValueError('table')
        with self.db: self.db.execute('DELETE FROM '+table+' WHERE id=?',(record,))
    def backup(self,target):
        if Path(target).resolve()==self.path.resolve(): raise ValueError('اختر ملفًا مختلفًا')
        out=sqlite3.connect(target)
        try:
            self.db.backup(out)
        finally:
            out.close()
    def close(self): self.db.close()
