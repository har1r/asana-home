/**
 * Helper to dispatch WhatsApp notifications via Fonnte API
 */
export async function sendWhatsApp(target: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  
  if (!token) {
    console.warn('[WA-MOCK] FONNTE_TOKEN tidak dikonfigurasi di env. Men-skip pengiriman WA asli.');
    console.log(`[WA-MOCK] Target: ${target} | Pesan: "${message}"`);
    return false;
  }

  try {
    console.log(`[WA-DISPATCH] Mengirim pesan ke ${target}...`);
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
        message,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.status === true) {
      console.log(`[WA-SUCCESS] Berhasil terkirim ke ${target}. Response ID: ${data.id || 'N/A'}`);
      return true;
    } else {
      console.error('[WA-ERROR] Gagal mengirim pesan via Fonnte:', data);
      return false;
    }
  } catch (error) {
    console.error('[WA-EXCEPT] Kesalahan saat memanggil Fonnte API:', error);
    return false;
  }
}
