import { prisma } from '../db';
import QRCode from 'qrcode';

export const generatePanelSerialNumber = async (productCode: string): Promise<string> => {
  const year = new Date().getFullYear();
  // Clean productCode: 12KV -> 12K
  const cleanCode = productCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || '12K';
  const prefix = `BEE-${cleanCode}-${year}`;

  const lastPanel = await prisma.panel.findFirst({
    where: {
      serialNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      serialNumber: 'desc',
    },
  });

  let nextSeq = 1;
  if (lastPanel && lastPanel.serialNumber) {
    const parts = lastPanel.serialNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(3, '0');
  return `${prefix}-${seqStr}`;
};

export const generateQrDataUri = async (payload: {
  serialNumber: string;
  panelId: string;
  url?: string;
}): Promise<string> => {
  const content = payload.url || JSON.stringify({
    app: 'BE-QTrack',
    serial: payload.serialNumber,
    id: payload.panelId,
  });

  return await QRCode.toDataURL(content, {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#181b20',
      light: '#ffffff',
    },
  });
};
