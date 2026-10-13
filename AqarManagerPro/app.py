import sys, html, json, tempfile, traceback
from pathlib import Path
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont, QFontDatabase, QIcon, QTextDocument
from PySide6.QtWidgets import (QApplication,QMainWindow,QWidget,QVBoxLayout,QHBoxLayout,QPushButton,QTabWidget,QTableWidget,QTableWidgetItem,QLineEdit,QLabel,QDialog,QFormLayout,QDialogButtonBox,QMessageBox,QFileDialog,QAbstractItemView)
from PySide6.QtPrintSupport import QPrinter,QPrintDialog
from core import *

def report_html(title, headers, rows):
    esc=lambda s: html.escape(str(s))
    return '<html dir="rtl"><body style="font-family:DejaVu Sans"><h1>'+esc(title)+'</h1><table border="1" cellspacing="0" cellpadding="5"><tr>'+''.join('<th>'+esc(x)+'</th>' for x in headers)+'</tr>'+''.join('<tr>'+''.join('<td>'+esc(x if x is not None else '')+'</td>' for x in r)+'</tr>' for r in rows)+'</table></body></html>'

def display_rows(table,rows):
    money=[i+1 for i,(f,_) in enumerate(FIELDS[table]) if f in ('price','amount')]
    return [[f'{v/100:.2f}' if i in money and v is not None else v for i,v in enumerate(r)] for r in rows]

class Activation(QDialog):
    def __init__(self):
        super().__init__(); self.setWindowTitle('تفعيل AqarManagerPro'); self.resize(600,220)
        l=QVBoxLayout(self); l.addWidget(QLabel('أرسل رمز الجهاز للبائع للحصول على مفتاح التفعيل'))
        mid=QLineEdit(machine_id()); mid.setReadOnly(True); l.addWidget(mid)
        self.token=QLineEdit(); self.token.setPlaceholderText('مفتاح التفعيل'); l.addWidget(self.token)
        b=QPushButton('تفعيل'); b.clicked.connect(self.activate); l.addWidget(b)
    def activate(self):
        if verify(self.token.text()):
            (data_dir()/'license.txt').write_text(self.token.text().strip()); self.accept()
        else: QMessageBox.warning(self,'التفعيل','المفتاح غير صحيح أو مخصص لجهاز آخر')

class Editor(QDialog):
    def __init__(self,table,row=None):
        super().__init__(); self.setWindowTitle('بيانات السجل'); self.inputs=[]
        layout=QFormLayout(self)
        for i,(_,label) in enumerate(FIELDS[table]):
            e=QLineEdit('' if row is None or row[i+1] is None else str(row[i+1])); layout.addRow(label,e); self.inputs.append(e)
        b=QDialogButtonBox(QDialogButtonBox.Ok|QDialogButtonBox.Cancel); b.accepted.connect(self.accept); b.rejected.connect(self.reject); layout.addRow(b)

