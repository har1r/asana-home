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

// Styles matching the official style guide
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#000000",
    lineHeight: 1.3
  },
  // Kop Surat
  kopContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 6,
    marginBottom: 15
  },
  logo: {
    width: 60,
    height: 70,
    marginRight: 12
  },
  kopTextContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 60
  },
  kopTitle1: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center"
  },
  kopTitle2: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 2
  },
  kopSubtitle: {
    fontSize: 7.5,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 1.25
  },
  // Document Title
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 15,
    textDecoration: "underline"
  },
  // Info grid
  infoGrid: {
    flexDirection: "row",
    marginBottom: 15,
    fontSize: 9
  },
  infoCol: {
    width: "50%"
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3
  },
  infoLabel: {
    width: 90,
    fontFamily: "Helvetica-Bold"
  },
  infoColon: {
    width: 10
  },
  infoVal: {
    flex: 1
  },
  // Table style
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    fontFamily: "Helvetica-Bold",
    alignItems: "center",
    minHeight: 22
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    alignItems: "center",
    minHeight: 20
  },
  tableRowLast: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 20
  },
  colNo: {
    width: "8%",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    padding: 4
  },
  colBundle: {
    width: "42%",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    padding: 4
  },
  colJenis: {
    width: "28%",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    padding: 4
  },
  colFiles: {
    width: "22%",
    textAlign: "center",
    padding: 4
  },
  // Signatures
  sigSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 35,
    fontSize: 9.5
  },
  sigBox: {
    width: "40%",
    alignItems: "center"
  },
  sigSpace: {
    height: 55
  },
  sigName: {
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline"
  }
});

interface ManifestPdfProps {
  manifest: any;
}

const SuratPengantarManifestPdf = ({ manifest }: ManifestPdfProps) => {
  const totalBundles = manifest.bundle.length;
  const totalFiles = manifest.bundle.reduce((acc: number, b: any) => acc + b.permohonan.length, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat */}
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

        {/* Title */}
        <Text style={styles.docTitle}>SURAT PENGANTAR MANIFEST PENGIRIMAN</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nomor Manifest</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{manifest.nomorManifest}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Petugas Pengirim</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{manifest.pengirim?.name || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Kirim</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{new Date(manifest.updatedAt).toLocaleDateString("id-ID")}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jumlah Map/Bundle</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{totalBundles} Map</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jumlah Berkas (WP)</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{totalFiles} Berkas</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status Manifest</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoVal}>{manifest.status}</Text>
            </View>
          </View>
        </View>

        {/* Table of Bundles */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colBundle}>Nomor Map / Bundle</Text>
            <Text style={styles.colJenis}>Jenis Berkas</Text>
            <Text style={styles.colFiles}>Jumlah Berkas</Text>
          </View>
          {manifest.bundle.map((b: any, index: number) => {
            const isLast = index === manifest.bundle.length - 1;
            return (
              <View key={b.id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.colNo}>{index + 1}</Text>
                <Text style={styles.colBundle}>{b.nomorBundle}</Text>
                <Text style={styles.colJenis}>{b.jenisPermohonan?.replace(/_/g, " ") || "-"}</Text>
                <Text style={styles.colFiles}>{b.permohonan.length} Berkas</Text>
              </View>
            );
          })}
        </View>

        {/* Signatures */}
        <View style={styles.sigSection}>
          <View style={styles.sigBox}>
            <Text>Dibuat & Dikirim Oleh,</Text>
            <Text style={{ marginTop: 2 }}>Petugas Logistik (Pengirim)</Text>
            <View style={styles.sigSpace} />
            <Text style={styles.sigName}>{manifest.pengirim?.name || "..........................."}</Text>
            <Text>NIP. ...........................</Text>
          </View>
          <View style={styles.sigBox}>
            <Text>Diterima & Diverifikasi Oleh,</Text>
            <Text style={{ marginTop: 2 }}>Petugas Kantor Pusat</Text>
            <View style={styles.sigSpace} />
            <Text style={styles.sigName}>..........................................</Text>
            <Text>NIP. ...........................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const manifest = await prisma.manifest.findUnique({
      where: { id },
      include: {
        bundles: {
          include: {
            applications: true
          }
        }
      }
    });

    if (!manifest) {
      return NextResponse.json({ error: "Manifest tidak ditemukan" }, { status: 404 });
    }

    const stream = await renderToStream(<SuratPengantarManifestPdf manifest={manifest} />);
    const safeFilename = `Surat-Pengantar-Manifest-${(manifest.manifestNumber || 'manifest').replace(/\//g, "-")}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"`
      }
    });
  } catch (error) {
    console.error("[PDF-GEN-MANIFEST-ERR]", error);
    return NextResponse.json({ error: "Gagal membuat file PDF" }, { status: 500 });
  }
}
