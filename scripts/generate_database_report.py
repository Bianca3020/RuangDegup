import zipfile
import xml.sax.saxutils as saxutils
import os
import shutil

def escape(s):
    if s is None:
        return ""
    return saxutils.escape(str(s))

class SimpleExcelWriter:
    def __init__(self, filename):
        self.filename = filename
        self.sheets = []

    def add_sheet(self, name, rows, col_widths=None, freeze_row=None, autofilter=None, merges=None):
        self.sheets.append({
            'name': name,
            'rows': rows,
            'col_widths': col_widths or {},
            'freeze_row': freeze_row,
            'autofilter': autofilter,
            'merges': merges or []
        })

    def build_styles_xml(self):
        return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="13">
    <font><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="16"/><color rgb="FF3D232F"/><name val="Calibri"/><family val="2"/></font>
    <font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
    <font><sz val="10"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="9.5"/><color rgb="FF92400E"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="9.5"/><color rgb="FF065F46"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="9.5"/><color rgb="FF1E40AF"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="9.5"/><color rgb="FF9A3412"/><name val="Calibri"/><family val="2"/></font>
    <font><sz val="9.5"/><color rgb="FF374151"/><name val="Consolas"/><family val="3"/></font>
    <font><b/><sz val="12"/><color rgb="FF3D232F"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="12">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF3D232F"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF4A2035"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF6A324E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFAF7F2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFEDD5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF5EFEB"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="24">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="12" fillId="11" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="8" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="9" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="10" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="8" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="11" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="11" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="11" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>"""

    def col_to_letter(self, col_idx):
        result = ""
        while col_idx > 0:
            col_idx, remainder = divmod(col_idx - 1, 26)
            result = chr(65 + remainder) + result
        return result

    def build_worksheet_xml(self, sheet_data):
        rows = sheet_data['rows']
        col_widths = sheet_data['col_widths']
        freeze_row = sheet_data['freeze_row']
        autofilter = sheet_data['autofilter']
        merges = sheet_data['merges']

        xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>']
        xml.append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
        if freeze_row:
            xml.append(f'  <sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane ySplit="{freeze_row}" topLeftCell="A{freeze_row + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>')
        else:
            xml.append('  <sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>')
        xml.append('  <sheetFormatPr defaultRowHeight="20"/>')
        if col_widths:
            xml.append('  <cols>')
            for col_idx in sorted(col_widths.keys()):
                xml.append(f'    <col min="{col_idx}" max="{col_idx}" width="{col_widths[col_idx]}" customWidth="1"/>')
            xml.append('  </cols>')
        xml.append('  <sheetData>')
        for r_idx, row in enumerate(rows, 1):
            ht = row.get('height', 20)
            xml.append(f'    <row r="{r_idx}" ht="{ht}" customHeight="1">')
            for c_idx, cell in enumerate(row.get('cells', []), 1):
                col_letter = self.col_to_letter(c_idx)
                cell_ref = f"{col_letter}{r_idx}"
                val = cell.get('val', "")
                style = cell.get('style', 0)
                if cell.get('type') == 'num':
                    xml.append(f'      <c r="{cell_ref}" s="{style}"><v>{val}</v></c>')
                else:
                    esc = escape(val)
                    xml.append(f'      <c r="{cell_ref}" s="{style}" t="inlineStr"><is><t>{esc}</t></is></c>')
            xml.append('    </row>')
        xml.append('  </sheetData>')
        if autofilter:
            xml.append(f'  <autoFilter ref="{autofilter}"/>')
        if merges:
            xml.append(f'  <mergeCells count="{len(merges)}">')
            for m in merges:
                xml.append(f'    <mergeCell ref="{m}"/>')
            xml.append('  </mergeCells>')
        xml.append('</worksheet>')
        return "\n".join(xml)

    def save(self):
        with zipfile.ZipFile(self.filename, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
            ct_xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">', '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>', '  <Default Extension="xml" ContentType="application/xml"/>', '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>', '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>']
            for i in range(1, len(self.sheets) + 1):
                ct_xml.append(f'  <Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
            ct_xml.append('</Types>')
            zf.writestr('[Content_Types].xml', "\n".join(ct_xml))
            zf.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
            wb_xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">', '  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>', '  <sheets>']
            for i, sh in enumerate(self.sheets, 1):
                wb_xml.append(f'    <sheet name="{escape(sh["name"])}" sheetId="{i}" r:id="rId{i}"/>')
            wb_xml.append('  </sheets></workbook>')
            zf.writestr('xl/workbook.xml', "\n".join(wb_xml))
            wb_rels_xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">']
            for i in range(1, len(self.sheets) + 1):
                wb_rels_xml.append(f'  <Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>')
            wb_rels_xml.append(f'  <Relationship Id="rId{len(self.sheets) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
            wb_rels_xml.append('</Relationships>')
            zf.writestr('xl/_rels/workbook.xml.rels', "\n".join(wb_rels_xml))
            zf.writestr('xl/styles.xml', self.build_styles_xml())
            for i, sh in enumerate(self.sheets, 1):
                zf.writestr(f'xl/worksheets/sheet{i}.xml', self.build_worksheet_xml(sh))

def build_report():
    output_path = "c:\\xampp\\htdocs\\laravel\\RuangDegup\\database-report-ruangdegup.xlsx"
    writer = SimpleExcelWriter(output_path)

    # SHEET 1: Database
    s1_rows = [
        {'height': 30, 'cells': [{'val': 'LAPORAN DOKUMENTASI DATABASE RUANGDEGUP', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Sistem Informasi Perpustakaan Digital SMKN 6 Surakarta — Dokumentasi Struktur & Arsitektur Basis Data', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 24, 'cells': [{'val': '1. INFORMASI UMUM & SPESIFIKASI DATABASE', 'style': 3}]},
        {'height': 22, 'cells': [{'val': 'Nama Database', 'style': 22}, {'val': 'ruangdegup', 'style': 23}, {'val': 'RDBMS Engine', 'style': 22}, {'val': 'MySQL 8.0 / MariaDB 10.4 (InnoDB)', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Charset & Collation', 'style': 22}, {'val': 'utf8mb4 / utf8mb4_unicode_ci', 'style': 23}, {'val': 'Backend Framework', 'style': 22}, {'val': 'Laravel 11.x (PHP 8.2+)', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Frontend Interface', 'style': 22}, {'val': 'React 18 + Vite + Tailwind CSS', 'style': 23}, {'val': 'Lingkungan Hosting', 'style': 22}, {'val': 'Production: api.ruangdegup.web.id (Railway) | Local: XAMPP', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Fungsi Utama Database', 'style': 22}, {'val': 'Mengelola seluruh entitas perpustakaan digital: autentikasi multi-peran (Admin, User & Member Siswa Bianca), katalogisasi buku terpadu, data keanggotaan siswa terverifikasi, sirkulasi peminjaman/pengembalian otomatis dengan sinkronisasi stok riil, bookmark koleksi favorit, dan ulasan buku.', 'style': 23}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '2. DAFTAR & FUNGSI SELURUH TABEL SISTEM', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Tabel', 'style': 4}, {'val': 'Tipe Entitas', 'style': 4}, {'val': 'Jumlah Kolom', 'style': 4}, {'val': 'Sheet Detail', 'style': 4}, {'val': 'Fungsi & Peran Operasional Tabel', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'users', 'style': 12}, {'val': 'Master / Auth', 'style': 7}, {'val': '9 Kolom', 'style': 7}, {'val': 'Sheet Users', 'style': 7}, {'val': 'Menyimpan kredensial akun pengguna, kata sandi ter-hash (Bcrypt), dan peran akses (admin, user, member).', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'categories', 'style': 12}, {'val': 'Master / Klasifikasi', 'style': 10}, {'val': '4 Kolom', 'style': 10}, {'val': 'Sheet Categories', 'style': 10}, {'val': 'Menyimpan klasifikasi genre/kategori buku (Fiksi, Non-Fiksi, Romansa, Fantasi, Misteri, Sejarah, Biografi).', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'books', 'style': 12}, {'val': 'Master / Inventaris', 'style': 7}, {'val': '12 Kolom', 'style': 7}, {'val': 'Sheet Books', 'style': 7}, {'val': 'Menyimpan metadata lengkap buku (Atomic Habits, Laskar Pelangi, Filosofi Teras, stok eksemplar, cover).', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'members', 'style': 12}, {'val': 'Master / Profil', 'style': 10}, {'val': '13 Kolom', 'style': 10}, {'val': 'Sheet Members', 'style': 10}, {'val': 'Menyimpan data profil siswa anggota perpustakaan (Bianca, Citra, Ivanna, nomor anggota, kelas, kontak).', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'borrowings', 'style': 12}, {'val': 'Transaksional / Sirkulasi', 'style': 7}, {'val': '8 Kolom', 'style': 7}, {'val': 'Sheet Borrowings', 'style': 7}, {'val': 'Mencatat sirkulasi peminjaman & pengembalian buku siswa, tanggal transaksi, dan status aktif/selesai.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': 'Relasional / Wishlist', 'style': 10}, {'val': '5 Kolom', 'style': 10}, {'val': 'Sheet Contoh Data', 'style': 10}, {'val': 'Menyimpan penandaan buku favorit (bookmark) oleh siswa anggota dengan constraint unique per buku per siswa.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'reviews', 'style': 12}, {'val': 'Transaksional / Resensi', 'style': 7}, {'val': '6 Kolom', 'style': 7}, {'val': 'Sheet Contoh Data', 'style': 7}, {'val': 'Menyimpan penilaian rating bintang (1-5) dan ulasan pengalaman membaca dari siswa anggota perpustakaan.', 'style': 6}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '3. MATRIKS HUBUNGAN ANTARTABEL (RELASI DATABASE)', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Tabel Asal (FK)', 'style': 4}, {'val': 'Foreign Key', 'style': 4}, {'val': 'Tabel Tujuan (PK)', 'style': 4}, {'val': 'Kardinalitas', 'style': 4}, {'val': 'Aturan On Delete', 'style': 4}, {'val': 'Deskripsi Logika Bisnis & Integritas Relasi', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'members', 'style': 12}, {'val': 'user_id', 'style': 19}, {'val': 'users.id', 'style': 7}, {'val': 'One-to-One (0..1 : 1)', 'style': 7}, {'val': 'SET NULL', 'style': 16}, {'val': 'Menghubungkan akun login pengguna (Bianca) dengan profil anggota siswa secara unik.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'books', 'style': 12}, {'val': 'category_id', 'style': 20}, {'val': 'categories.id', 'style': 10}, {'val': 'Many-to-One (N : 1)', 'style': 10}, {'val': 'RESTRICT', 'style': 16}, {'val': 'Setiap buku berada di bawah 1 kategori. Kategori dilindungi RESTRICT agar tidak bisa dihapus jika masih memiliki buku.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'borrowings', 'style': 12}, {'val': 'member_id', 'style': 19}, {'val': 'members.id', 'style': 7}, {'val': 'Many-to-One (N : 1)', 'style': 7}, {'val': 'CASCADE', 'style': 17}, {'val': 'Setiap transaksi sirkulasi peminjaman dicatat atas nama 1 siswa anggota perpustakaan.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'borrowings', 'style': 12}, {'val': 'book_id', 'style': 20}, {'val': 'books.id', 'style': 10}, {'val': 'Many-to-One (N : 1)', 'style': 10}, {'val': 'CASCADE', 'style': 17}, {'val': 'Setiap transaksi sirkulasi meminjam 1 judul buku spesifik yang mengurangi stok eksemplar tersedia.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': 'member_id', 'style': 19}, {'val': 'members.id', 'style': 7}, {'val': 'Many-to-One (N : 1)', 'style': 7}, {'val': 'CASCADE', 'style': 17}, {'val': 'Anggota dapat menandai banyak buku ke dalam daftar favoritnya (unique constraint [member_id, book_id]).', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': 'book_id', 'style': 20}, {'val': 'books.id', 'style': 10}, {'val': 'Many-to-One (N : 1)', 'style': 10}, {'val': 'CASCADE', 'style': 17}, {'val': 'Sebuah buku dapat disimpan sebagai favorit oleh banyak anggota berbeda.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'reviews', 'style': 12}, {'val': 'member_id', 'style': 19}, {'val': 'members.id', 'style': 7}, {'val': 'Many-to-One (N : 1)', 'style': 7}, {'val': 'CASCADE', 'style': 17}, {'val': 'Anggota dapat menuliskan ulasan dan penilaian bintang pada buku yang dibaca.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 8, 'style': 10, 'type': 'num'}, {'val': 'reviews', 'style': 12}, {'val': 'book_id', 'style': 20}, {'val': 'books.id', 'style': 10}, {'val': 'Many-to-One (N : 1)', 'style': 10}, {'val': 'CASCADE', 'style': 17}, {'val': 'Sebuah buku dapat menerima berbagai ulasan dari banyak pembaca (skala rating 1-5).', 'style': 9}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '4. RINGKASAN ALUR PENYIMPANAN DATA (DATA FLOW)', 'style': 3}]},
        {'height': 22, 'cells': [{'val': 'Alur 1: Otentikasi & Akun', 'style': 22}, {'val': 'Akun disimpan di `users` (Admin: admin@ruangdegup.com, Member: bianca@ruangdegup.local). Profil member dibuat di `members` (nomor anggota: MBR-2026-0005, kelas XI PPLG) terhubung via user_id=5.', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Alur 2: Katalogisasi Buku', 'style': 22}, {'val': 'Kategori didefinisikan di `categories` (Fiksi id:1, Non-Fiksi id:2). Buku didaftarkan di `books` (Atomic Habits category_id=2 stok=5, Laskar Pelangi category_id=1 stok=3, Filosofi Teras category_id=2 stok=4).', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Alur 3: Sirkulasi Peminjaman', 'style': 22}, {'val': 'Member meminjam buku → Record dibuat di `borrowings` (member_id=1, book_id=1, tanggal_pinjam=2026-09-29, status="dipinjam") → Stok buku berkurang 1.', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Alur 4: Sirkulasi Pengembalian', 'style': 22}, {'val': 'Buku dikembalikan → Record `borrowings` diperbarui status="dikembalikan", tanggal_kembali="2026-09-29" → Stok buku dipulihkan (+1).', 'style': 23}]},
        {'height': 22, 'cells': [{'val': 'Alur 5: Interaksi & Resensi', 'style': 22}, {'val': 'Member Bianca menandai buku ke `favorites` (book_id 1, 2, 3) dan memberikan ulasan di `reviews` (Atomic Habits: rating 5, Filosofi Teras: rating 4).', 'style': 23}]}
    ]
    s1_cols = {1: 8, 2: 24, 3: 20, 4: 16, 5: 18, 6: 72, 7: 35}
    s1_merges = ['A1:F1', 'A2:F2', 'A4:F4', 'B8:F8', 'A10:F10', 'A19:F19', 'A29:F29', 'B30:F30', 'B31:F31', 'B32:F32', 'B33:F33', 'B34:F34']
    writer.add_sheet('Database', s1_rows, s1_cols, freeze_row=None, autofilter=None, merges=s1_merges)

    # SHEET 2: Users
    s2_rows = [
        {'height': 30, 'cells': [{'val': 'STRUKTUR TABEL: USERS', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Tabel penyimpan kredensial pengguna, kata sandi ter-hash (Bcrypt), peran otorisasi (admin/user/member), dan token sesi.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Field', 'style': 4}, {'val': 'Tipe Data', 'style': 4}, {'val': 'Panjang', 'style': 4}, {'val': 'Key', 'style': 4}, {'val': 'Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Primary Key', 'style': 14}, {'val': 'Identitas unik akun pengguna / primary key otomatis (auto increment)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'name', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Nama lengkap pengguna sistem atau petugas administrator perpustakaan', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'email', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'Unique', 'style': 16}, {'val': 'Alamat email terdaftar untuk identifikasi otentikasi login (wajib unik)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'email_verified_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel verifikasi email akun pengguna (bersifat opsional / nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'password', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Kata sandi akun yang diamankan menggunakan enkripsi hashing satu arah Bcrypt', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'role', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Peran hak akses sistem: "admin" (pengelola), "user" (pengguna), atau "member" (siswa)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'remember_token', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '100', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Token keamanan untuk fitur persistensi login "Remember Me" pada browser (nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 8, 'style': 10, 'type': 'num'}, {'val': 'created_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel pencatatan akun pertama kali didaftarkan ke sistem', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 9, 'style': 7, 'type': 'num'}, {'val': 'updated_at', 'style': 12}, {'val': 'timestamp', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Waktu stempel pembaruan terakhir terhadap atribut data pengguna', 'style': 6}]}
    ]
    s2_cols = {1: 8, 2: 22, 3: 18, 4: 12, 5: 18, 6: 68}
    s2_merges = ['A1:F1', 'A2:F2']
    writer.add_sheet('Users', s2_rows, s2_cols, freeze_row=4, autofilter='A4:F13', merges=s2_merges)

    # SHEET 3: Categories
    s3_rows = [
        {'height': 30, 'cells': [{'val': 'STRUKTUR TABEL: CATEGORIES', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Tabel master klasifikasi genre atau rumpun kategori buku untuk pengelompokan katalog koleksi literatur.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Field', 'style': 4}, {'val': 'Tipe Data', 'style': 4}, {'val': 'Panjang', 'style': 4}, {'val': 'Key', 'style': 4}, {'val': 'Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Primary Key', 'style': 14}, {'val': 'Identitas unik kategori buku / primary key otomatis (auto increment)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'nama_kategori', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Nama genre atau kelompok kategori buku (e.g., Fiksi, Non-Fiksi, Romansa, Fantasi, Misteri, Sejarah, Biografi)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'created_at', 'style': 12}, {'val': 'timestamp', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Waktu stempel penambahan data kategori buku ke dalam database', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'updated_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel perubahan nama atau atribut kategori terakhir kali', 'style': 9}]}
    ]
    s3_cols = {1: 8, 2: 22, 3: 18, 4: 12, 5: 18, 6: 68}
    s3_merges = ['A1:F1', 'A2:F2']
    writer.add_sheet('Categories', s3_rows, s3_cols, freeze_row=4, autofilter='A4:F8', merges=s3_merges)

    # SHEET 4: Books
    s4_rows = [
        {'height': 30, 'cells': [{'val': 'STRUKTUR TABEL: BOOKS', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Tabel inventaris katalog koleksi buku perpustakaan RuangDegup beserta metadata bibliografi dan jumlah stok eksemplar.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Field', 'style': 4}, {'val': 'Tipe Data', 'style': 4}, {'val': 'Panjang', 'style': 4}, {'val': 'Key', 'style': 4}, {'val': 'Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Primary Key', 'style': 14}, {'val': 'Identitas unik buku dalam sistem perpustakaan / primary key otomatis (auto increment)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'category_id', 'style': 12}, {'val': 'bigint unsigned', 'style': 20}, {'val': '20', 'style': 10}, {'val': 'Foreign Key', 'style': 15}, {'val': 'Relasi ke tabel categories.id untuk klasifikasi genre buku (onDelete: RESTRICT)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'judul', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Judul lengkap karya buku literatur', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'penulis', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Nama pengarang, sastrawan, atau penulis utama buku', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'penerbit', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Nama badan penerbit atau institusi yang mempublikasikan buku (nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'tahun_terbit', 'style': 12}, {'val': 'year', 'style': 20}, {'val': '4', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Tahun publikasi atau cetakan buku dalam format 4 digit angka tahun (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'isbn', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Nomor standar buku internasional (International Standard Book Number, nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 8, 'style': 10, 'type': 'num'}, {'val': 'deskripsi', 'style': 12}, {'val': 'text', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Sinopsis ringkas, ikhtisar isi buku, atau catatan editorial (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 9, 'style': 7, 'type': 'num'}, {'val': 'stok', 'style': 12}, {'val': 'integer', 'style': 19}, {'val': '11', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Jumlah eksemplar fisik buku yang tersedia di rak untuk sirkulasi pinjam [Default: 0]', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 10, 'style': 10, 'type': 'num'}, {'val': 'cover', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Path relatif file gambar sampul (cover) pada direktori storage/covers (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 11, 'style': 7, 'type': 'num'}, {'val': 'created_at', 'style': 12}, {'val': 'timestamp', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Waktu stempel penambahan data buku ke dalam inventaris perpustakaan', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 12, 'style': 10, 'type': 'num'}, {'val': 'updated_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel pembaruan data buku atau sinkronisasi stok eksemplar', 'style': 9}]}
    ]
    s4_cols = {1: 8, 2: 22, 3: 18, 4: 12, 5: 18, 6: 68}
    s4_merges = ['A1:F1', 'A2:F2']
    writer.add_sheet('Books', s4_rows, s4_cols, freeze_row=4, autofilter='A4:F16', merges=s4_merges)

    # SHEET 5: Members
    s5_rows = [
        {'height': 30, 'cells': [{'val': 'STRUKTUR TABEL: MEMBERS', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Tabel data profil siswa anggota perpustakaan RuangDegup yang terhubung dengan akun pengguna dan data sirkulasi.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Field', 'style': 4}, {'val': 'Tipe Data', 'style': 4}, {'val': 'Panjang', 'style': 4}, {'val': 'Key', 'style': 4}, {'val': 'Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Primary Key', 'style': 14}, {'val': 'Identitas unik anggota perpustakaan / primary key otomatis (auto increment)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'user_id', 'style': 12}, {'val': 'bigint unsigned', 'style': 20}, {'val': '20', 'style': 10}, {'val': 'Foreign Key, Unique', 'style': 15}, {'val': 'Relasi 1-to-1 opsional ke users.id untuk autentikasi login member siswa (nullOnDelete)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'nomor_anggota', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'Unique', 'style': 16}, {'val': 'Nomor induk kartu keanggotaan unik siswa (e.g., MBR-2026-0005, A0002, nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'nama', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Nama lengkap siswa anggota perpustakaan', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'kelas', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Rombongan belajar atau tingkat kelas siswa (e.g., XI PPLG, XII PPLG 1, nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'alamat', 'style': 12}, {'val': 'text', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Alamat tempat tinggal / domisili lengkap siswa (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'no_hp', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Nomor kontak telepon atau WhatsApp aktif siswa untuk notifikasi (nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 8, 'style': 10, 'type': 'num'}, {'val': 'bio', 'style': 12}, {'val': 'text', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Biografi singkat, kutipan favorit, atau deskripsi minat literatur pada profil siswa (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 9, 'style': 7, 'type': 'num'}, {'val': 'profile_photo', 'style': 12}, {'val': 'varchar', 'style': 19}, {'val': '255', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Path relatif file gambar foto profil siswa di storage/profiles (nullable)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 10, 'style': 10, 'type': 'num'}, {'val': 'profile_background', 'style': 12}, {'val': 'varchar', 'style': 20}, {'val': '255', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Path relatif file gambar latar belakang (cover banner) profil siswa (nullable)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 11, 'style': 7, 'type': 'num'}, {'val': 'tanggal_daftar', 'style': 12}, {'val': 'date', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Tanggal resmi siswa terdaftar sebagai anggota perpustakaan [Default: CURRENT_DATE]', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 12, 'style': 10, 'type': 'num'}, {'val': 'created_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel pendaftaran anggota pertama kali disimpan di sistem', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 13, 'style': 7, 'type': 'num'}, {'val': 'updated_at', 'style': 12}, {'val': 'timestamp', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Waktu stempel pembaruan data profil keanggotaan terakhir kali', 'style': 6}]}
    ]
    s5_cols = {1: 8, 2: 22, 3: 18, 4: 12, 5: 22, 6: 68}
    s5_merges = ['A1:F1', 'A2:F2']
    writer.add_sheet('Members', s5_rows, s5_cols, freeze_row=4, autofilter='A4:F17', merges=s5_merges)

    # SHEET 6: Borrowings
    s6_rows = [
        {'height': 30, 'cells': [{'val': 'STRUKTUR TABEL: BORROWINGS', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Tabel sirkulasi transaksi peminjaman dan pengembalian koleksi buku perpustakaan serta status aktif sirkulasi.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Nama Field', 'style': 4}, {'val': 'Tipe Data', 'style': 4}, {'val': 'Panjang', 'style': 4}, {'val': 'Key', 'style': 4}, {'val': 'Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Primary Key', 'style': 14}, {'val': 'Identitas unik transaksi peminjaman / primary key otomatis (auto increment)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'member_id', 'style': 12}, {'val': 'bigint unsigned', 'style': 20}, {'val': '20', 'style': 10}, {'val': 'Foreign Key', 'style': 15}, {'val': 'Relasi ke tabel members.id (siswa anggota yang meminjam buku, onDelete: CASCADE)', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'book_id', 'style': 12}, {'val': 'bigint unsigned', 'style': 19}, {'val': '20', 'style': 7}, {'val': 'Foreign Key', 'style': 15}, {'val': 'Relasi ke tabel books.id (buku fisik yang dipinjam, onDelete: CASCADE)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'tanggal_pinjam', 'style': 12}, {'val': 'date', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Tanggal awal transaksi peminjaman buku dilakukan oleh siswa', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'tanggal_kembali', 'style': 12}, {'val': 'date', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Tanggal fisik buku dikembalikan ke perpustakaan (bernilai NULL saat buku masih dipinjam)', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'status', 'style': 12}, {'val': 'enum', 'style': 20}, {'val': '12', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Status sirkulasi: "dipinjam" atau "dikembalikan" [Default: "dipinjam"]', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'created_at', 'style': 12}, {'val': 'timestamp', 'style': 19}, {'val': '-', 'style': 7}, {'val': 'None', 'style': 7}, {'val': 'Waktu stempel transaksi peminjaman pertama kali tercatat di sistem', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 8, 'style': 10, 'type': 'num'}, {'val': 'updated_at', 'style': 12}, {'val': 'timestamp', 'style': 20}, {'val': '-', 'style': 10}, {'val': 'None', 'style': 10}, {'val': 'Waktu stempel saat status transaksi diperbarui menjadi dikembalikan', 'style': 9}]}
    ]
    s6_cols = {1: 8, 2: 22, 3: 18, 4: 12, 5: 18, 6: 68}
    s6_merges = ['A1:F1', 'A2:F2']
    writer.add_sheet('Borrowings', s6_rows, s6_cols, freeze_row=4, autofilter='A4:F12', merges=s6_merges)

    # SHEET 7: Contoh Data (ACTUAL MYSQL DATA)
    s7_rows = [
        {'height': 30, 'cells': [{'val': 'CONTOH DATA RECORD REALISTIS RUANGDEGUP (DATA AKTUAL DATABASE)', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Record data aktual yang tersimpan di dalam database MySQL sistem perpustakaan digital RuangDegup.', 'style': 2}]},
        {'height': 12, 'cells': []},

        # TABEL 1: USERS (Aktual)
        {'height': 24, 'cells': [{'val': 'A. TABEL USERS (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'id', 'style': 4}, {'val': 'name', 'style': 4}, {'val': 'email', 'style': 4}, {'val': 'role', 'style': 4}, {'val': 'email_verified_at', 'style': 4}, {'val': 'created_at', 'style': 4}, {'val': 'updated_at', 'style': 4}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'Admin RuangDegup', 'style': 12}, {'val': 'admin@ruangdegup.com', 'style': 6}, {'val': 'admin', 'style': 14}, {'val': 'NULL', 'style': 7}, {'val': '2026-09-28 02:42:36', 'style': 7}, {'val': '2026-11-15 06:27:32', 'style': 7}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'User RuangDegup', 'style': 12}, {'val': 'user@ruangdegup.com', 'style': 9}, {'val': 'user', 'style': 16}, {'val': 'NULL', 'style': 10}, {'val': '2026-09-28 06:50:53', 'style': 10}, {'val': '2026-09-28 06:50:53', 'style': 10}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'Bianca', 'style': 12}, {'val': 'bianca@ruangdegup.local', 'style': 6}, {'val': 'member', 'style': 15}, {'val': 'NULL', 'style': 7}, {'val': '2026-10-01 07:33:51', 'style': 7}, {'val': '2026-11-15 06:27:32', 'style': 7}]},
        {'height': 16, 'cells': []},

        # TABEL 2: CATEGORIES (Aktual)
        {'height': 24, 'cells': [{'val': 'B. TABEL CATEGORIES (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'id', 'style': 4}, {'val': 'nama_kategori', 'style': 21}, {'val': 'created_at', 'style': 4}, {'val': 'updated_at', 'style': 4}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'Fiksi', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 7}, {'val': '2026-09-29 02:08:26', 'style': 7}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'Non-Fiksi', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 10}, {'val': '2026-09-29 02:08:26', 'style': 10}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'Romansa', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 7}, {'val': '2026-09-29 02:08:26', 'style': 7}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'Fantasi', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 10}, {'val': '2026-09-29 02:08:26', 'style': 10}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'Misteri', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 7}, {'val': '2026-09-29 02:08:26', 'style': 7}]},
        {'height': 22, 'cells': [{'val': 6, 'style': 10, 'type': 'num'}, {'val': 'Sejarah', 'style': 12}, {'val': '2026-09-29 02:08:26', 'style': 10}, {'val': '2026-09-29 02:08:26', 'style': 10}]},
        {'height': 22, 'cells': [{'val': 7, 'style': 7, 'type': 'num'}, {'val': 'Biografi', 'style': 12}, {'val': '2026-09-29 02:09:29', 'style': 7}, {'val': '2026-09-29 02:09:29', 'style': 7}]},
        {'height': 16, 'cells': []},

        # TABEL 3: BOOKS (Aktual)
        {'height': 24, 'cells': [{'val': 'C. TABEL BOOKS (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'id', 'style': 4}, {'val': 'category_id', 'style': 4}, {'val': 'judul', 'style': 21}, {'val': 'penulis', 'style': 4}, {'val': 'penerbit', 'style': 4}, {'val': 'tahun', 'style': 4}, {'val': 'isbn', 'style': 4}, {'val': 'stok', 'style': 4}, {'val': 'deskripsi', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 2, 'style': 19, 'type': 'num'}, {'val': 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa', 'style': 12}, {'val': 'James Clear', 'style': 6}, {'val': 'Gramedia Pustaka Utama', 'style': 6}, {'val': 2023, 'style': 7, 'type': 'num'}, {'val': '9786020633176', 'style': 7}, {'val': 5, 'style': 13, 'type': 'num'}, {'val': 'Buku tentang membangun kebiasaan baik melalui perubahan kecil yang dilakukan secara konsisten.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 1, 'style': 20, 'type': 'num'}, {'val': 'Laskar Pelangi', 'style': 12}, {'val': 'Andrea Hirata', 'style': 9}, {'val': 'Bentang Pustaka', 'style': 9}, {'val': 2005, 'style': 10, 'type': 'num'}, {'val': '9789793062792', 'style': 10}, {'val': 3, 'style': 13, 'type': 'num'}, {'val': 'Novel yang menceritakan perjuangan dan persahabatan anak-anak Belitung dalam meraih pendidikan.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 2, 'style': 19, 'type': 'num'}, {'val': 'Filosofi Teras', 'style': 12}, {'val': 'Henry Manampiring', 'style': 6}, {'val': 'Kompas', 'style': 6}, {'val': 2018, 'style': 7, 'type': 'num'}, {'val': '9786024125189', 'style': 7}, {'val': 4, 'style': 13, 'type': 'num'}, {'val': 'Buku yang membahas filsafat Stoikisme dan penerapannya dalam kehidupan sehari-hari.', 'style': 6}]},
        {'height': 16, 'cells': []},

        # TABEL 4: MEMBERS (Aktual)
        {'height': 24, 'cells': [{'val': 'D. TABEL MEMBERS (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'id', 'style': 4}, {'val': 'user_id', 'style': 4}, {'val': 'nomor_anggota', 'style': 4}, {'val': 'nama', 'style': 21}, {'val': 'kelas', 'style': 4}, {'val': 'alamat', 'style': 4}, {'val': 'no_hp', 'style': 4}, {'val': 'bio', 'style': 21}, {'val': 'tanggal_daftar', 'style': 4}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 5, 'style': 19, 'type': 'num'}, {'val': 'MBR-2026-0005', 'style': 16}, {'val': 'Bianca', 'style': 12}, {'val': 'XI PPLG', 'style': 7}, {'val': 'Surakarta', 'style': 7}, {'val': '081234567890', 'style': 7}, {'val': 'Reader, dreamer, and collector of stories.', 'style': 6}, {'val': '2026-11-15', 'style': 7}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'NULL', 'style': 20}, {'val': 'A0002', 'style': 16}, {'val': 'Citra', 'style': 12}, {'val': 'XII PPLG 1', 'style': 10}, {'val': 'Surakarta', 'style': 10}, {'val': '081298765432', 'style': 10}, {'val': '-', 'style': 9}, {'val': '2026-09-28', 'style': 10}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'NULL', 'style': 19}, {'val': 'A0003', 'style': 16}, {'val': 'Ivanna', 'style': 12}, {'val': 'XII PPLG 1', 'style': 7}, {'val': 'Ngemplak', 'style': 7}, {'val': '081234567890', 'style': 7}, {'val': '-', 'style': 6}, {'val': '2026-09-29', 'style': 7}]},
        {'height': 16, 'cells': []},

        # TABEL 5: BORROWINGS (Aktual)
        {'height': 24, 'cells': [{'val': 'E. TABEL BORROWINGS (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'id', 'style': 4}, {'val': 'member_id', 'style': 4}, {'val': 'book_id', 'style': 4}, {'val': 'tanggal_pinjam', 'style': 4}, {'val': 'tanggal_kembali', 'style': 4}, {'val': 'status', 'style': 4}, {'val': 'keterangan sirkulasi', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 7, 'type': 'num'}, {'val': '1 (Bianca)', 'style': 19}, {'val': '1 (Atomic Habits)', 'style': 7}, {'val': '2026-09-29', 'style': 7}, {'val': '2026-09-29', 'style': 7}, {'val': 'dikembalikan', 'style': 18}, {'val': 'Peminjaman buku Atomic Habits oleh Bianca, telah dikembalikan secara resmi.', 'style': 6}]},
        {'height': 16, 'cells': []},

        # TABEL 6: FAVORITES & REVIEWS (Aktual)
        {'height': 24, 'cells': [{'val': 'F. TABEL FAVORITES & REVIEWS (Data Aktual)', 'style': 3}]},
        {'height': 24, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Tabel', 'style': 4}, {'val': 'member_id', 'style': 4}, {'val': 'book_id', 'style': 4}, {'val': 'Rating / Status', 'style': 4}, {'val': 'Isi Ulasan / Keterangan', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': '1 (Bianca)', 'style': 19}, {'val': '1 (Atomic Habits)', 'style': 7}, {'val': 'Bookmarked', 'style': 16}, {'val': 'Tersimpan di koleksi favorit profil Bianca.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': '1 (Bianca)', 'style': 20}, {'val': '2 (Laskar Pelangi)', 'style': 10}, {'val': 'Bookmarked', 'style': 16}, {'val': 'Tersimpan di koleksi favorit profil Bianca.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'favorites', 'style': 12}, {'val': '1 (Bianca)', 'style': 19}, {'val': '3 (Filosofi Teras)', 'style': 7}, {'val': 'Bookmarked', 'style': 16}, {'val': 'Tersimpan di koleksi favorit profil Bianca.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'reviews', 'style': 12}, {'val': '1 (Bianca)', 'style': 20}, {'val': '1 (Atomic Habits)', 'style': 10}, {'val': '★★★★★ (5/5)', 'style': 14}, {'val': 'Buku yang menarik dan mudah diterapkan dalam kehidupan sehari-hari.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'reviews', 'style': 12}, {'val': '1 (Bianca)', 'style': 19}, {'val': '3 (Filosofi Teras)', 'style': 7}, {'val': '★★★★☆ (4/5)', 'style': 14}, {'val': 'Ceritanya menarik dan memberikan sudut pandang yang berbeda.', 'style': 6}]}
    ]

    s7_cols = {1: 8, 2: 18, 3: 24, 4: 26, 5: 18, 6: 18, 7: 50, 8: 12, 9: 25}
    s7_merges = ['A1:G1', 'A2:G2', 'A4:G4', 'A10:D10', 'A20:I20', 'A26:I26', 'A32:G32', 'A36:F36']
    writer.add_sheet('Contoh Data', s7_rows, s7_cols, freeze_row=None, autofilter=None, merges=s7_merges)

    # SHEET 8: Transaksi (ACTUAL CASE: ATOMIC HABITS & BIANCA)
    s8_rows = [
        {'height': 30, 'cells': [{'val': 'STANDAR OPERASIONAL PROSEDUR (SOP) & ALUR TRANSAKSI SIRKULASI', 'style': 1}]},
        {'height': 20, 'cells': [{'val': 'Dokumentasi rinci alur transaksi peminjaman dan pengembalian buku beserta manipulasi stok riil pada database RuangDegup.', 'style': 2}]},
        {'height': 12, 'cells': []},
        {'height': 24, 'cells': [{'val': '1. ALUR SIKLUS PEMINJAMAN BUKU (BORROWING CYCLE)', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'Tahap', 'style': 4}, {'val': 'Entitas Terlibat', 'style': 4}, {'val': 'Aksi / Interaksi Pengguna & Sistem', 'style': 21}, {'val': 'Operasi Query Database', 'style': 4}, {'val': 'Dampak & State Database', 'style': 21}]},
        {'height': 24, 'cells': [{'val': 'Langkah 1', 'style': 13}, {'val': 'Siswa / Member', 'style': 12}, {'val': 'Siswa login ke akun member RuangDegup (bianca@ruangdegup.local).', 'style': 6}, {'val': 'SELECT FROM users, members', 'style': 19}, {'val': 'Sesi autentikasi aktif; profil member termuat dengan nomor anggota MBR-2026-0005.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 2', 'style': 13}, {'val': 'Katalog Buku', 'style': 12}, {'val': 'Siswa menjelajahi katalog dan memilih buku Atomic Habits (ID: 1).', 'style': 9}, {'val': 'SELECT FROM books WHERE id = 1', 'style': 20}, {'val': 'Sistem memverifikasi ketersediaan stok fisik buku: "stok > 0" (stok saat ini: 5).', 'style': 9}]},
        {'height': 24, 'cells': [{'val': 'Langkah 3', 'style': 13}, {'val': 'Validasi Sirkulasi', 'style': 12}, {'val': 'Sistem memeriksa apakah Bianca sedang meminjam buku Atomic Habits yang belum dikembalikan.', 'style': 6}, {'val': 'SELECT borrowings WHERE member_id=1 AND book_id=1 AND status="dipinjam"', 'style': 19}, {'val': 'Memastikan tidak ada duplikasi peminjaman aktif untuk judul yang sama.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 4', 'style': 13}, {'val': 'Pencatatan Transaksi', 'style': 12}, {'val': 'Siswa menekan tombol "Pinjam Buku"; sistem membuat entri baru pada tabel borrowings.', 'style': 9}, {'val': 'INSERT INTO borrowings (member_id=1, book_id=1, tanggal_pinjam="2026-09-29", status="dipinjam")', 'style': 20}, {'val': 'Record sirkulasi terbit dengan status = "dipinjam", tanggal_pinjam = "2026-09-29".', 'style': 9}]},
        {'height': 24, 'cells': [{'val': 'Langkah 5', 'style': 13}, {'val': 'Pengurangan Stok', 'style': 12}, {'val': 'Secara atomik dalam database transaction, stok buku dikurangi 1 eksemplar.', 'style': 6}, {'val': 'UPDATE books SET stok = stok - 1 WHERE id = 1', 'style': 19}, {'val': 'Stok buku Atomic Habits di rak perpustakaan berkurang dari 5 menjadi 4.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 6', 'style': 13}, {'val': 'Konfirmasi & Rak Baca', 'style': 12}, {'val': 'Sistem menampilkan notifikasi sukses; buku otomatis masuk ke rak baca aktif siswa Bianca.', 'style': 9}, {'val': 'COMMIT TRANSACTION', 'style': 20}, {'val': 'Data sirkulasi sinkron di dashboard member dan panel peminjaman admin.', 'style': 9}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '2. ALUR SIKLUS PENGEMBALIAN BUKU (RETURN CYCLE)', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'Tahap', 'style': 4}, {'val': 'Entitas Terlibat', 'style': 4}, {'val': 'Aksi / Interaksi Pengguna & Sistem', 'style': 21}, {'val': 'Operasi Query Database', 'style': 4}, {'val': 'Dampak & State Database', 'style': 21}]},
        {'height': 24, 'cells': [{'val': 'Langkah 1', 'style': 13}, {'val': 'Member / Admin', 'style': 12}, {'val': 'Siswa Bianca mengembalikan buku Atomic Habits ke meja perpustakaan.', 'style': 6}, {'val': 'SELECT FROM borrowings WHERE status = "dipinjam"', 'style': 19}, {'val': 'Petugas membuka data sirkulasi aktif untuk memverifikasi kondisi fisik buku.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 2', 'style': 13}, {'val': 'Admin Panel', 'style': 12}, {'val': 'Petugas Admin memilih record peminjaman ID: 2 pada tabel sirkulasi.', 'style': 9}, {'val': 'SELECT * FROM borrowings WHERE id = 2', 'style': 20}, {'val': 'Record peminjaman aktif dimuat lengkap beserta data member Bianca dan buku Atomic Habits.', 'style': 9}]},
        {'height': 24, 'cells': [{'val': 'Langkah 3', 'style': 13}, {'val': 'Eksekusi Pengembalian', 'style': 12}, {'val': 'Petugas mengeklik tombol "Kembalikan Buku" untuk memproses penyelesaian sirkulasi.', 'style': 6}, {'val': 'START TRANSACTION', 'style': 19}, {'val': 'Sistem memulai transaksi atomik untuk memastikan konsistensi multi-tabel.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 4', 'style': 13}, {'val': 'Pembaruan Transaksi', 'style': 12}, {'val': 'Sistem mengubah status sirkulasi menjadi "dikembalikan" dan mencatat tanggal pengembalian.', 'style': 9}, {'val': 'UPDATE borrowings SET status="dikembalikan", tanggal_kembali="2026-09-29" WHERE id = 2', 'style': 20}, {'val': 'Status sirkulasi ditutup resmi; tanggal_kembali terisi "2026-09-29".', 'style': 9}]},
        {'height': 24, 'cells': [{'val': 'Langkah 5', 'style': 13}, {'val': 'Restorasi Stok Buku', 'style': 12}, {'val': 'Sistem secara otomatis menambahkan kembali 1 eksemplar ke stok buku Atomic Habits.', 'style': 6}, {'val': 'UPDATE books SET stok = stok + 1 WHERE id = 1', 'style': 19}, {'val': 'Stok buku Atomic Habits di rak perpustakaan pulih kembali dari 4 menjadi 5.', 'style': 6}]},
        {'height': 24, 'cells': [{'val': 'Langkah 6', 'style': 13}, {'val': 'Arsip & Ulasan', 'style': 12}, {'val': 'Bianca memberikan rating 5 bintang dan ulasan di sistem; riwayat transaksi tersimpan permanen.', 'style': 9}, {'val': 'INSERT INTO reviews (member_id=1, book_id=1, rating=5, ulasan=...)', 'style': 20}, {'val': 'Ulasan tampil pada detail buku; riwayat transaksi tersimpan utuh untuk pelaporan.', 'style': 9}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '3. SIMULASI PERUBAHAN STATE DATA RIIL (STUDI KASUS ATOMIC HABITS)', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Kejadian Operasional', 'style': 21}, {'val': 'books.stok', 'style': 4}, {'val': 'borrowings.status', 'style': 4}, {'val': 'borrowings.tanggal_kembali', 'style': 4}, {'val': 'Keterangan Status Sistem & Fisik', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'Kondisi Awal (Buku di Rak)', 'style': 12}, {'val': '5 Eksemplar', 'style': 13}, {'val': '- (Belum Ada)', 'style': 7}, {'val': '-', 'style': 7}, {'val': 'Buku Atomic Habits tersedia 5 eksemplar di rak katalog.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'Siswa Bianca Meminjam Buku', 'style': 12}, {'val': '4 Eksemplar (-1)', 'style': 13}, {'val': 'dipinjam', 'style': 17}, {'val': 'NULL', 'style': 10}, {'val': 'Peminjaman tercatat (ID: 2), stok berkurang 1, buku dibawa oleh Bianca.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'Masa Peminjaman Berjalan', 'style': 12}, {'val': '4 Eksemplar', 'style': 13}, {'val': 'dipinjam', 'style': 17}, {'val': 'NULL', 'style': 7}, {'val': 'Buku tercatat dalam peminjaman aktif siswa di sistem.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'Siswa Mengembalikan Buku', 'style': 12}, {'val': '5 Eksemplar (+1)', 'style': 13}, {'val': 'dikembalikan', 'style': 18}, {'val': '2026-09-29', 'style': 10}, {'val': 'Buku kembali ke rak, status ditutup, stok kembali utuh 5 eksemplar.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'Siswa Memberi Ulasan Bintang', 'style': 12}, {'val': '5 Eksemplar', 'style': 13}, {'val': 'dikembalikan', 'style': 18}, {'val': '2026-09-29', 'style': 7}, {'val': 'Record ulasan tersimpan di tabel reviews (Rating: 5/5 oleh Bianca).', 'style': 6}]},
        {'height': 16, 'cells': []},
        {'height': 24, 'cells': [{'val': '4. ATURAN BISNIS & INTEGRITAS DATA (DATA INTEGRITY & BUSINESS RULES)', 'style': 3}]},
        {'height': 26, 'cells': [{'val': 'No', 'style': 4}, {'val': 'Aturan Bisnis Perpustakaan', 'style': 21}, {'val': 'Implementasi Teknis di RuangDegup', 'style': 4}, {'val': 'Tujuan & Proteksi Sistem', 'style': 21}]},
        {'height': 22, 'cells': [{'val': 1, 'style': 7, 'type': 'num'}, {'val': 'Validasi Stok Habis', 'style': 12}, {'val': 'Pengecekan stok > 0 sebelum membuat record borrowing', 'style': 19}, {'val': 'Mencegah peminjaman fiktif ketika seluruh eksemplar buku sedang dipinjam orang lain.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 2, 'style': 10, 'type': 'num'}, {'val': 'Transaksi Atomik (ACID)', 'style': 12}, {'val': 'DB::transaction() pada Laravel saat pinjam & kembali', 'style': 20}, {'val': 'Menjamin jika pengurangan stok gagal, record borrowing otomatis dibatalkan (rollback).', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 3, 'style': 7, 'type': 'num'}, {'val': 'Integritas Referensial', 'style': 12}, {'val': 'Foreign Key ON DELETE CASCADE / SET NULL', 'style': 19}, {'val': 'Menghindari record yatim (orphan rows) dan menjamin konsistensi relasi relasional.', 'style': 6}]},
        {'height': 22, 'cells': [{'val': 4, 'style': 10, 'type': 'num'}, {'val': 'Pencegahan Duplikasi Resensi', 'style': 12}, {'val': 'Unique constraint pada (member_id, book_id) di reviews & favorites', 'style': 20}, {'val': 'Setiap siswa hanya boleh menandai favorit 1 kali dan mengulas 1 kali per judul buku.', 'style': 9}]},
        {'height': 22, 'cells': [{'val': 5, 'style': 7, 'type': 'num'}, {'val': 'Keamanan Kata Sandi & Akses', 'style': 12}, {'val': 'Bcrypt Password Hashing & Role-Based Middleware', 'style': 19}, {'val': 'Menjamin keamanan privasi siswa dan memisahkan hak kelola admin perpustakaan.', 'style': 6}]}
    ]
    s8_cols = {1: 12, 2: 24, 3: 45, 4: 38, 5: 45, 6: 45}
    s8_merges = ['A1:E1', 'A2:E2', 'A4:E4', 'A13:E13', 'A22:F22', 'A30:D30']
    writer.add_sheet('Transaksi', s8_rows, s8_cols, freeze_row=None, autofilter=None, merges=s8_merges)

    # Save
    writer.save()
    print(f"Report successfully generated at: {output_path}")

    # Copy to docs/ and public/docs/
    os.makedirs('c:/xampp/htdocs/laravel/RuangDegup/docs', exist_ok=True)
    os.makedirs('c:/xampp/htdocs/laravel/RuangDegup/public/docs', exist_ok=True)
    shutil.copy2(output_path, 'c:/xampp/htdocs/laravel/RuangDegup/docs/database-report-ruangdegup.xlsx')
    shutil.copy2(output_path, 'c:/xampp/htdocs/laravel/RuangDegup/public/docs/database-report-ruangdegup.xlsx')
    print("Copied to docs/ and public/docs/")

if __name__ == '__main__':
    build_report()
