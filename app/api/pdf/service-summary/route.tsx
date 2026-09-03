import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

export const dynamic = 'force-dynamic';

const logoPath = path.join(process.cwd(), "assets", "logo_kabupatentangerang.png");
const logoBuffer = fs.readFileSync(logoPath);

// Helper formatted jenis
const formatJenis = (jenis: string) => {
  switch (jenis) {
    case 'MUTASI_SEBAGIAN': return 'Mutasi Sebagian';
    case 'MUTASI_HABIS_UPDATE': return 'Mutasi Habis (Update)';
    case 'MUTASI_HABIS_REGULER': return 'Mutasi Habis (Reguler)';
    case 'OBJEK_PAJAK_BARU': return 'Objek Pajak Baru';
    case 'PEMBETULAN': return 'Pembetulan Data';
    case 'PENGAKTIFAN': return 'Pengaktifan NOP';
    default: return jenis ? jenis.replace(/_/g, ' ') : 'Umum';
  }
};

const SERVICE_META_KEYS = [
  'OBJEK_PAJAK_BARU',
  'MUTASI_SEBAGIAN',
  'MUTASI_HABIS_UPDATE',
  'MUTASI_HABIS_REGULER',
  'PEMBETULAN',
  'PENGAKTIFAN'
];

// Styles for React-PDF Laporan Rangkuman Pelayanan Total (A4 Landscape)
const styles = StyleSheet.create({
  page: {
    paddingTop: 25,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#000000",
    lineHeight: 1.2
  },
  // Kop Surat
  kopContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    paddingBottom: 4,
    marginBottom: 8
  },
  logo: {
    width: 45,
    height: 52,
    marginRight: 10
  },
  kopTextContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 45
  },
  kopTitle1: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center"
  },
  kopTitle2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 1
  },
  kopSubtitle: {
    fontSize: 6.5,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 1.2
  },
  // Section Headers
  docTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 2,
    textDecoration: "underline"
  },
  docPeriod: {
    fontSize: 8,
    fontFamily: "Helvetica",
    textAlign: "center",
    marginBottom: 8,
    color: "#333333"
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 4,
    marginTop: 6,
    textTransform: "uppercase"
  },

  // 1. Summary Stats Box
  statsContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#cccccc",
    backgroundColor: "#f8fafc",
    borderRadius: 3,
    padding: 5,
    marginBottom: 8,
    justifyContent: "space-between"
  },
  statBox: {
    flex: 1,
    alignItems: "center"
  },
  statVal: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#008f78"
  },
  statLabel: {
    fontSize: 7,
    color: "#475569",
    marginTop: 1
  },

  // Generic Table Styles
  table: {
    width: "100%",
    borderWidth: 0.8,
    borderColor: "#000000",
    marginBottom: 8
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 0.8,
    borderBottomColor: "#000000",
    fontFamily: "Helvetica-Bold",
    alignItems: "center",
    minHeight: 18
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.4,
    borderBottomColor: "#cbd5e1",
    alignItems: "center",
    minHeight: 16
  },
  
  // Section 2 & 3 Table Columns
  cServiceJenis: { width: "30%", padding: 3, borderRightWidth: 0.4, borderRightColor: "#cbd5e1" },
  cServiceNum: { width: "11.6%", textAlign: "center", padding: 3, borderRightWidth: 0.4, borderRightColor: "#cbd5e1" },
  cServiceNumLast: { width: "11.6%", textAlign: "center", padding: 3 },

  cKecNo: { width: "6%", textAlign: "center", padding: 3, borderRightWidth: 0.4, borderRightColor: "#cbd5e1" },
  cKecName: { width: "30%", padding: 3, borderRightWidth: 0.4, borderRightColor: "#cbd5e1" },
  cKecNum: { width: "16%", textAlign: "center", padding: 3, borderRightWidth: 0.4, borderRightColor: "#cbd5e1" },
  cKecNumLast: { width: "16%", textAlign: "center", padding: 3 },

  // Section 4 Detail Table Columns
  colNo: { width: "4%", textAlign: "center", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5 },
  colNopel: { width: "18%", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5, fontSize: 7.5 },
  colPemohon: { width: "23%", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5 },
  colJenis: { width: "17%", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5 },
  colWilayah: { width: "16%", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5, fontSize: 7 },
  colLuas: { width: "12%", borderRightWidth: 0.4, borderRightColor: "#cbd5e1", padding: 2.5, fontSize: 7 },
  colTgl: { width: "10%", textAlign: "center", padding: 2.5, fontSize: 7 },

  // Signatures
  sigSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    fontSize: 8
  },
  sigBox: {
    width: "40%",
    alignItems: "center"
  },
  sigSpace: {
    height: 38
  },
  sigName: {
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline"
  }
});

