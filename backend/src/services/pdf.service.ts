import PDFDocument from 'pdfkit';
import { prisma } from '../db';

export const generatePdiPdf = async (runId: string): Promise<Buffer> => {
  const run = await prisma.inspectionRun.findUnique({
    where: { id: runId },
    include: {
      template: true,
      inspector: true,
      panel: {
        include: {
          workOrder: {
            include: {
              project: {
                include: {
                  customer: true,
                },
              },
              productTemplate: true,
            },
          },
          ncrs: true,
        },
      },
      results: {
        orderBy: {
          category: 'asc',
        },
      },
    },
  });

  if (!run) {
    throw new Error('Inspection run not found');
  }

  const panel = run.panel;
  const workOrder = panel.workOrder;
  const project = workOrder.project;
  const customer = project.customer;
  const product = workOrder.productTemplate;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36,
      info: {
        Title: `PDI Report — ${panel.serialNumber}`,
        Author: 'Bush Electromech BE-QTrack Digital QA System',
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- Header Section ---
    doc
      .rect(36, 36, 523, 50)
      .fillAndStroke('#f8f7f4', '#2d333b');

    doc
      .fillColor('#181b20')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('BUSH ELECTROMECH & ENGINEERING PVT. LTD.', 48, 44);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#475569')
      .text('K-89 / K-256, MIDC, Waluj, Chhatrapati Sambhajinagar — 431136, Maharashtra, India', 48, 60)
      .text('PRE-DISPATCH INSPECTION (PDI) QUALITY RELEASE CERTIFICATE', 48, 72);

    // Document Meta Box
    doc
      .rect(420, 42, 130, 38)
      .fillAndStroke('#ffffff', '#cbd5e1');
    doc
      .fontSize(7.5)
      .fillColor('#181b20')
      .font('Helvetica-Bold')
      .text(`Doc Ref: PDI-${panel.serialNumber}`, 424, 46)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Date: ${new Date(run.createdAt).toLocaleDateString('en-IN')}`, 424, 56)
      .text(`Run No: #${run.runNumber} | Rev: 1.0`, 424, 66);

    // --- Panel & Work Order Details Grid ---
    let y = 98;
    doc
      .rect(36, y, 523, 86)
      .fillAndStroke('#ffffff', '#e2e8f0');

    doc
      .fillColor('#d97706')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('1. EQUIPMENT & TRACEABILITY SPECIFICATION', 44, y + 6);

    doc
      .fillColor('#181b20')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Panel Serial Number:', 44, y + 20)
      .font('Helvetica')
      .text(panel.serialNumber, 150, y + 20)
      .font('Helvetica-Bold')
      .text('Product Description:', 44, y + 32)
      .font('Helvetica')
      .text(product.name, 150, y + 32)
      .font('Helvetica-Bold')
      .text('Breaker Integration:', 44, y + 44)
      .font('Helvetica')
      .text('ABB VD4 Horizontal Draw-out VCB (12 kV)', 150, y + 44)
      .font('Helvetica-Bold')
      .text('Ratings:', 44, y + 56)
      .font('Helvetica')
      .text('12 kV | 1250 A | 31.5 kA for 3s | 50 Hz | RAL 7032', 150, y + 56)
      .font('Helvetica-Bold')
      .text('Lifecycle Status:', 44, y + 68)
      .font('Helvetica-Bold')
      .fillColor(panel.status === 'DISPATCH_READY' || panel.status === 'DISPATCHED' ? '#059669' : '#d97706')
      .text(panel.status, 150, y + 68);

    doc
      .fillColor('#181b20')
      .font('Helvetica-Bold')
      .text('Customer:', 320, y + 20)
      .font('Helvetica')
      .text(customer.name, 400, y + 20)
      .font('Helvetica-Bold')
      .text('Customer Code:', 320, y + 32)
      .font('Helvetica')
      .text(customer.code, 400, y + 32)
      .font('Helvetica-Bold')
      .text('Work Order No:', 320, y + 44)
      .font('Helvetica')
      .text(workOrder.workOrderNo, 400, y + 44)
      .font('Helvetica-Bold')
      .text('Project:', 320, y + 56)
      .font('Helvetica')
      .text(project.projectNo, 400, y + 56)
      .font('Helvetica-Bold')
      .text('Inspection Status:', 320, y + 68)
      .font('Helvetica-Bold')
      .fillColor(run.status === 'Approved' ? '#059669' : '#dc2626')
      .text(run.status.toUpperCase(), 400, y + 68);

    // --- Inspection Checklist Table ---
    y = 194;
    doc
      .fillColor('#d97706')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('2. PRE-DISPATCH INSPECTION CHECKLIST & MEASURED VALUES', 44, y);

    y += 14;

    // Table Header
    doc
      .rect(36, y, 523, 18)
      .fillAndStroke('#2d333b', '#2d333b');

    doc
      .fillColor('#ffffff')
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text('Item', 42, y + 5)
      .text('Category', 70, y + 5)
      .text('Inspection Check Description', 140, y + 5)
      .text('Measured / Spec', 330, y + 5)
      .text('Result', 430, y + 5)
      .text('Remarks', 480, y + 5);

    y += 18;

    // Table Rows
    run.results.forEach((item, index) => {
      const rowColor = index % 2 === 0 ? '#ffffff' : '#f8f7f4';
      doc
        .rect(36, y, 523, 18)
        .fillAndStroke(rowColor, '#e2e8f0');

      const isPass = item.result === 'Pass';
      const isFail = item.result === 'Fail';
      const badgeColor = isPass ? '#059669' : isFail ? '#dc2626' : '#64748b';

      doc
        .fillColor('#181b20')
        .fontSize(7)
        .font('Helvetica')
        .text(String(index + 1), 44, y + 5)
        .text(item.category.slice(0, 14), 70, y + 5)
        .text(item.checkItem.slice(0, 45), 140, y + 5)
        .text(item.measuredValue ? `${item.measuredValue} ${item.unit || ''}` : item.acceptance?.slice(0, 22) || 'As per approved GA', 330, y + 5)
        .fillColor(badgeColor)
        .font('Helvetica-Bold')
        .text(item.result || 'PENDING', 430, y + 5)
        .fillColor('#475569')
        .font('Helvetica')
        .text(item.comment ? item.comment.slice(0, 16) : 'Verified OK', 480, y + 5);

      y += 18;
    });

    // --- Linked NCR Section if any ---
    y += 10;
    doc
      .fillColor('#d97706')
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .text('3. QUALITY NON-CONFORMANCE & CORRECTIVE ACTION STATUS', 44, y);

    y += 14;
    doc
      .rect(36, y, 523, 38)
      .fillAndStroke('#ffffff', '#e2e8f0');

    if (panel.ncrs && panel.ncrs.length > 0) {
      panel.ncrs.forEach((ncr, idx) => {
        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor('#181b20')
          .text(`NCR Ref #${idx + 1}: ${ncr.ncrNumber}`, 44, y + 6 + idx * 14)
          .font('Helvetica')
          .fillColor('#475569')
          .text(`[${ncr.defectCategory}] ${ncr.defectDescription.slice(0, 50)}...`, 160, y + 6 + idx * 14)
          .font('Helvetica-Bold')
          .fillColor(ncr.status === 'CLOSED' ? '#059669' : '#dc2626')
          .text(`Status: ${ncr.status}`, 460, y + 6 + idx * 14);
      });
    } else {
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#059669')
        .text('No active non-conformances identified during this inspection run. First-pass acceptance verified.', 44, y + 14);
    }

    // --- Authorization & Sign-off Box ---
    y += 48;
    doc
      .rect(36, y, 523, 70)
      .fillAndStroke('#ffffff', '#2d333b');

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#181b20')
      .text('Inspector Signature & Stamp', 50, y + 8)
      .text('Quality Manager Approval & Dispatch Release', 310, y + 8);

    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`Inspected By: ${run.inspector.name} (${run.inspector.role})`, 50, y + 26)
      .text(`Date & Time: ${new Date(run.createdAt).toLocaleString('en-IN')}`, 50, y + 38)
      .text('Digital Signature ID: BEQ-INSP-' + run.inspector.id.slice(0, 8), 50, y + 50)
      .text(`Approved By: ${run.approvedById ? 'Quality Head / Manager' : 'Pending Formal Sign-off'}`, 310, y + 26)
      .text(`Approval Date: ${run.approvedAt ? new Date(run.approvedAt).toLocaleDateString('en-IN') : 'Awaiting Review'}`, 310, y + 38)
      .font('Helvetica-Bold')
      .fillColor(run.status === 'Approved' ? '#059669' : '#ea580c')
      .text(`Dispatch Authorized: ${run.status === 'Approved' ? 'YES — RELEASED FOR DISPATCH' : 'HOLD — DISPATCH BLOCKED'}`, 310, y + 50);

    // --- Academic Exhibition Disclaimer ---
    y += 80;
    doc
      .fontSize(6.5)
      .font('Helvetica-Oblique')
      .fillColor('#64748b')
      .text(
        'ACADEMIC PROTOTYPE DISCLAIMER: BE-QTrack is a student-developed prototype for demonstration and exhibition purposes (Problem Statement Sr. No. 6: Automation & Digitalization). ' +
        'Company product references are based on publicly available documentation for the 12 kV Indoor VCB Panel. ' +
        'This document is generated by the prototype system and does not represent an approved commercial factory release.',
        36,
        y,
        { width: 523, align: 'center' }
      );

    doc.end();
  });
};
