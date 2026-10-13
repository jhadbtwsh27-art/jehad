import sys, tempfile, unittest, sqlite3
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from core import Store
class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.s=Store(Path(self.tmp.name)/'db')
    def tearDown(self): self.s.close(); self.tmp.cleanup()
    def test_relations_and_persistence(self):
        c=self.s.save('customers',['عميل','TEST-PHONE','']); p=self.s.save('properties',['بيت','','','','متاح','1.25',str(c)])
        with self.assertRaises(sqlite3.IntegrityError):self.s.delete('customers',c)
        self.s.save('properties',['بيت','','','','متاح','2.75',str(c)],p)
        self.s.backup(Path(self.tmp.name)/'copy'); self.s.close(); self.s=Store(Path(self.tmp.name)/'copy')
        self.assertEqual(self.s.rows('properties')[0][6],275)
    def test_invalid_contract_and_money(self):
        c=self.s.save('customers',['اسم','TEST-PHONE','']); p=self.s.save('properties',['بيت','','','','','5',str(c)])
        for amount in ['-1','NaN','1.111']:
            with self.assertRaises(ValueError):self.s.save('contracts',[str(p),str(c),'إيجار','2026-01-01','2026-12-31',amount,''])
        with self.assertRaises(ValueError):self.s.save('contracts',[str(p),str(c),'إيجار','2026-12-01','2026-01-01','1',''])
        self.assertEqual(self.s.rows('contracts'),[])
if __name__=='__main__':unittest.main()