class Window(QMainWindow):
    def __init__(self):
        super().__init__(); self.store=Store(); self.setWindowTitle('AqarManagerPro — إدارة العقارات'); self.resize(1150,720)
        self.setWindowIcon(QIcon(str(ROOT/'assets/app.ico')))
        host=QWidget(); self.setCentralWidget(host); lay=QVBoxLayout(host)
        self.summary=QLabel(); lay.addWidget(self.summary)
        bar=QHBoxLayout(); lay.addLayout(bar)
        for title,fn in [('نسخة احتياطية',self.backup),('مكان البيانات',lambda:QMessageBox.information(self,'البيانات',str(data_dir())))]:
            b=QPushButton(title); b.clicked.connect(fn); bar.addWidget(b)
        self.tabs=QTabWidget(); lay.addWidget(self.tabs); self.tables={}; self.search={}
        for table,title in [('customers','العملاء'),('properties','العقارات'),('contracts','العقود')]:
            page=QWidget(); box=QVBoxLayout(page); search=QLineEdit(); search.setPlaceholderText('بحث في جميع الحقول'); box.addWidget(search); self.search[table]=search
            search.textChanged.connect(lambda _,t=table:self.refresh(t))
            actions=QHBoxLayout(); box.addLayout(actions)
            for label,method in [('إضافة',self.add),('تعديل',self.edit),('حذف',self.remove),('طباعة',self.print_table),('تصدير PDF',self.pdf)]:
                b=QPushButton(label); b.clicked.connect(lambda _,t=table,m=method:m(t)); actions.addWidget(b)
            grid=QTableWidget(); grid.setColumnCount(len(FIELDS[table])+1); grid.setHorizontalHeaderLabels(['الرقم']+[x[1] for x in FIELDS[table]])
            grid.setSelectionBehavior(QAbstractItemView.SelectRows); grid.setSelectionMode(QAbstractItemView.SingleSelection); grid.setEditTriggers(QAbstractItemView.NoEditTriggers)
            box.addWidget(grid); self.tables[table]=grid; self.tabs.addTab(page,title)
        self.refresh_all()
    def refresh_all(self):
        for t in FIELDS:self.refresh(t)
        self.summary.setText('العملاء: %d    |    العقارات: %d    |    العقود: %d'%tuple(len(self.store.rows(t)) for t in FIELDS))
    def refresh(self,t):
        g=self.tables[t]; q=self.search[t].text().casefold(); rows=display_rows(t,self.store.rows(t)); rows=[r for r in rows if q in ' '.join(str(x) for x in r).casefold()]
        g.setRowCount(len(rows))
        for i,r in enumerate(rows):
            for j,v in enumerate(r):g.setItem(i,j,QTableWidgetItem('' if v is None else str(v)))
        g.resizeColumnsToContents()
    def selected(self,t):
        g=self.tables[t]; i=g.currentRow()
        if i<0: QMessageBox.information(self,'اختيار','اختر سجلًا أولًا'); return None
        return [g.item(i,j).text() for j in range(g.columnCount())]
    def form(self,t,row=None):
        dlg=Editor(t,row)
        while dlg.exec()==QDialog.Accepted:
            try:
                self.store.save(t,[e.text().strip() for e in dlg.inputs],int(row[0]) if row else None); self.refresh_all(); return
            except Exception as e: QMessageBox.warning(self,'تعذر الحفظ',str(e))
    def add(self,t):self.form(t)
    def edit(self,t):
        row=self.selected(t)
        if row:self.form(t,row)
    def remove(self,t):
        row=self.selected(t)
        if row and QMessageBox.question(self,'حذف','هل تريد حذف السجل؟')==QMessageBox.Yes:
            try:self.store.delete(t,int(row[0])); self.refresh_all()
            except Exception as e:QMessageBox.warning(self,'تعذر الحذف','السجل مرتبط ببيانات أخرى. '+str(e))
    def doc(self,t):
        g=self.tables[t]; d=QTextDocument(); d.setDefaultFont(QFont('DejaVu Sans',10))
        d.setHtml(report_html(self.tabs.tabText(list(FIELDS).index(t)),['الرقم']+[x[1] for x in FIELDS[t]],[[g.item(i,j).text() for j in range(g.columnCount())] for i in range(g.rowCount())])); return d
    def print_table(self,t):
        p=QPrinter(QPrinter.HighResolution); dialog=QPrintDialog(p,self)
        if dialog.exec()==QDialog.Accepted:self.doc(t).print_(p)
    def pdf(self,t):
        f,_=QFileDialog.getSaveFileName(self,'تصدير PDF','','PDF (*.pdf)')
        if f:
            if not f.lower().endswith('.pdf'):f+='.pdf'
            p=QPrinter(QPrinter.HighResolution); p.setOutputFormat(QPrinter.PdfFormat); p.setOutputFileName(f); self.doc(t).print_(p)
    def backup(self):
        f,_=QFileDialog.getSaveFileName(self,'حفظ نسخة احتياطية','aqar-backup.sqlite3','SQLite (*.sqlite3)')
        if f:
            try:self.store.backup(f); QMessageBox.information(self,'تم','تم حفظ النسخة الاحتياطية')
            except Exception as e:QMessageBox.warning(self,'خطأ',str(e))
    def closeEvent(self,e):self.store.close(); e.accept()

def self_test(output):
    assert (ROOT/'assets/public_key.bin').stat().st_size==32
    assert (ROOT/'assets/DejaVuSans.ttf').exists()
    assert not QIcon(str(ROOT/'assets/app.ico')).isNull()
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives.serialization import Encoding,PublicFormat
    with tempfile.TemporaryDirectory() as td:
        s=Store(Path(td)/'test.sqlite3'); c=s.save('customers',['عميل تجريبي','TEST-PHONE','']); p=s.save('properties',['شقة','عمان','شارع','شقة','متاح','125.50',str(c)])
        s.save('contracts',[str(p),str(c),'إيجار','2026-01-01','2026-12-31','20.25','']); s.backup(Path(td)/'backup.db')
        assert s.rows('properties')[0][6]==12550
        key=Ed25519PrivateKey.generate(); payload=json.dumps({'product':'AqarManagerPro','machine':machine_id(),'customer':'test'}).encode(); enc=lambda b:base64.urlsafe_b64encode(b).decode().rstrip('=')
        token=enc(payload)+'.'+enc(key.sign(payload)); pub=key.public_key().public_bytes(Encoding.Raw,PublicFormat.Raw)
        assert verify(token,pub) and not verify(token+'x',pub)
        printer=QPrinter(); printer.setOutputFormat(QPrinter.PdfFormat); printer.setOutputFileName(str(Path(td)/'test.pdf')); doc=QTextDocument(); doc.setHtml(report_html('اختبار',['عميل'],[['تجربة']])); doc.print_(printer)
        assert (Path(td)/'test.pdf').stat().st_size>500
        assert QPrintDialog(QPrinter()) is not None
        s.close()
    win=Window(); win.show(); QApplication.processEvents(); win.close()
    Path(output).write_text(json.dumps({'platform':platform.platform(),'frozen':bool(getattr(sys,'frozen',False)),'database':'passed','activation':'signature, tamper: passed','printing':'PDF and dialog construction passed; physical printer untested','gui':'window opened and closed'},indent=2))

if __name__=='__main__':
    app=QApplication(sys.argv); app.setLayoutDirection(Qt.RightToLeft)
    QFontDatabase.addApplicationFont(str(ROOT/'assets/DejaVuSans.ttf')); app.setFont(QFont('DejaVu Sans',10))
    if '--self-test' in sys.argv:
        try:self_test(sys.argv[sys.argv.index('--self-test')+1]); sys.exit(0)
        except Exception:
            Path(sys.argv[sys.argv.index('--self-test')+1]).write_text(traceback.format_exc()); sys.exit(1)
    if not licensed() and Activation().exec()!=QDialog.Accepted:sys.exit(0)
    w=Window(); w.show(); sys.exit(app.exec())
