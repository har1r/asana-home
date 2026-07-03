import { renderToStream } from '@react-pdf/renderer';
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const logoPath = path.join(process.cwd(), 'assets', 'logo_kabupatentangerang.png');
const logoBuffer = fs.readFileSync(logoPath);

// PDF Styling layout to exactly mirror SP_Hal_1, SP_Hal_2, and SP_Hal_2_MH
const styles = StyleSheet.create({
  pagePortrait: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  pageLandscape: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  // Kop Surat
  kopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 6,
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 70,
    marginRight: 12,
  },
  kopTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 60, // Balance the logo margin to center text perfectly
  },
  kopTitle1: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  kopTitle2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 2,
  },
  kopSubtitle: {
    fontSize: 7.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 1.25,
  },
  // Metadata Section Page 1
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaLeft: {
    width: '65%',
  },
  metaRight: {
    width: '35%',
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metaLabel: {
    width: 65,
  },
  metaColon: {
    width: 10,
  },
  metaValue: {
    flex: 1,
  },
  metaValueBold: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  // Recipient block
  recipientBlock: {
    marginBottom: 15,
    lineHeight: 1.3,
  },
  recipientText: {
    marginBottom: 2,
  },
  bodyText: {
    lineHeight: 1.4,
    marginBottom: 12,
    textAlign: 'justify',
  },
  // Table Page 1
  tablePage1: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 15,
  },
  tableRowPage1: {
    flexDirection: 'row',
  },
  tableHeaderColPage1: {
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableHeaderColLastPage1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCellColPage1: {
    borderRightWidth: 1.5,
    borderRightColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    textAlign: 'center',
  },
  tableCellColLastPage1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    textAlign: 'center',
  },
  // Table Page 2 (Landscape layout matching the second page)
  tablePage2: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
    marginTop: 10,
    marginBottom: 20,
  },
  tableRowPage2: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableRowPage2Header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#ffffff',
  },
  tableHeaderColPage2: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
  },
  tableHeaderColLastPage2: {
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
  },
  tableCellColPage2: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 4,
    fontSize: 6.5,
    justifyContent: 'center',
  },
  tableCellColLastPage2: {
    padding: 4,
    fontSize: 6.5,
    justifyContent: 'center',
  },
  // Double-header and sub-column table styles (Mutasi Habis)
  headerColDouble: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    flexDirection: 'column',
  },
  headerDoubleMainLabel: {
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    fontSize: 6.5,
  },
  headerDoubleSubRow: {
    flexDirection: 'row',
    flex: 1,
  },
  headerDoubleSubCol: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
  },
  headerDoubleSubLabel: {
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    fontSize: 5.5,
  },
  cellDouble: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    flexDirection: 'row',
  },
  cellDoubleSubView: {
    justifyContent: 'center',
    padding: 4,
  },
  // Signature block
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  signatureBox: {
    width: 250,
    alignItems: 'center',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  signatureDept: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 45,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  signatureNip: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 2,
  },
  // Metadata Section Page 2
  metaLandscape: {
    fontSize: 8.5,
    marginBottom: 10,
    lineHeight: 1.3,
  },
  metaLandscapeRow: {
    flexDirection: 'row',
  },
  metaLandscapeLabel: {
    width: 50,
  },
  metaLandscapeLabelMH: {
    width: 80,
  },
  metaLandscapeColon: {
    width: 10,
  },
  metaLandscapeValue: {
    flex: 1,
  },
});

// Helper function to format jenis permohonan
const formatJenisLayanan = (jenis: string) => {
  if (!jenis) return '';
  switch (jenis) {
    case 'MUTASI_SEBAGIAN': return 'Mutasi Sebagian';
    case 'MUTASI_HABIS_UPDATE': return 'Mutasi Habis Update';
    case 'MUTASI_HABIS_REGULER': return 'Mutasi Habis Reguler';
    case 'OBJEK_PAJAK_BARU': return 'Objek Pajak Baru';
    case 'PEMBETULAN': return 'Pembetulan';
    case 'PENGAKTIFAN': return 'Pengaktifan';
    default: return jenis.replace(/_/g, ' ');
  }
};

