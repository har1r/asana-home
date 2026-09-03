import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !["SENDER", "SUPERVISOR", "PENGIRIM"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        applications: true
      }
    });

    if (!bundle) {
      return NextResponse.json({ error: "Bundle tidak ditemukan" }, { status: 404 });
    }

    const headers = [
      "No",
      "Nomor Pelayanan",
      "Jenis Permohonan",
      "Nama Pemilik",
      "No WhatsApp",
      "Alamat"
    ];

    let csvContent = "sep=;\n" + headers.join(";") + "\n";
    let rowNo = 1;

    for (const p of (bundle.applications || [])) {
      const targetData = p.targetData || [];
      const previousData = p.previousData || [];
      const firstTarget = targetData[0] || {};
      const firstPrev = previousData[0] || {};

      const baseFields = [
        p.applicationNumber || "",
        p.applicationType || "",
        (firstTarget as any).ownerName || (firstPrev as any).ownerName || "",
        (firstTarget as any).whatsappNumber || "",
        (firstTarget as any).ownerAddress || (firstPrev as any).ownerAddress || ""
      ].map((val) => `"${val.replace(/"/g, '""')}"`);

      csvContent += `${rowNo};` + baseFields.join(";") + "\n";
      rowNo++;
    }

    const safeFilename = `export_bundle_${(bundle.bundleNumber || 'bundle').replace(/\//g, "-")}.csv`;

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
