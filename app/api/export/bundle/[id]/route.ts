import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !["PENGIRIM", "SUPERVISOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        permohonan: {
          include: {
            dataBaru: true
          }
        }
      }
    });

    if (!bundle) {
      return NextResponse.json({ error: "Bundle tidak ditemukan" }, { status: 404 });
    }

    const headers = [
      "No",
      "Nomor Pelayanan",
      "Nomor Permohonan",
      "NOP",
      "Jenis Permohonan",
      "Nama Wajib Pajak",
      "No WhatsApp",
      "Alamat Wajib Pajak",
      "Nama Pemilik Lama",
      "Alamat Pemilik Lama",
      "Kecamatan Pemilik Lama",
      "Desa Pemilik Lama",
      "Alamat Objek Lama",
      "Kecamatan Objek Lama",
      "Desa Objek Lama",
      "Luas Tanah Lama",
      "Luas Bangunan Lama",
      "Sertifikat Lama",
      "Nama Pemilik Baru",
      "Alamat Pemilik Baru",
      "Kecamatan Pemilik Baru",
      "Desa Pemilik Baru",
      "Alamat Objek Baru",
      "Kecamatan Objek Baru",
      "Desa Objek Baru",
      "Luas Tanah Baru",
      "Luas Bangunan Baru",
      "Sertifikat Baru"
    ];

    let csvContent = "sep=;\n" + headers.join(";") + "\n";
    let rowNo = 1;

    for (const p of bundle.permohonan) {
      const baseFields = [
        p.nomorPelayanan || "",
        p.nomorPermohonan || "",
        p.nop || "",
        p.jenisPermohonan || "",
        p.namaWajibPajak || "",
        p.noWhatsapp || "",
        p.alamat || "",
        p.namaPemilikLama || "",
        p.alamatPemilikLama || "",
        p.kecamatanPemilikLama || "",
        p.desaPemilikLama || "",
        p.alamatObjekLama || "",
        p.kecamatanObjekLama || "",
        p.desaObjekLama || "",
        p.luasTanahLama !== null && p.luasTanahLama !== undefined ? String(p.luasTanahLama) : "",
        p.luasBangunanLama !== null && p.luasBangunanLama !== undefined ? String(p.luasBangunanLama) : "",
        p.sertifikatLama || ""
      ].map((val) => `"${val.replace(/"/g, '""')}"`);

      if (p.dataBaru && p.dataBaru.length > 0) {
        for (const db of p.dataBaru) {
          const newFields = [
            db.namaPemilikBaru || "",
            db.alamatPemilikBaru || "",
            db.kecamatanPemilikBaru || "",
            db.desaPemilikBaru || "",
            db.alamatObjekBaru || "",
            db.kecamatanObjekBaru || "",
            db.desaObjekBaru || "",
            db.luasTanahBaru !== null && db.luasTanahBaru !== undefined ? String(db.luasTanahBaru) : "",
            db.luasBangunanBaru !== null && db.luasBangunanBaru !== undefined ? String(db.luasBangunanBaru) : "",
            db.sertifikatBaru || ""
          ].map((val) => `"${val.replace(/"/g, '""')}"`);

          csvContent += `${rowNo};` + baseFields.join(";") + ";" + newFields.join(";") + "\n";
          rowNo++;
        }
      } else {
        const newFields = Array(10).fill('""');
        csvContent += `${rowNo};` + baseFields.join(";") + ";" + newFields.join(";") + "\n";
        rowNo++;
      }
    }

    const safeFilename = `export_bundle_${bundle.nomorBundle.replace(/\//g, "-")}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}"`
      }
    });
  } catch (error) {
    console.error("[CSV-EXPORT-ERR]", error);
    return NextResponse.json({ error: "Gagal mengekspor berkas Excel" }, { status: 500 });
  }
}