// Calculate total files (lampiran / agenda count)
// "jumlah itu merupakan jumlah berkas kecuali mutasi sebagian itu dihitung dari jumlah data barunya"
const getJumlahBerkas = (bundle: any) => {
  let count = 0;
  if (!bundle.permohonan) return 0;
  for (const p of bundle.permohonan) {
    if (p.jenisPermohonan === 'MUTASI_SEBAGIAN') {
      count += p.dataBaru?.length || 0;
    } else {
      count += 1;
    }
  }
  return count;
};

// Map database permohonan entries to flat table rows for Page 2 (Standard/Mutasi Sebagian)
const getTableRows = (permohonanList: any[]) => {
  const rows: any[] = [];
  permohonanList.forEach((p) => {
    if (p.dataBaru && p.dataBaru.length > 0) {
      p.dataBaru.forEach((db: any) => {
        rows.push({
          nomorPelayanan: p.nomorPelayanan || '-',
          nop: p.nop,
          namaPemohon: db.namaPemilikBaru || '-',
          namaSppt: p.namaPemilikLama || p.namaWajibPajak || '-',
          alamatOp: db.alamatObjekBaru || '-',
          desa: db.desaObjekBaru || '-',
          kec: db.kecamatanObjekBaru || '-',
          jenis: formatJenisLayanan(p.jenisPermohonan),
          lt: db.luasTanahBaru || 0,
          lb: db.luasBangunanBaru || 0,
          bukti: db.sertifikatBaru || '-'
        });
      });
    } else {
      rows.push({
        nomorPelayanan: p.nomorPelayanan || '-',
        nop: p.nop,
        namaPemohon: p.namaWajibPajak || '-',
        namaSppt: p.namaPemilikLama || '-',
        alamatOp: p.alamat || '-',
        desa: p.desaObjekLama || '-',
        kec: p.kecamatanObjekLama || '-',
        jenis: formatJenisLayanan(p.jenisPermohonan),
        lt: p.luasTanahLama || 0,
        lb: p.luasBangunanLama || 0,
        bukti: p.sertifikatLama || '-'
      });
    }
  });
  return rows;
};

// Map database permohonan to rows for Mutasi Habis Page 2
const getTableRowsMH = (
  permohonanList: any[], 
  numbersMap: Record<string, { noBumi: number; noBangunan: number | null }>
) => {
  return permohonanList.map((p) => {
    const num = numbersMap[p.id] || { noBumi: 0, noBangunan: null };
    const db = p.dataBaru?.[0];
    
    // Check if LT & LB has differences for Keterangan
    const isLtDiff = p.luasTanahLama !== (db?.luasTanahBaru ?? 0);
    const isLbDiff = p.luasBangunanLama !== (db?.luasBangunanBaru ?? 0);
    let keterangan = '-';
    if (isLtDiff && isLbDiff) {
      keterangan = 'UPD LT & LB';
    } else if (isLtDiff) {
      keterangan = 'UPD LT';
    } else if (isLbDiff) {
      keterangan = 'UPD LB';
    }

    return {
      nomorPelayanan: p.nomorPelayanan || '-',
      noBumi: num.noBumi,
      noBangunan: num.noBangunan,
      nop: p.nop,
      wpLama: p.namaPemilikLama || p.namaWajibPajak || '-',
      wpBaru: db?.namaPemilikBaru || '-',
      luasTanahLama: p.luasTanahLama || 0,
      luasTanahBaru: db?.luasTanahBaru || 0,
      luasBangunanLama: p.luasBangunanLama || 0,
      luasBangunanBaru: db?.luasBangunanBaru || 0,
      kepemilikan: db?.sertifikatBaru || '-',
      keterangan
    };
  });
};

// React PDF Template Component
interface Props {
  bundle: any;
  mutasiHabisNumbersMap: Record<string, { noBumi: number; noBangunan: number | null }>;
}

