import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];

function getGoogleDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error('Kredensial Google Drive belum dikonfigurasi di file .env.');
  }

  // Format private key jika terdapat karakter newline ter-escape
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: email,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

export async function uploadToGoogleDrive({
  buffer,
  fileName,
  mimeType = 'application/pdf',
}: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
}) {
  const drive = getGoogleDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);

  const fileMetaData: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetaData.parents = [folderId];
  }

  const media = {
    mimeType,
    body: readableStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetaData,
    media: media,
    supportsAllDrives: true,
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = response.data.id;
  const webViewLink = response.data.webViewLink;

  // Atur ijin file agar dapat dibuka/dipratinjau via link
  if (fileId) {
    try {
      await drive.permissions.create({
        fileId: fileId,
        supportsAllDrives: true,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('[GOOGLE-DRIVE-PERMISSION-WARN] Tidak dapat mengatur izin pembaca publik:', permErr);
    }
  }

  return {
    fileId,
    webViewLink: webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
  };
}