interface RangkumanPdfProps {
  list: any[];
  startDateStr: string;
  endDateStr: string;
  printedBy: string;
}

const RangkumanPelayananPdf = ({ list, startDateStr, endDateStr, printedBy }: RangkumanPdfProps) => {
  // 1. RANGKUMAN KESELURUHAN (GLOBAL SUMMARY)
  let totalNopel = list.length;
  let totalPemohon = 0;
  let totalSelesai = 0;
  let totalProses = 0;
  let totalDikirim = 0;
  let totalRevisi = 0;

  // 2. RANGKUMAN PER JENIS LAYANAN
  const serviceStats: Record<string, { totalNopel: number; totalPemohon: number; selesai: number; proses: number; dikirim: number; revisi: number }> = {};
  SERVICE_META_KEYS.forEach(key => {
    serviceStats[key] = { totalNopel: 0, totalPemohon: 0, selesai: 0, proses: 0, dikirim: 0, revisi: 0 };
  });

  // 3. RANGKUMAN PER KECAMATAN
  const kecStatsMap: Record<string, { kecamatan: string; totalNopel: number; totalPemohon: number; selesai: number; proses: number; dikirimRevisi: number }> = {};

  // 4. TABEL DETAIL PELAYANAN (FLATTENED PECAHAN PER BARIS - EXACT 75 PECAHAN ROW BALANCING)
  const flattenedRows: Array<{
    id: string;
    nopel: string;
    namaPemohon: string;
    jenis: string;
    wilayah: string;
    luasTanahBangunan: string;
    tanggalNopel: string;
  }> = [];

  list.forEach(item => {
    const pemohonCountInItem = item.dataBaru && item.dataBaru.length > 0 ? item.dataBaru.length : 1;
    totalPemohon += pemohonCountInItem;

    const st = String(item.status);
    if (st === "COMPLETED") totalSelesai += pemohonCountInItem;
    else if (st === "MANIFESTED" || st === "ARCHIVED") totalDikirim += pemohonCountInItem;
    else if (st === "REVISION" || st === "REJECTED" || st === "VOID") totalRevisi += pemohonCountInItem;
    else totalProses += pemohonCountInItem;

    // Per Jenis Layanan aggregation
    const stKey = item.jenisPermohonan || 'OBJEK_PAJAK_BARU';
    if (!serviceStats[stKey]) {
      serviceStats[stKey] = { totalNopel: 0, totalPemohon: 0, selesai: 0, proses: 0, dikirim: 0, revisi: 0 };
    }
    serviceStats[stKey].totalNopel += 1;
    serviceStats[stKey].totalPemohon += pemohonCountInItem;
    if (st === "COMPLETED") serviceStats[stKey].selesai += pemohonCountInItem;
    else if (st === "MANIFESTED" || st === "ARCHIVED") serviceStats[stKey].dikirim += pemohonCountInItem;
    else if (st === "REVISION" || st === "REJECTED" || st === "VOID") serviceStats[stKey].revisi += pemohonCountInItem;
    else serviceStats[stKey].proses += pemohonCountInItem;

    // Per Kecamatan aggregation & Flattened Detail Rows
    if (item.dataBaru && item.dataBaru.length > 0) {
      item.dataBaru.forEach((db: any, dbIdx: number) => {
        const kec = (db.kecamatanObjekBaru || item.kecamatanObjekLama || 'KECAMATAN LAIN').trim().toUpperCase();
        const desa = (db.desaObjekBaru || item.desaObjekLama || '-').trim().toUpperCase();

        if (!kecStatsMap[kec]) {
          kecStatsMap[kec] = { kecamatan: kec, totalNopel: 0, totalPemohon: 0, selesai: 0, proses: 0, dikirimRevisi: 0 };
        }
        kecStatsMap[kec].totalPemohon += 1;
        if (dbIdx === 0) kecStatsMap[kec].totalNopel += 1;
        if (st === "COMPLETED") kecStatsMap[kec].selesai += 1;
        else if (st === "MANIFESTED" || st === "ARCHIVED" || st === "REVISION" || st === "REJECTED" || st === "VOID") kecStatsMap[kec].dikirimRevisi += 1;
        else kecStatsMap[kec].proses += 1;

        // Date Nopel formatting (Hanya Tanggal Nopel saja, bukan jam input)
        const tglNopelStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-";

        flattenedRows.push({
          id: db.id || `${item.id}_${dbIdx}`,
          nopel: item.nomorPelayanan || item.nop || "-",
          namaPemohon: db.namaPemilikBaru || db.namaBaru || item.namaWajibPajak || "-",
          jenis: formatJenis(item.jenisPermohonan),
          wilayah: `${kec} / ${desa}`,
          luasTanahBangunan: `Lt. ${db.luasTanahBaru || item.luasTanahLama || 0}m² / Lb. ${db.luasBangunanBaru || item.luasBangunanLama || 0}m²`,
          tanggalNopel: tglNopelStr
        });
      });
    } else {
      const kec = (item.kecamatanObjekLama || 'KECAMATAN LAIN').trim().toUpperCase();
      const desa = (item.desaObjekLama || '-').trim().toUpperCase();

      if (!kecStatsMap[kec]) {
        kecStatsMap[kec] = { kecamatan: kec, totalNopel: 0, totalPemohon: 0, selesai: 0, proses: 0, dikirimRevisi: 0 };
      }
      kecStatsMap[kec].totalNopel += 1;
      kecStatsMap[kec].totalPemohon += 1;
      if (st === "COMPLETED") kecStatsMap[kec].selesai += 1;
      else if (st === "MANIFESTED" || st === "ARCHIVED" || st === "REVISION" || st === "REJECTED" || st === "VOID") kecStatsMap[kec].dikirimRevisi += 1;
      else kecStatsMap[kec].proses += 1;

      const tglNopelStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-";

      flattenedRows.push({
        id: item.id,
        nopel: item.nomorPelayanan || item.nop || "-",
        namaPemohon: item.namaWajibPajak || "-",
        jenis: formatJenis(item.jenisPermohonan),
        wilayah: `${kec} / ${desa}`,
        luasTanahBangunan: `Lt. ${item.luasTanahLama || 0}m² / Lb. ${item.luasBangunanLama || 0}m²`,
        tanggalNopel: tglNopelStr
      });
    }
  });

  const kecList = Object.values(kecStatsMap).sort((a, b) => b.totalPemohon - a.totalPemohon);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Kop Surat Resmi */}
        <View style={styles.kopContainer} fixed>
          <Image src={logoBuffer} style={styles.logo} />
          <View style={styles.kopTextContainer}>
            <Text style={styles.kopTitle1}>PEMERINTAH KABUPATEN TANGERANG</Text>
            <Text style={styles.kopTitle2}>BADAN PENDAPATAN DAERAH</Text>
            <Text style={styles.kopSubtitle}>
              Sistem Informasi Pelayanan Pajak Daerah (SIPETRA) - Architax Module{"\n"}
              Jl. H. Somawinata No. 1 Gedung B Bapenda, Tigaraksa, Tangerang{"\n"}
              Telepon: (021) 5990264, Email: bapenda@tangerangkab.go.id
            </Text>
          </View>
        </View>

        {/* Header Title */}
        <Text style={styles.docTitle}>RANGKUMAN REKAPITULASI PELAYANAN PAJAK DAERAH</Text>
        <Text style={styles.docPeriod}>
          Periode Pelayanan: {startDateStr && endDateStr ? `${startDateStr} s/d ${endDateStr}` : "Seluruh Periode Terdata"}
          {"  |  "}Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </Text>

        {/* BAGIAN 1: RANGKUMAN KESELURUHAN (GLOBAL SUMMARY BOX) */}
        <Text style={styles.sectionHeading}>1. RANGKUMAN KESELURUHAN</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalNopel}</Text>
            <Text style={styles.statLabel}>Total Nopel</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalPemohon}</Text>
            <Text style={styles.statLabel}>Total Pemohon</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalSelesai}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalProses}</Text>
            <Text style={styles.statLabel}>Dalam Proses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalDikirim}</Text>
            <Text style={styles.statLabel}>Sudah Dikirim</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalRevisi}</Text>
            <Text style={styles.statLabel}>Revisi/Void</Text>
          </View>
        </View>

        {/* BAGIAN 2: RANGKUMAN PER JENIS LAYANAN */}
        <Text style={styles.sectionHeading}>2. RANGKUMAN PER JENIS LAYANAN</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cServiceJenis}>Jenis Layanan</Text>
            <Text style={styles.cServiceNum}>Total Nopel</Text>
            <Text style={styles.cServiceNum}>Total Pemohon</Text>
            <Text style={styles.cServiceNum}>Selesai</Text>
            <Text style={styles.cServiceNum}>Dalam Proses</Text>
            <Text style={styles.cServiceNum}>Sudah Dikirim</Text>
            <Text style={styles.cServiceNumLast}>Revisi / Void</Text>
          </View>
          {SERVICE_META_KEYS.map((key) => {
            const s = serviceStats[key] || { totalNopel: 0, totalPemohon: 0, selesai: 0, proses: 0, dikirim: 0, revisi: 0 };
            return (
              <View key={key} style={styles.tableRow}>
                <Text style={styles.cServiceJenis}>{formatJenis(key)}</Text>
                <Text style={styles.cServiceNum}>{s.totalNopel}</Text>
                <Text style={styles.cServiceNum}>{s.totalPemohon}</Text>
                <Text style={styles.cServiceNum}>{s.selesai}</Text>
                <Text style={styles.cServiceNum}>{s.proses}</Text>
                <Text style={styles.cServiceNum}>{s.dikirim}</Text>
                <Text style={styles.cServiceNumLast}>{s.revisi}</Text>
              </View>
            );
          })}
        </View>

        {/* BAGIAN 3: RANGKUMAN PER KECAMATAN */}
        <Text style={styles.sectionHeading}>3. RANGKUMAN PER KECAMATAN</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cKecNo}>No</Text>
            <Text style={styles.cKecName}>Nama Kecamatan</Text>
            <Text style={styles.cKecNum}>Total Nopel</Text>
            <Text style={styles.cKecNum}>Total Pemohon</Text>
            <Text style={styles.cKecNum}>Selesai</Text>
            <Text style={styles.cKecNum}>Dalam Proses</Text>
            <Text style={styles.cKecNumLast}>Dikirim / Revisi</Text>
          </View>
          {kecList.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={{ width: "100%", textAlign: "center", padding: 3 }}>Tidak ada data wilayah</Text>
            </View>
          ) : (
            kecList.map((k, idx) => (
              <View key={k.kecamatan || idx} style={styles.tableRow}>
                <Text style={styles.cKecNo}>{idx + 1}</Text>
                <Text style={styles.cKecName}>{k.kecamatan}</Text>
                <Text style={styles.cKecNum}>{k.totalNopel}</Text>
                <Text style={styles.cKecNum}>{k.totalPemohon}</Text>
                <Text style={styles.cKecNum}>{k.selesai}</Text>
                <Text style={styles.cKecNum}>{k.proses}</Text>
                <Text style={styles.cKecNumLast}>{k.dikirimRevisi}</Text>
              </View>
            ))
          )}
        </View>

        {/* BAGIAN 4: TABEL DETAIL PELAYANAN (FLATTENED PECAHAN BARIS — TOTAL 75 BARIS PECAHAN BALANCED) */}
        <Text style={styles.sectionHeading}>4. TABEL DETAIL PELAYANAN (TOTAL {flattenedRows.length} PECAHAN PEMOHON)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colNopel}>No. Pelayanan / NOP</Text>
            <Text style={styles.colPemohon}>Nama Pemohon / WP</Text>
            <Text style={styles.colJenis}>Jenis Layanan</Text>
            <Text style={styles.colWilayah}>Kecamatan / Desa</Text>
            <Text style={styles.colLuas}>Luas Tnh / Bgn</Text>
            <Text style={styles.colTgl}>Tgl Nopel</Text>
          </View>

          {flattenedRows.map((row, idx) => (
            <View key={row.id || idx} style={styles.tableRow} wrap={false}>
              <Text style={styles.colNo}>{idx + 1}</Text>
              <Text style={styles.colNopel}>{row.nopel}</Text>
              <Text style={styles.colPemohon}>{row.namaPemohon}</Text>
              <Text style={styles.colJenis}>{row.jenis}</Text>
              <Text style={styles.colWilayah}>{row.wilayah}</Text>
              <Text style={styles.colLuas}>{row.luasTanahBangunan}</Text>
              <Text style={styles.colTgl}>{row.tanggalNopel}</Text>
            </View>
          ))}
        </View>

        {/* BAGIAN 5: TANDA TANGAN RESMI */}
        <View style={styles.sigSection} wrap={false}>
          <View style={styles.sigBox}>
            <Text>Dicetak Oleh,</Text>
            <Text style={{ marginTop: 2 }}>Petugas Operator / Pemantau</Text>
            <View style={styles.sigSpace} />
            <Text style={styles.sigName}>{printedBy || "..........................."}</Text>
          </View>
          <View style={styles.sigBox}>
            <Text>Mengetahui,</Text>
            <Text style={{ marginTop: 2 }}>Kepala Bidang Pelayanan Bapenda</Text>
            <View style={styles.sigSpace} />
            <Text style={styles.sigName}>..........................................</Text>
            <Text>NIP. ...........................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate") || "";
  const endDateStr = searchParams.get("endDate") || "";

  try {
    const whereClause: any = {};
    if (startDateStr || endDateStr) {
      whereClause.createdAt = {};
      if (startDateStr) {
        whereClause.createdAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const list = await prisma.application.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    const printedBy = session.user?.name || session.user?.email || "Operator Bapenda";

    const formattedStart = startDateStr ? new Date(startDateStr).toLocaleDateString("id-ID") : "";
    const formattedEnd = endDateStr ? new Date(endDateStr).toLocaleDateString("id-ID") : "";

    const stream = await renderToStream(
      <RangkumanPelayananPdf
        list={list}
        startDateStr={formattedStart}
        endDateStr={formattedEnd}
        printedBy={printedBy}
      />
    );

    const filename = `Rangkuman-Pelayanan-Bapenda-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error("[PDF-RANGKUMAN-ERR]", err);
    return NextResponse.json({ error: "Gagal membuat PDF Rangkuman Pelayanan" }, { status: 500 });
  }
}
