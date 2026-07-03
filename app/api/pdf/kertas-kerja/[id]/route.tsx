import { renderToStream } from '@react-pdf/renderer';
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// PDF Styling layout matching kertas_kerja_ms.jpg
const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 45,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#000000',
    lineHeight: 1.3,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  nomorPelayanan: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  // Table style matching layout
  table: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 9,
  },
  tableHeaderCellLast: {
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 9,
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'center',
    fontSize: 8.5,
  },
  tableCellLast: {
    padding: 6,
    justifyContent: 'center',
    fontSize: 8.5,
  },
  tableCellCenter: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 8.5,
  },
  tableCellCenterLast: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 8.5,
  },
  // Koordinat box
  koordinatTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 5,
  },
  koordinatBox: {
    width: '100%',
    height: 310,
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 15,
  },
  // Bottom signature grid
  signatureGrid: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 6,
  },
  signatureCol: {
    width: '25%',
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signatureColLast: {
    width: '25%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signatureHeader: {
    width: '100%',
    paddingVertical: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    fontSize: 8.5,
  },
  signatureBody: {
    height: 55,
  },
  footnote: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Oblique',
  },
});

interface Props {
  permohonan: any;
  sisaLT: number;
  sisaLB: number;
}

const KertasKerjaPdf: React.FC<Props> = ({ permohonan, sisaLT, sisaLB }) => {
  const dataBaruList = permohonan.dataBaru || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>KERTAS KERJA LAYANAN MUTASI SEBAGIAN</Text>

        {/* Nomor Pelayanan */}
        <Text style={styles.nomorPelayanan}>Nomor Pelayanan: {permohonan.nomorPelayanan || '-'}</Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, { width: '22%' }]}><Text>Keterangan</Text></View>
            <View style={[styles.tableHeaderCell, { width: '26%' }]}><Text>NOP</Text></View>
            <View style={[styles.tableHeaderCell, { width: '32%' }]}><Text>Nama WP</Text></View>
            <View style={[styles.tableHeaderCell, { width: '10%' }]}><Text>LT</Text></View>
            <View style={[styles.tableHeaderCellLast, { width: '10%' }]}><Text>LB</Text></View>
          </View>

          {/* NOP Induk Row */}
          <View style={dataBaruList.length === 0 ? styles.tableRowLast : styles.tableRow}>
            <View style={[styles.tableCell, { width: '22%', fontFamily: 'Helvetica-Bold' }]}><Text>NOP Induk</Text></View>
            <View style={[styles.tableCellCenter, { width: '26%', fontFamily: 'Helvetica-Bold' }]}><Text>{permohonan.nop}</Text></View>
            <View style={[styles.tableCell, { width: '32%' }]}><Text>{permohonan.namaPemilikLama || permohonan.namaWajibPajak || '-'}</Text></View>
            <View style={[styles.tableCellCenter, { width: '10%', fontFamily: 'Helvetica-Bold' }]}><Text>{String(sisaLT)}</Text></View>
            <View style={[styles.tableCellCenterLast, { width: '10%', fontFamily: 'Helvetica-Bold' }]}><Text>{String(sisaLB)}</Text></View>
          </View>

          {/* Pecahan Rows */}
          {dataBaruList.map((db: any, index: number) => {
            const isLast = index === dataBaruList.length - 1;
            return (
              <View style={isLast ? styles.tableRowLast : styles.tableRow} key={db.id || index}>
                <View style={[styles.tableCell, { width: '22%' }]}><Text>Pecahan {index + 1} *)</Text></View>
                <View style={[styles.tableCellCenter, { width: '26%' }]}><Text>-</Text></View>
                <View style={[styles.tableCell, { width: '32%' }]}><Text>{db.namaPemilikBaru || '-'}</Text></View>
                <View style={[styles.tableCellCenter, { width: '10%' }]}><Text>{String(db.luasTanahBaru || 0)}</Text></View>
                <View style={[styles.tableCellCenterLast, { width: '10%' }]}><Text>{String(db.luasBangunanBaru || 0)}</Text></View>
              </View>
            );
          })}
        </View>

        {/* Titik Koordinat */}
        <Text style={styles.koordinatTitle}>Titik Koordinat:</Text>
        <View style={styles.koordinatBox} />

        {/* Signature Verification Grid */}
        <View style={styles.signatureGrid}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureHeader}>UPT</Text>
            <View style={styles.signatureBody} />
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureHeader}>Bidang Pelayanan</Text>
            <View style={styles.signatureBody} />
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureHeader}>Subbid Penetapan</Text>
            <View style={styles.signatureBody} />
          </View>
          <View style={styles.signatureColLast}>
            <Text style={styles.signatureHeader}>Petugas Peta</Text>
            <View style={styles.signatureBody} />
          </View>
        </View>

        {/* Footnote */}
        <Text style={styles.footnote}>*) Diisi oleh petugas di Bidang</Text>
      </Page>
    </Document>
  );
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const permohonan = await prisma.permohonan.findUnique({
      where: { id },
      include: {
        dataBaru: true
      }
    });

    if (!permohonan) {
      return NextResponse.json({ error: 'Data permohonan tidak ditemukan' }, { status: 404 });
    }

    if (permohonan.jenisPermohonan !== 'MUTASI_SEBAGIAN') {
      return NextResponse.json({ error: 'Kertas Kerja hanya tersedia untuk jenis permohonan Mutasi Sebagian' }, { status: 400 });
    }

    // Calculate sisa LT and sisa LB:
    // sisa = NOP Induk Awal - Sum(Pecahan)
    const totalPecahanLT = permohonan.dataBaru?.reduce((sum: number, db: any) => sum + (db.luasTanahBaru || 0), 0) || 0;
    const totalPecahanLB = permohonan.dataBaru?.reduce((sum: number, db: any) => sum + (db.luasBangunanBaru || 0), 0) || 0;

    const sisaLT = Math.max(0, (permohonan.luasTanahLama || 0) - totalPecahanLT);
    const sisaLB = Math.max(0, (permohonan.luasBangunanLama || 0) - totalPecahanLB);

    const stream = await renderToStream(
      <KertasKerjaPdf permohonan={permohonan} sisaLT={sisaLT} sisaLB={sisaLB} />
    );
    
    const safeFilename = `Kertas-Kerja-${permohonan.nomorPermohonan.replace(/\//g, '-')}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFilename}"`
      }
    });
  } catch (error) {
    console.error('[KERTAS-KERJA-GEN-ERR]', error);
    return NextResponse.json({ error: 'Gagal membuat Kertas Kerja PDF' }, { status: 500 });
  }
}