const SuratPengantarPdf: React.FC<Props> = ({ bundle, mutasiHabisNumbersMap }) => {
  const formattedDate = new Date(bundle.updatedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const currentYear = new Date(bundle.createdAt).getFullYear();
  const jenisLayanan = formatJenisLayanan(bundle.jenisPermohonan || '');
  const totalBerkas = getJumlahBerkas(bundle);
  const bundleSeq = bundle.nomorBundle.split('/')[1] || bundle.nomorBundle;

  const isMutasiHabis = bundle.jenisPermohonan === 'MUTASI_HABIS_UPDATE' || bundle.jenisPermohonan === 'MUTASI_HABIS_REGULER';
  
  const tableRowsPage2 = isMutasiHabis 
    ? [] 
    : getTableRows(bundle.permohonan || []);

  const tableRowsPage2MH = isMutasiHabis 
    ? getTableRowsMH(bundle.permohonan || [], mutasiHabisNumbersMap) 
    : [];

  const roleTitle = isMutasiHabis ? 'KEPALA UNIT PELAKSANA TEKNIS' : 'Kepala UPTD';
  const deptTitle = isMutasiHabis ? 'PAJAK DAERAH WILAYAH IV' : 'Pajak Daerah Wilayah IV';

  return (
    <Document>
      {/* PAGE 1 (Portrait) */}
      <Page size="A4" orientation="portrait" style={styles.pagePortrait}>
        {/* Kop Surat */}
        <View style={styles.kopContainer}>
          <Image src={{ data: logoBuffer, format: 'png' }} style={styles.logo} />
          <View style={styles.kopTextContainer}>
            <Text style={styles.kopTitle1}>PEMERINTAH KABUPATEN TANGERANG</Text>
            <Text style={styles.kopTitle2}>BADAN PENDAPATAN DAERAH</Text>
            <Text style={styles.kopSubtitle}>
              Gedung Pendapatan Daerah Komp. Perkantoran Tigaraksa{"\n"}
              Telp. (021) 599 88333 Fax. (021) 599 88333{"\n"}
              Website: bapendatangerangkab.go.id Email: bapenda@tangerangkab.go.id
            </Text>
          </View>
        </View>

        {/* Metadata Section */}
        <View style={styles.metaContainer}>
          <View style={styles.metaLeft}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Nomor</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValueBold}>{bundle.nomorBundle}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Lampiran</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValue}>{String(totalBerkas)} Berkas</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Hal</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValueBold}>Rekomendasi Permohonan {jenisLayanan} SPPT Tahun {String(currentYear)}</Text>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Text>Tigaraksa, {formattedDate}</Text>
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.recipientBlock}>
          <Text>Yth. Kepala Badan Pendapatan Daerah</Text>
          <Text>Cq. Kepala Bidang Pendataan, Penilaian, dan Penetapan Pajak Daerah</Text>
          <Text>di</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Tempat</Text>
        </View>

        {/* Intro Body */}
        <Text style={styles.bodyText}>
          Dipermaklumkan dengan hormat, bersama ini kami sampaikan data permohonan {jenisLayanan} SPPT PBB Tahun {String(currentYear)} pada pelayanan tatap muka UPTD Wilayah IV sebagai berikut:
        </Text>

        {/* Table Page 1 */}
        <View style={styles.tablePage1}>
          {/* Header Row */}
          <View style={[styles.tableRowPage1, { borderBottomWidth: 1.5, borderBottomColor: '#000000', backgroundColor: '#ffffff' }]}>
            <View style={[styles.tableHeaderColPage1, { width: '20%' }]}><Text>NO AGENDA</Text></View>
            <View style={[styles.tableHeaderColPage1, { width: '35%' }]}><Text>JENIS</Text></View>
            <View style={[styles.tableHeaderColPage1, { width: '20%' }]}><Text>JUMLAH</Text></View>
            <View style={[styles.tableHeaderColLastPage1, { width: '25%' }]}><Text>KETERANGAN</Text></View>
          </View>
          
          {/* Data Row */}
          <View style={styles.tableRowPage1}>
            <View style={[styles.tableCellColPage1, { width: '20%' }]}><Text>{String(bundleSeq)}</Text></View>
            <View style={[styles.tableCellColPage1, { width: '35%' }]}><Text>{jenisLayanan}</Text></View>
            <View style={[styles.tableCellColPage1, { width: '20%' }]}><Text>{String(totalBerkas)} Berkas</Text></View>
            <View style={[styles.tableCellColLastPage1, { width: '25%' }]}><Text>Rincian Berkas Terlampir</Text></View>
          </View>
        </View>

        {/* Outro Body */}
        <Text style={styles.bodyText}>
          Sehubungan dengan hal ini, bahwa berkas permohonan {jenisLayanan} SPPT PBB tersebut sudah melalui proses penelitian/verifikasi dan diarsipkan sebagaimana mestinya (data terlampir).
        </Text>
        <Text style={styles.bodyText}>
          Demikian surat rekomendasi ini kami sampaikan, atas perhatiannya diucapkan terimakasih.
        </Text>

        {/* Signature Page 1 */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>Kepala UPTD</Text>
            <Text style={styles.signatureDept}>Pajak Daerah Wilayah IV</Text>
            <View style={{ height: 40 }} />
            <Text style={styles.signatureName}>ASEP SUANDI, SH., M.Si</Text>
            <Text style={styles.signatureNip}>NIP. 19800630 200801 1 006</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2 (Landscape) */}
      <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
        {/* Top Metadata */}
        {isMutasiHabis ? (
          <View style={styles.metaLandscape}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Lampiran</Text>
            <View style={styles.metaLandscapeRow}>
              <Text style={styles.metaLandscapeLabelMH}>Nomor Pengantar</Text>
              <Text style={styles.metaLandscapeColon}>:</Text>
              <Text style={styles.metaLandscapeValue}>{bundle.nomorBundle}</Text>
            </View>
            <View style={styles.metaLandscapeRow}>
              <Text style={styles.metaLandscapeLabelMH}>Tanggal</Text>
              <Text style={styles.metaLandscapeColon}>:</Text>
              <Text style={styles.metaLandscapeValue}>{formattedDate}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.metaLandscape}>
            <View style={styles.metaLandscapeRow}>
              <Text style={styles.metaLandscapeLabel}>Nomor</Text>
              <Text style={styles.metaLandscapeColon}>:</Text>
              <Text style={styles.metaLandscapeValue}>{bundle.nomorBundle}</Text>
            </View>
            <View style={styles.metaLandscapeRow}>
              <Text style={styles.metaLandscapeLabel}>Tanggal</Text>
              <Text style={styles.metaLandscapeColon}>:</Text>
              <Text style={styles.metaLandscapeValue}>{formattedDate}</Text>
            </View>
          </View>
        )}

        {/* Conditionally Render Table matching SP_Hal_2_MH (Mutasi Habis) or SP_Hal_2 (Standard) */}
        {isMutasiHabis ? (
          <View style={styles.tablePage2}>
            {/* Header Row MH */}
            <View style={styles.tableRowPage2Header}>
              <View style={[styles.tableHeaderColPage2, { width: '3%' }]}><Text>NO</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '7%' }]}><Text>NOPEL</Text></View>
              
              {/* NO BUNDEL FORMULIR */}
              <View style={[styles.headerColDouble, { width: '8%' }]}>
                <Text style={styles.headerDoubleMainLabel}>NO BUNDEL FORMULIR</Text>
                <View style={styles.headerDoubleSubRow}>
                  <View style={[styles.headerDoubleSubCol, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Bumi</Text>
                  </View>
                  <View style={[styles.headerDoubleSubCol, { width: '50%' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Bangunan</Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.tableHeaderColPage2, { width: '12%' }]}><Text>NOP</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '8%' }]}><Text>WP LAMA</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '8%' }]}><Text>WP BARU</Text></View>
              
              {/* Letak Objek Saat Ini */}
              <View style={[styles.headerColDouble, { width: '12%' }]}>
                <Text style={styles.headerDoubleMainLabel}>Letak Objek Saat Ini</Text>
                <View style={styles.headerDoubleSubRow}>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>Nama Jalan</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>Blok/Kav/No</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>RT</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%' }]}><Text style={styles.headerDoubleSubLabel}>RW</Text></View>
                </View>
              </View>
              
              {/* Letak Objek Seharusnya */}
              <View style={[styles.headerColDouble, { width: '12%' }]}>
                <Text style={styles.headerDoubleMainLabel}>Letak Objek Seharusnya</Text>
                <View style={styles.headerDoubleSubRow}>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>Nama Jalan</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>Blok/Kav/No</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text style={styles.headerDoubleSubLabel}>RT</Text></View>
                  <View style={[styles.headerDoubleSubCol, { width: '25%' }]}><Text style={styles.headerDoubleSubLabel}>RW</Text></View>
                </View>
              </View>
              
              {/* Luas Tanah */}
              <View style={[styles.headerColDouble, { width: '8%' }]}>
                <Text style={styles.headerDoubleMainLabel}>Luas Tanah</Text>
                <View style={styles.headerDoubleSubRow}>
                  <View style={[styles.headerDoubleSubCol, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Saat Ini</Text>
                  </View>
                  <View style={[styles.headerDoubleSubCol, { width: '50%' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Seharusnya</Text>
                  </View>
                </View>
              </View>
              
              {/* Luas Bangunan */}
              <View style={[styles.headerColDouble, { width: '8%' }]}>
                <Text style={styles.headerDoubleMainLabel}>Luas Bangunan</Text>
                <View style={styles.headerDoubleSubRow}>
                  <View style={[styles.headerDoubleSubCol, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Saat Ini</Text>
                  </View>
                  <View style={[styles.headerDoubleSubCol, { width: '50%' }]}>
                    <Text style={styles.headerDoubleSubLabel}>Seharusnya</Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.tableHeaderColPage2, { width: '8%' }]}><Text>Kepemilikan</Text></View>
              <View style={[styles.tableHeaderColLastPage2, { width: '6%' }]}><Text>Keterangan</Text></View>
            </View>

            {/* Data Rows MH */}
            {tableRowsPage2MH.map((row, index) => (
              <View style={styles.tableRowPage2} key={index}>
                <View style={[styles.tableCellColPage2, { width: '3%', textAlign: 'center' }]}><Text>{String(index + 1)}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '7%', textAlign: 'center' }]}><Text>{row.nomorPelayanan}</Text></View>
                
                {/* BUNDEL FORMULIR values */}
                <View style={[styles.cellDouble, { width: '8%' }]}>
                  <View style={[styles.cellDoubleSubView, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000', alignItems: 'center' }]}>
                    <Text>{String(row.noBumi)}</Text>
                  </View>
                  <View style={[styles.cellDoubleSubView, { width: '50%', alignItems: 'center' }]}>
                    <Text>{row.noBangunan ? String(row.noBangunan) : ''}</Text>
                  </View>
                </View>
                
                <View style={[styles.tableCellColPage2, { width: '12%', textAlign: 'center' }]}><Text>{row.nop}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '8%' }]}><Text>{row.wpLama}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '8%' }]}><Text>{row.wpBaru}</Text></View>
                
                {/* Letak Objek Saat Ini values (Empty in image) */}
                <View style={[styles.cellDouble, { width: '12%' }]}>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%' }]}><Text></Text></View>
                </View>
                
                {/* Letak Objek Seharusnya values (Empty in image) */}
                <View style={[styles.cellDouble, { width: '12%' }]}>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%', borderRightWidth: 1, borderRightColor: '#000000' }]}><Text></Text></View>
                  <View style={[styles.cellDoubleSubView, { width: '25%' }]}><Text></Text></View>
                </View>
                
                {/* Luas Tanah values */}
                <View style={[styles.cellDouble, { width: '8%' }]}>
                  <View style={[styles.cellDoubleSubView, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000', alignItems: 'center' }]}>
                    <Text>{String(row.luasTanahLama)}</Text>
                  </View>
                  <View style={[styles.cellDoubleSubView, { width: '50%', alignItems: 'center' }]}>
                    <Text>{String(row.luasTanahBaru)}</Text>
                  </View>
                </View>
                
                {/* Luas Bangunan values */}
                <View style={[styles.cellDouble, { width: '8%' }]}>
                  <View style={[styles.cellDoubleSubView, { width: '50%', borderRightWidth: 1, borderRightColor: '#000000', alignItems: 'center' }]}>
                    <Text>{String(row.luasBangunanLama)}</Text>
                  </View>
                  <View style={[styles.cellDoubleSubView, { width: '50%', alignItems: 'center' }]}>
                    <Text>{String(row.luasBangunanBaru)}</Text>
                  </View>
                </View>
                
                <View style={[styles.tableCellColPage2, { width: '8%' }]}><Text>{row.kepemilikan}</Text></View>
                <View style={[styles.tableCellColLastPage2, { width: '6%', textAlign: 'center' }]}><Text>{row.keterangan}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.tablePage2}>
            {/* Header Row Standard */}
            <View style={styles.tableRowPage2Header}>
              <View style={[styles.tableHeaderColPage2, { width: '3%' }]}><Text>NO</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '9%' }]}><Text>NOPEL</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '13%' }]}><Text>NOP</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '11%' }]}><Text>NAMA PEMOHON</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '11%' }]}><Text>NAMA SPPT</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '13%' }]}><Text>ALAMAT OP</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '8%' }]}><Text>DESA</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '8%' }]}><Text>KEC</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '10%' }]}><Text>JENIS</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '4%' }]}><Text>LT</Text></View>
              <View style={[styles.tableHeaderColPage2, { width: '4%' }]}><Text>LB</Text></View>
              <View style={[styles.tableHeaderColLastPage2, { width: '6%' }]}><Text>BUKTI</Text></View>
            </View>

            {/* Data Rows Standard */}
            {tableRowsPage2.map((row, index) => (
              <View style={styles.tableRowPage2} key={index}>
                <View style={[styles.tableCellColPage2, { width: '3%', textAlign: 'center' }]}><Text>{String(index + 1)}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '9%', textAlign: 'center' }]}><Text>{row.nomorPelayanan}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '13%', textAlign: 'center' }]}><Text>{row.nop}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '11%' }]}><Text>{row.namaPemohon}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '11%' }]}><Text>{row.namaSppt}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '13%' }]}><Text>{row.alamatOp}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '8%' }]}><Text>{row.desa}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '8%' }]}><Text>{row.kec}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '10%' }]}><Text>{row.jenis}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '4%', textAlign: 'center' }]}><Text>{String(row.lt)}</Text></View>
                <View style={[styles.tableCellColPage2, { width: '4%', textAlign: 'center' }]}><Text>{String(row.lb)}</Text></View>
                <View style={[styles.tableCellColLastPage2, { width: '6%' }]}><Text>{row.bukti}</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* Signature Page 2 */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureRole}>{roleTitle}</Text>
            <Text style={styles.signatureDept}>{deptTitle}</Text>
            <View style={{ height: 40 }} />
            <Text style={styles.signatureName}>ASEP SUANDI, SH., M.Si</Text>
            <Text style={styles.signatureNip}>NIP. 19800630 200801 1 006</Text>
          </View>
        </View>
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
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        permohonan: {
          include: {
            dataBaru: true
          }
        },
        peneliti: { select: { name: true } }
      }
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle tidak ditemukan' }, { status: 404 });
    }

    // Determine if it is a Mutasi Habis bundle
    const isMutasiHabis = bundle.jenisPermohonan === 'MUTASI_HABIS_UPDATE' || bundle.jenisPermohonan === 'MUTASI_HABIS_REGULER';
    let mutasiHabisNumbersMap: Record<string, { noBumi: number; noBangunan: number | null }> = {};

    if (isMutasiHabis) {
      const currentYear = new Date(bundle.createdAt).getFullYear();

      // Fetch all Mutasi Habis permohonan of the same calendar year that are bundled
      const allMutasiHabisYear = await prisma.permohonan.findMany({
        where: {
          jenisPermohonan: {
            in: ['MUTASI_HABIS_UPDATE', 'MUTASI_HABIS_REGULER']
          },
          bundleId: { not: null },
          bundle: {
            createdAt: {
              gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
              lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
            }
          }
        },
        include: {
          bundle: true,
          dataBaru: true
        },
        orderBy: [
          { bundle: { createdAt: 'asc' } },
          { createdAt: 'asc' }
        ]
      });

      // Distribute Bumi & Bangunan numbers sequentially (resetting per year)
      let counter = 1;
      for (const p of allMutasiHabisYear) {
        const db = p.dataBaru?.[0];
        const hasBuildingDiff = p.luasBangunanLama !== (db?.luasBangunanBaru ?? 0);
        
        const noBumi = counter;
        counter += 1;

        let noBangunan: number | null = null;
        if (hasBuildingDiff) {
          noBangunan = counter;
          counter += 1;
        }

        mutasiHabisNumbersMap[p.id] = { noBumi, noBangunan };
      }
    }

    const stream = await renderToStream(
      <SuratPengantarPdf bundle={bundle} mutasiHabisNumbersMap={mutasiHabisNumbersMap} />
    );
    
    const safeFilename = `Surat-Pengantar-${bundle.nomorBundle.replace(/\//g, '-')}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFilename}"`
      }
    });
  } catch (error) {
    console.error('[PDF-GEN-ERR]', error);
    return NextResponse.json({ error: 'Gagal membuat file PDF' }, { status: 500 });
  }
}
