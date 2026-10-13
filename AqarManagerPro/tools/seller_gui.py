import json,base64,sys
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication,QWidget,QFormLayout,QLineEdit,QPushButton,QFileDialog,QMessageBox,QPlainTextEdit
class Seller(QWidget):
 def __init__(self):
  super().__init__();self.setWindowTitle('AqarManagerPro — إصدار التفعيل للبائع فقط');self.resize(720,360);self.path=None
  l=QFormLayout(self); b=QPushButton('اختيار ملف المفتاح الخاص aqar.private');b.clicked.connect(self.select);l.addRow(b)
  self.machine=QLineEdit();self.customer=QLineEdit();l.addRow('رمز جهاز العميل',self.machine);l.addRow('اسم العميل',self.customer)
  b=QPushButton('إصدار مفتاح التفعيل');b.clicked.connect(self.issue);l.addRow(b);self.output=QPlainTextEdit();self.output.setReadOnly(True);l.addRow(self.output)
  b=QPushButton('نسخ المفتاح');b.clicked.connect(lambda:QApplication.clipboard().setText(self.output.toPlainText()));l.addRow(b)
 def select(self):
  f,_=QFileDialog.getOpenFileName(self,'مفتاح البائع','','Private key (*.private)')
  if f:self.path=f
 def issue(self):
  try:
   mid=self.machine.text().strip().upper(); customer=self.customer.text().strip()
   if not self.path or not customer or len(mid)!=24 or any(c not in '0123456789ABCDEF' for c in mid):raise ValueError('اختر المفتاح الخاص وأدخل اسم العميل ورمز الجهاز الصحيح')
   k=Ed25519PrivateKey.from_private_bytes(Path(self.path).read_bytes());payload=json.dumps({'product':'AqarManagerPro','machine':mid,'customer':customer},ensure_ascii=False,separators=(',',':')).encode();enc=lambda b:base64.urlsafe_b64encode(b).decode().rstrip('=');self.output.setPlainText(enc(payload)+'.'+enc(k.sign(payload)))
  except Exception as e:QMessageBox.warning(self,'تعذر التفعيل',str(e))
if __name__=='__main__':
 a=QApplication(sys.argv);a.setLayoutDirection(Qt.RightToLeft);w=Seller();w.show();sys.exit(a.exec())
