import { PrismaClient, Role, PanelStatus, NcrStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding BE-QTrack Demonstration Data ---');

  // Clear existing data in correct relational order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.dispatchRecord.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.engineeringChange.deleteMany();
  await prisma.inspectionResult.deleteMany();
  await prisma.inspectionRun.deleteMany();
  await prisma.inspectionTemplateItem.deleteMany();
  await prisma.inspectionTemplate.deleteMany();
  await prisma.correctiveAction.deleteMany();
  await prisma.ncrStatusHistory.deleteMany();
  await prisma.ncr.deleteMany();
  await prisma.bomItemVerification.deleteMany();
  await prisma.bomItem.deleteMany();
  await prisma.bomRevision.deleteMany();
  await prisma.panelStatusHistory.deleteMany();
  await prisma.panel.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.project.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.incomingInspection.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Users & Roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@beqtrack.com',
        name: 'System Admin',
        role: Role.ADMIN,
        passwordHash: defaultPasswordHash,
        department: 'Information Technology',
        badgeNumber: 'ADM-001',
      },
    }),
    prisma.user.create({
      data: {
        email: 'engineering@beqtrack.com',
        name: 'Nilesh Lokhande',
        role: Role.ENGINEERING,
        passwordHash: defaultPasswordHash,
        department: 'Design & Engineering',
        badgeNumber: 'ENG-102',
      },
    }),
    prisma.user.create({
      data: {
        email: 'inspector@beqtrack.com',
        name: 'Ganesh Kulkarni',
        role: Role.QUALITY_INSPECTOR,
        passwordHash: defaultPasswordHash,
        department: 'Quality Assurance',
        badgeNumber: 'QA-204',
      },
    }),
    prisma.user.create({
      data: {
        email: 'quality.head@beqtrack.com',
        name: 'Santosh Bhoyar',
        role: Role.QUALITY_MANAGER,
        passwordHash: defaultPasswordHash,
        department: 'Quality Management',
        badgeNumber: 'QM-005',
      },
    }),
    prisma.user.create({
      data: {
        email: 'production@beqtrack.com',
        name: 'Rajesh Patil',
        role: Role.PRODUCTION,
        passwordHash: defaultPasswordHash,
        department: 'Manufacturing Operations',
        badgeNumber: 'PRD-308',
      },
    }),
    prisma.user.create({
      data: {
        email: 'stores@beqtrack.com',
        name: 'Amol Shinde',
        role: Role.PROCUREMENT,
        passwordHash: defaultPasswordHash,
        department: 'Supply Chain & Stores',
        badgeNumber: 'SCM-411',
      },
    }),
    prisma.user.create({
      data: {
        email: 'director@beqtrack.com',
        name: 'Executive Management',
        role: Role.MANAGEMENT,
        passwordHash: defaultPasswordHash,
        department: 'Executive Board',
        badgeNumber: 'MGT-001',
      },
    }),
  ]);

  const [adminUser, engUser, inspUser, qmUser, prodUser, storesUser, mgtUser] = users;
  console.log(`✓ Seeded ${users.length} users with role accounts`);

  // 2. Product Template: 12 kV Indoor VCB Panel with ABB VD4
  const vcbProduct = await prisma.productTemplate.create({
    data: {
      code: '12KV-INDOOR-VCB',
      name: '12 kV Indoor Air-Insulated Draw-out VCB Panel',
      description:
        'Indoor Air-Insulated Vacuum Circuit Breaker Switchboard fitted with ABB horizontal draw-out type VD4 vacuum circuit breaker. Fully compartmentalized with integral mechanical & electrical safety interlocks.',
      category: 'Medium Voltage Switchgear',
      ratedVoltage: '12 kV',
      ratedCurrent: '1250 A',
      ratedFrequency: '50 Hz',
      imageUrl: '/assets/12kv-vcb-panel.png',
      specifications: {
        insulationTechnology: 'Air-Insulated Metal-Clad',
        breakerMake: 'ABB',
        breakerModel: 'VD4 Horizontal Draw-out',
        ratedPowerFrequencyWithstandVoltage: '28 kV for 1 min',
        ratedLightningImpulseWithstandVoltage: '75 kV peak',
        ratedShortTimeWithstandCurrent: '31.5 kA for 3s',
        peakCurrent: '65.75 kA',
        busbarCurrent: '1250 A (Configurable up to 2000 A)',
        branchCurrent: '1250 A',
        enclosureWeight: '600 kg (Approx)',
        standardPaintShade: 'RAL 7032 Siemens Grey (Powder Coated)',
        maintenanceClearanceFront: '1.5 m',
        maintenanceClearanceRear: '1.0 m',
        maintenanceClearanceSides: '1.0 m',
        cableConnectionHeight: '600 mm',
        applicableStandards: 'IEC 62271-200, IEC 62271-100, IS 3427',
        typeTestStation: 'CPRI / ERDA Tested',
      },
    },
  });

  // 3. Customers
  const custWockhardt = await prisma.customer.create({
    data: {
      code: 'CUST-WOCK',
      name: 'Wockhardt Pharma Ltd',
      address: 'Plot No. L-1, MIDC Area, Waluj, Chhatrapati Sambhajinagar',
      contact: 'Dr. Vivek Sharma',
      email: 'procurement@wockhardt.com',
      phone: '+91 240 6632222',
    },
  });

  const custVarroc = await prisma.customer.create({
    data: {
      code: 'CUST-VARROC',
      name: 'Varroc Engineering Ltd',
      address: 'Plant VII, E-4, MIDC Waluj, Chhatrapati Sambhajinagar',
      contact: 'Mr. Hemant Kulkarni',
      email: 'electrical.projects@varroc.com',
      phone: '+91 240 2554000',
    },
  });

  // 4. Projects & Work Orders
  const project1 = await prisma.project.create({
    data: {
      projectNo: 'PRJ-2026-042',
      name: 'Wockhardt Bulk Drug Substation 11kV Modernization',
      customerId: custWockhardt.id,
      description: 'Supply of 12kV Air-Insulated Indoor VCB Incomer & Outgoing Panels with ABB VD4 breakers',
      status: 'Active',
      startDate: new Date('2026-10-01'),
      targetDate: new Date('2026-11-25'),
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      workOrderNo: 'WO-2026-081',
      projectId: project1.id,
      productTemplateId: vcbProduct.id,
      quantity: 5,
      status: 'In Production',
      priority: 'High',
      description: '12kV 1250A 31.5kA Indoor VCB Panels with Siemens Numerical Relays',
      targetDate: new Date('2026-11-20'),
      specifications: {
        incomerRating: '1250 A',
        relayType: 'Siemens 7SJ82',
        auxRelayMake: 'Schneider CAD32',
        paintShade: 'RAL 7032 Siemens Grey',
      },
    },
  });

  // 5. Approved BOM Revision for WO-2026-081
  const bomRev1 = await prisma.bomRevision.create({
    data: {
      bomNumber: 'BOM-WO081',
      workOrderId: wo1.id,
      revision: 1,
      status: 'Approved',
      approvedBy: engUser.name,
      approvedAt: new Date('2026-10-10'),
      notes: 'Approved standard engineering release for 12kV 1250A VCB Panel configuration',
    },
  });

  const bomItemsData = [
    {
      itemNo: 1,
      componentCode: 'VCB-ABB-VD4-1250',
      componentName: 'Vacuum Circuit Breaker Assembly',
      manufacturer: 'ABB',
      modelNumber: 'VD4 12.12.32',
      requiredQty: 1,
      unit: 'Nos',
      technicalSpec: '12 kV, 1250 A, 31.5 kA 3s, Horizontal Draw-out',
      category: 'Circuit Breaker',
      installLocation: 'Breaker Compartment',
    },
    {
      itemNo: 2,
      componentCode: 'REL-NUM-7SJ82',
      componentName: 'Numerical Protection Relay',
      manufacturer: 'Siemens',
      modelNumber: '7SJ82 Reyrolle',
      requiredQty: 1,
      unit: 'Nos',
      technicalSpec: 'Overcurrent & Earth Fault, IEC 61850 protocol',
      category: 'Protection Relay',
      installLocation: 'Low Voltage Compartment Door',
    },
    {
      itemNo: 3,
      componentCode: 'REL-AUX-CAD32',
      componentName: 'Auxiliary Contactor Relay',
      manufacturer: 'Schneider Electric',
      modelNumber: 'CAD32-BD',
      requiredQty: 2,
      unit: 'Nos',
      technicalSpec: '3NO+2NC contacts, 24V DC coil',
      category: 'Auxiliary Control',
      installLocation: 'LV Base Plate Rail',
    },
    {
      itemNo: 4,
      componentCode: 'CT-12KV-1250',
      componentName: 'Cast Resin Current Transformers',
      manufacturer: 'Schneider Electric / Pragati',
      modelNumber: 'PR-12-CT',
      requiredQty: 3,
      unit: 'Nos',
      technicalSpec: 'Ratio: 1250/5A, 15VA, Class 5P20 + 0.2S',
      category: 'Instrument Transformer',
      installLocation: 'Cable / CT Compartment',
    },
    {
      itemNo: 5,
      componentCode: 'BUS-CU-1250A',
      componentName: 'Electrolytic Copper Main Busbar Set',
      manufacturer: 'Bush In-House / Hindalco',
      modelNumber: 'EC-Grade-Cu-100x10',
      requiredQty: 1,
      unit: 'Set',
      technicalSpec: '100x10 mm flat copper, heat-shrink sleeved',
      category: 'Busbar System',
      installLocation: 'Busbar Compartment',
    },
    {
      itemNo: 6,
      componentCode: 'INS-EPOXY-12KV',
      componentName: 'Epoxy Support Post Insulators',
      manufacturer: 'Baroda Polyform',
      modelNumber: 'BPI-12-PI',
      requiredQty: 6,
      unit: 'Nos',
      technicalSpec: '12 kV Indoor Post Insulator, 28 kV withstand',
      category: 'Insulation',
      installLocation: 'Busbar & Cable Chamber',
    },
    {
      itemNo: 7,
      componentCode: 'MTR-MFM-PM5350',
      componentName: 'Digital Multifunction Energy Meter',
      manufacturer: 'Schneider Electric',
      modelNumber: 'PowerLogic PM5350',
      requiredQty: 1,
      unit: 'Nos',
      technicalSpec: 'Class 0.5S, RS-485 Modbus RTU',
      category: 'Metering',
      installLocation: 'LV Door Fascia',
    },
    {
      itemNo: 8,
      componentCode: 'SW-TNC-SPRING',
      componentName: 'Trip-Neutral-Close (TNC) Control Switch',
      manufacturer: 'Kaycee',
      modelNumber: 'TNC-10A-SR',
      requiredQty: 1,
      unit: 'Nos',
      technicalSpec: 'Spring return to neutral, pistol grip handle',
      category: 'Control Switch',
      installLocation: 'LV Door Fascia',
    },
    {
      itemNo: 9,
      componentCode: 'IND-LAMP-LED-24',
      componentName: 'LED Indication Lamps (R, Y, B, On, Off, Trip)',
      manufacturer: 'Teknic',
      modelNumber: 'PL-22-LED',
      requiredQty: 6,
      unit: 'Nos',
      technicalSpec: '22.5 mm, 24V DC / 240V AC universal',
      category: 'Indication',
      installLocation: 'LV Door Fascia',
    },
    {
      itemNo: 10,
      componentCode: 'TB-DISC-6SQ',
      componentName: 'Disconnecting Test Terminal Blocks',
      manufacturer: 'Phoenix Contact',
      modelNumber: 'UT-6-HESI',
      requiredQty: 36,
      unit: 'Nos',
      technicalSpec: '6 sq.mm DIN rail mounted with test disconnect sliders',
      category: 'Terminals',
      installLocation: 'LV Compartment Side Rail',
    },
    {
      itemNo: 11,
      componentCode: 'EARTH-CU-25X6',
      componentName: 'Earth Busbar with Mechanical Interlock',
      manufacturer: 'Bush In-House',
      modelNumber: 'EB-25X6-CU',
      requiredQty: 1,
      unit: 'Set',
      technicalSpec: '25x6 mm copper flat with earthing truck jaws',
      category: 'Earthing System',
      installLocation: 'Bottom Panel Plinth',
    },
    {
      itemNo: 12,
      componentCode: 'ENC-CRCA-RAL7032',
      componentName: 'Panel Enclosure Sheet-Metal Framework',
      manufacturer: 'Bush Electromech In-House Fabrication',
      modelNumber: 'BE-12K-ENC-01',
      requiredQty: 1,
      unit: 'Nos',
      technicalSpec: '2.0 mm CRCA steel, CNC laser cut, RAL 7032 powder coated',
      category: 'Enclosure',
      installLocation: 'Structural Assembly',
    },
  ];

  const bomItems = [];
  for (const item of bomItemsData) {
    const createdItem = await prisma.bomItem.create({
      data: {
        bomRevisionId: bomRev1.id,
        ...item,
      },
    });
    bomItems.push(createdItem);
  }
  console.log(`✓ Seeded Approved BOM Revision 1 with ${bomItems.length} line items`);

  // 6. Primary Demonstration Panel: BEE-12K-2026-001
  const serial001 = 'BEE-12K-2026-001';
  const qrData001 = await QRCode.toDataURL(
    JSON.stringify({
      app: 'BE-QTrack',
      serial: serial001,
      product: '12 kV Indoor VCB Panel',
      breaker: 'ABB VD4 1250A',
    }),
    { margin: 2, color: { dark: '#181b20', light: '#ffffff' } }
  );

  const panel001 = await prisma.panel.create({
    data: {
      serialNumber: serial001,
      workOrderId: wo1.id,
      status: PanelStatus.PDI,
      qrCodeData: qrData001,
      specifications: {
        ratedVoltage: '12 kV',
        ratedCurrent: '1250 A',
        breakingCapacity: '31.5 kA',
        breakerSerial: 'ABB-VD4-2026-98124',
        relaySerial: 'SIE-7SJ-82-44102',
        enclosureColor: 'RAL 7032 Siemens Grey',
      },
      notes: 'Demonstration primary reference panel for exhibition evaluation. Comprehensive digital traceability dossier.',
    },
  });

  // Panel 001 Status History
  const statusProgression = [
    { from: 'NONE', to: 'DRAFT', by: 'Nilesh Lokhande', reason: 'Order registered and engineering design initiated', time: new Date('2026-10-11') },
    { from: 'DRAFT', to: 'ENGINEERING', by: 'Nilesh Lokhande', reason: 'SLD and GA drawings frozen', time: new Date('2026-10-12') },
    { from: 'ENGINEERING', to: 'BOM_APPROVED', by: 'Santosh Bhoyar', reason: 'BOM Revision 1 approved for production procurement', time: new Date('2026-10-14') },
    { from: 'BOM_APPROVED', to: 'MATERIAL_READY', by: 'Amol Shinde', reason: 'ABB VD4 breaker and copper busbars received and inspected', time: new Date('2026-10-18') },
    { from: 'MATERIAL_READY', to: 'MANUFACTURING', by: 'Rajesh Patil', reason: 'Fabrication and busbar assembly initiated', time: new Date('2026-10-20') },
    { from: 'MANUFACTURING', to: 'IN_PROCESS_QC', by: 'Rajesh Patil', reason: 'Mechanical assembly completed, submitted for in-process inspection', time: new Date('2026-10-28') },
    { from: 'IN_PROCESS_QC', to: 'FINAL_TESTING', by: 'Ganesh Kulkarni', reason: 'In-process clearances and wiring continuity verified', time: new Date('2026-11-02') },
    { from: 'FINAL_TESTING', to: 'PDI', by: 'Ganesh Kulkarni', reason: 'Routine power-frequency testing completed, staged for PDI', time: new Date('2026-11-05') },
  ];

  for (const s of statusProgression) {
    await prisma.panelStatusHistory.create({
      data: {
        panelId: panel001.id,
        fromStatus: s.from,
        toStatus: s.to,
        changedBy: s.by,
        reason: s.reason,
        createdAt: s.time,
      },
    });
  }

  // 7. BOM Verification for Panel 001 (including the intentional auxiliary relay discrepancy!)
  for (const item of bomItems) {
    if (item.componentCode === 'REL-AUX-CAD32') {
      // INTENTIONAL DISCREPANCY: CAD33 installed instead of approved CAD32!
      await prisma.bomItemVerification.create({
        data: {
          bomItemId: item.id,
          panelId: panel001.id,
          actualManufacturer: 'Schneider Electric',
          actualModel: 'CAD33-BD (3NO+3NC)', // Discrepancy!
          actualQty: 2,
          actualSpec: '3NO+3NC instead of 3NO+2NC specified in approved BOM Rev 1',
          status: 'Mismatch',
          remarks: 'Discrepancy detected during shopfloor staging. Physical relay contacts do not match approved schematic wiring diagram.',
          verifiedById: inspUser.id,
          verifiedAt: new Date('2026-10-29T11:30:00Z'),
        },
      });
    } else {
      await prisma.bomItemVerification.create({
        data: {
          bomItemId: item.id,
          panelId: panel001.id,
          actualManufacturer: item.manufacturer,
          actualModel: item.modelNumber,
          actualQty: item.requiredQty,
          actualSpec: item.technicalSpec,
          actualSerial: item.itemNo === 1 ? 'ABB-VD4-2026-98124' : undefined,
          status: 'Matched',
          remarks: 'Verified as per approved engineering drawings',
          verifiedById: inspUser.id,
          verifiedAt: new Date('2026-10-29T10:00:00Z'),
        },
      });
    }
  }

  // 8. Manufacturing Operation Logs for Panel 001
  const operationsData = [
    { op: 'CNC Laser Cutting', stage: 'Sheet Metal Fabrication', desc: 'Laser cutting 2.0mm CRCA doors and side covers on unit laser machine', hrs: 3.5, operator: prodUser.id },
    { op: 'CNC Bending', stage: 'Sheet Metal Fabrication', desc: 'Precision hydraulic bending of cubicle pillars and door folds', hrs: 4.0, operator: prodUser.id },
    { op: 'Surface Preparation & Powder Coating', stage: 'Surface Finishing', desc: '7-tank chemical pre-treatment and electrostatic powder coating with RAL 7032 Siemens Grey', hrs: 6.0, operator: prodUser.id },
    { op: 'Busbar Fabrication & Heat-Shrink Sleeving', stage: 'Electrical Assembly', desc: 'Bending of 100x10 mm copper flats, punching and heat-shrink insulation sleeving (Red/Yellow/Blue)', hrs: 5.0, operator: prodUser.id },
    { op: 'Breaker Racking Mechanism Fitment', stage: 'Mechanical Assembly', desc: 'Mounting draw-out carriage cassette, shutter interlock linkage, and safety earthing jaws', hrs: 4.5, operator: prodUser.id },
    { op: 'ABB VD4 Circuit Breaker Rack-in Testing', stage: 'Mechanical Assembly', desc: 'Trial insertion and racking from TEST to SERVICE position with door closed', hrs: 2.0, operator: prodUser.id },
    { op: 'Low Voltage Control Wiring & Ferrule Labeling', stage: 'Control & Wiring', desc: 'Control wiring with 2.5 sq.mm Polycab multi-strand cable, cross-ferrule labeling and harness routing', hrs: 7.0, operator: prodUser.id },
  ];

  for (const op of operationsData) {
    await prisma.operationLog.create({
      data: {
        panelId: panel001.id,
        operation: op.op,
        stage: op.stage,
        description: op.desc,
        operatorId: op.operator,
        status: 'Completed',
        startTime: new Date('2026-10-21'),
        endTime: new Date('2026-10-27'),
        remarks: 'Completed adhering to standard switchgear manufacturing practice',
      },
    });
  }

  // 9. Inspection Template: 12 kV Indoor VCB Pre-Dispatch Inspection (PDI)
  const pdiTemplate = await prisma.inspectionTemplate.create({
    data: {
      name: '12 kV Indoor VCB Panel Pre-Dispatch Inspection (PDI)',
      type: 'PDI',
      productCode: '12KV-INDOOR-VCB',
      version: 1,
      items: {
        create: [
          // A. Document & Identification Checks
          {
            category: 'Document & Marking',
            itemNo: 1,
            checkItem: 'Nameplate & Rating Verification',
            acceptance: 'Nameplate legible: 12kV, 1250A, 31.5kA 3s, IS/IEC standard markings present',
            unit: 'Visual Check',
            isMandatory: true,
            sortOrder: 1,
          },
          {
            category: 'Document & Marking',
            itemNo: 2,
            checkItem: 'Single Line Diagram (SLD) & Schematic Alignment',
            acceptance: 'Wiring ferrules match approved schematic Rev 1.0',
            unit: 'Visual Check',
            isMandatory: true,
            sortOrder: 2,
          },
          // B. Visual Inspection
          {
            category: 'Visual & Finish',
            itemNo: 3,
            checkItem: 'Powder Coating Thickness & Paint Shade',
            acceptance: 'RAL 7032 Siemens Grey, uniform coating 60–80 microns, scratch-free',
            unit: 'microns',
            isMandatory: true,
            sortOrder: 3,
          },
          {
            category: 'Visual & Finish',
            itemNo: 4,
            checkItem: 'Degree of Protection & Gasketing (IP4X)',
            acceptance: 'Neoprene door gaskets continuous, no gaps, enclosure IP4X compliant',
            unit: 'Visual Check',
            isMandatory: true,
            sortOrder: 4,
          },
          {
            category: 'Visual & Finish',
            itemNo: 5,
            checkItem: 'Cable Box Clearance & Earthing Busbar Connection',
            acceptance: 'Copper earth bus 25x6mm clean, tight, cable termination height >= 600mm',
            unit: 'mm',
            isMandatory: true,
            sortOrder: 5,
          },
          // C. Mechanical Inspection & Interlocks
          {
            category: 'Mechanical & Interlocks',
            itemNo: 6,
            checkItem: 'VCB Draw-out Carriage Racking Effort',
            acceptance: 'Smooth travel from Disconnected/Test to Connected position with door closed',
            unit: 'Torque (N-m)',
            isMandatory: true,
            sortOrder: 6,
          },
          {
            category: 'Mechanical & Interlocks',
            itemNo: 7,
            checkItem: 'Safety Shutter Automatic Operation',
            acceptance: 'Automatic metallic shutters open on rack-in and positively close/lock on rack-out',
            unit: 'Functional Check',
            isMandatory: true,
            sortOrder: 7,
          },
          {
            category: 'Mechanical & Interlocks',
            itemNo: 8,
            checkItem: 'Breaker Closed Racking Prevention Interlock',
            acceptance: 'Mechanically impossible to rack in or rack out breaker while main contacts are CLOSED',
            unit: 'Safety Interlock',
            isMandatory: true,
            sortOrder: 8,
          },
          // D. Electrical & Functional Testing
          {
            category: 'Electrical Testing',
            itemNo: 9,
            checkItem: 'Insulation Resistance (Main Busbar to Earth @ 2.5 kV)',
            acceptance: '>= 1000 Mega-Ohms (Phase-to-Earth and Phase-to-Phase)',
            unit: 'MΩ',
            isMandatory: true,
            sortOrder: 9,
          },
          {
            category: 'Electrical Testing',
            itemNo: 10,
            checkItem: 'Insulation Resistance (Low Voltage Control Circuit @ 500V)',
            acceptance: '>= 10 Mega-Ohms',
            unit: 'MΩ',
            isMandatory: true,
            sortOrder: 10,
          },
          {
            category: 'Electrical Testing',
            itemNo: 11,
            checkItem: 'Power-Frequency High Voltage Withstand Test (28 kV for 1 Min)',
            acceptance: 'Withstood 28 kV AC rms for 60 seconds without flashover or puncture',
            unit: 'kV / 1 min',
            isMandatory: true,
            sortOrder: 11,
          },
          {
            category: 'Electrical Testing',
            itemNo: 12,
            checkItem: 'Contact Resistance of Main Circuit (Ductor Test)',
            acceptance: '<= 45 micro-ohms per phase across breaker and isolating cluster contacts',
            unit: 'μΩ',
            isMandatory: true,
            sortOrder: 12,
          },
          {
            category: 'Electrical Testing',
            itemNo: 13,
            checkItem: 'Breaker Close / Trip Coil Electrical Operation @ 85-110% Vdc',
            acceptance: 'Positive close & trip operation at rated 24V DC / 110V DC',
            unit: 'Functional Check',
            isMandatory: true,
            sortOrder: 13,
          },
          {
            category: 'Electrical Testing',
            itemNo: 14,
            checkItem: 'Siemens 7SJ82 Numerical Relay Primary / Secondary Trip Test',
            acceptance: 'Trips within time curve for Overcurrent (51) and Earth Fault (51N)',
            unit: 'ms',
            isMandatory: true,
            sortOrder: 14,
          },
        ],
      },
    },
  });

  // 10. Exemplary NCR: Linked to BEE-12K-2026-001 (The Auxiliary Relay BOM Mismatch)
  const ncrRelay = await prisma.ncr.create({
    data: {
      ncrNumber: 'NCR-2026-001',
      panelId: panel001.id,
      workOrderId: wo1.id,
      department: 'Low Voltage Assembly',
      defectCategory: 'BOM / Component Mismatch',
      defectDescription:
        'Auxiliary Relay Model Mismatch on panel Low Voltage Baseplate: Installed model Schneider CAD33-BD (3NO+3NC) does not match the approved engineering BOM Rev 1.0 specification Schneider CAD32-BD (3NO+2NC). Schematic terminal mapping cannot be completed safely.',
      severity: 'High',
      status: NcrStatus.CLOSED,
      raisedById: inspUser.id,
      assignedToId: prodUser.id,
      immediateCorrection:
        'Quarantined installed CAD33-BD unit. Issued material requisition note MRN-2026-441 to stores for approved CAD32-BD 24V DC units.',
      rootCauseMethod: '5-Whys Analysis',
      rootCauseAnalysis:
        'Why 1: Wrong auxiliary relay mounted on rail.\nWhy 2: Operator picked CAD33 bin item.\nWhy 3: Stores bin label for CAD32 had mixed stock after inward receipt.\nWhy 4: Visual inspection on inward receipt did not verify sub-model contact configuration.\nWhy 5: Lack of barcode verification check at stores issue staging.',
      targetDate: new Date('2026-11-04'),
      closedAt: new Date('2026-11-04T17:00:00Z'),
    },
  });

  // Corrective Actions for NCR-2026-001
  await prisma.correctiveAction.create({
    data: {
      ncrId: ncrRelay.id,
      actionType: 'Immediate Correction',
      description: 'Dismounted incorrect CAD33-BD. Mounted verified Schneider CAD32-BD relay on DIN rail and re-terminated ferrules.',
      assignedToId: prodUser.id,
      status: 'Verified',
      verificationResult: 'Verified CAD32-BD installed. Contact continuity and schematic matching checked.',
      verifiedById: inspUser.id,
      completedAt: new Date('2026-11-03'),
      verifiedAt: new Date('2026-11-04'),
    },
  });

  await prisma.correctiveAction.create({
    data: {
      ncrId: ncrRelay.id,
      actionType: 'Root-Cause Corrective',
      description: 'Physical audit of all auxiliary relay storage bins in Central Stores. Separated CAD32 and CAD33 bins with distinct color-coded barcode tags.',
      assignedToId: storesUser.id,
      status: 'Verified',
      verificationResult: 'Bin segregation and barcode labeling audit completed in Stores.',
      verifiedById: qmUser.id,
      completedAt: new Date('2026-11-04'),
      verifiedAt: new Date('2026-11-04'),
    },
  });

  // NCR Status History
  await prisma.ncrStatusHistory.createMany({
    data: [
      { ncrId: ncrRelay.id, fromStatus: 'NONE', toStatus: 'RAISED', changedBy: 'Ganesh Kulkarni (Quality Inspector)', comment: 'Discrepancy logged during BOM verification check' },
      { ncrId: ncrRelay.id, fromStatus: 'RAISED', toStatus: 'ASSIGNED', changedBy: 'Santosh Bhoyar (Quality Manager)', comment: 'Assigned to Rajesh Patil for immediate shopfloor correction' },
      { ncrId: ncrRelay.id, fromStatus: 'ASSIGNED', toStatus: 'ROOT_CAUSE_IDENTIFIED', changedBy: 'Rajesh Patil (Production Supervisor)', comment: '5-Whys root cause analysis completed' },
      { ncrId: ncrRelay.id, fromStatus: 'ROOT_CAUSE_IDENTIFIED', toStatus: 'ACTION_COMPLETED', changedBy: 'Rajesh Patil (Production Supervisor)', comment: 'Corrective replacement done, tested by wiring technician' },
      { ncrId: ncrRelay.id, fromStatus: 'ACTION_COMPLETED', toStatus: 'VERIFICATION_PENDING', changedBy: 'Ganesh Kulkarni (Quality Inspector)', comment: 'Submitted for physical QA verification' },
      { ncrId: ncrRelay.id, fromStatus: 'VERIFICATION_PENDING', toStatus: 'CLOSED', changedBy: 'Santosh Bhoyar (Quality Manager)', comment: 'Closure approved following satisfactory verification' },
    ],
  });

  // 11. PDI Inspection Run for Panel 001
  const pdiRun001 = await prisma.inspectionRun.create({
    data: {
      templateId: pdiTemplate.id,
      panelId: panel001.id,
      runNumber: 1,
      status: 'Completed',
      inspectorId: inspUser.id,
      remarks: 'All high-voltage dielectric and mechanical interlock tests passed. Auxiliary relay NCR-2026-001 resolved and verified prior to PDI sign-off.',
    },
  });

  // PDI checklist measured results for Run 001
  const runResults = [
    { cat: 'Document & Marking', item: 'Nameplate & Rating Verification', res: 'Pass', measured: '12kV / 1250A / 31.5kA', cmt: 'All laser-etched data matched' },
    { cat: 'Document & Marking', item: 'Single Line Diagram (SLD) & Schematic Alignment', res: 'Pass', measured: 'Schematic Rev 1.0', cmt: 'Cross-ferrules matched' },
    { cat: 'Visual & Finish', item: 'Powder Coating Thickness & Paint Shade', res: 'Pass', measured: '72', unit: 'μm', cmt: 'RAL 7032 Siemens Grey ok' },
    { cat: 'Visual & Finish', item: 'Degree of Protection & Gasketing (IP4X)', res: 'Pass', measured: 'IP4X Verified', cmt: 'Neoprene seals tight' },
    { cat: 'Visual & Finish', item: 'Cable Box Clearance & Earthing Busbar Connection', res: 'Pass', measured: '620', unit: 'mm', cmt: 'Meets >= 600mm spec' },
    { cat: 'Mechanical & Interlocks', item: 'VCB Draw-out Carriage Racking Effort', res: 'Pass', measured: '18', unit: 'N-m', cmt: 'Smooth travel' },
    { cat: 'Mechanical & Interlocks', item: 'Safety Shutter Automatic Operation', res: 'Pass', measured: 'Positive Lock', cmt: 'Shutter falls on rack-out' },
    { cat: 'Mechanical & Interlocks', item: 'Breaker Closed Racking Prevention Interlock', res: 'Pass', measured: 'Interlock Engaged', cmt: 'Tested under simulated trip' },
    { cat: 'Electrical Testing', item: 'Insulation Resistance (Main Busbar to Earth @ 2.5 kV)', res: 'Pass', measured: '2800', unit: 'MΩ', cmt: 'High insulation integrity' },
    { cat: 'Electrical Testing', item: 'Insulation Resistance (Low Voltage Control Circuit @ 500V)', res: 'Pass', measured: '48', unit: 'MΩ', cmt: 'Control bus clear' },
    { cat: 'Electrical Testing', item: 'Power-Frequency High Voltage Withstand Test (28 kV for 1 Min)', res: 'Pass', measured: '28.0', unit: 'kV / 1 min', cmt: 'Withstood 60s without discharge' },
    { cat: 'Electrical Testing', item: 'Contact Resistance of Main Circuit (Ductor Test)', res: 'Pass', measured: '32.4', unit: 'μΩ', cmt: 'R: 32.4, Y: 31.8, B: 33.1 μΩ' },
    { cat: 'Electrical Testing', item: 'Breaker Close / Trip Coil Electrical Operation @ 85-110% Vdc', res: 'Pass', measured: '20.4 to 26.4', unit: 'V DC', cmt: 'Operates smoothly across range' },
    { cat: 'Electrical Testing', item: 'Siemens 7SJ82 Numerical Relay Primary / Secondary Trip Test', res: 'Pass', measured: '42', unit: 'ms', cmt: 'Trip curve calibrated' },
  ];

  for (const r of runResults) {
    await prisma.inspectionResult.create({
      data: {
        inspectionRunId: pdiRun001.id,
        checkItem: r.item,
        category: r.cat,
        result: r.res,
        measuredValue: r.measured,
        unit: r.unit || '',
        comment: r.cmt,
      },
    });
  }
  console.log(`✓ Seeded PDI Run for ${serial001} with 14 comprehensive test items`);

  // 12. Seed 11 More Synthetic Panels across different lifecycle stages for realistic KPI metrics
  const syntheticPanels = [
    { serial: 'BEE-12K-2026-002', status: PanelStatus.DISPATCHED, notes: 'Substation Incomer Panel #1, delivered to Wockhardt MIDC site' },
    { serial: 'BEE-12K-2026-003', status: PanelStatus.DISPATCH_READY, notes: 'Substation Incomer Panel #2, PDI approved awaiting transport vehicle' },
    { serial: 'BEE-12K-2026-004', status: PanelStatus.FINAL_TESTING, notes: 'Feeder Panel 1, undergoing high voltage dielectric tests' },
    { serial: 'BEE-12K-2026-005', status: PanelStatus.MANUFACTURING, notes: 'Feeder Panel 2, copper busbar assembly stage' },
    { serial: 'BEE-12K-2026-006', status: PanelStatus.IN_PROCESS_QC, notes: 'Coupler Panel, wiring harness routing inspection' },
    { serial: 'BEE-12K-2026-007', status: PanelStatus.REWORK_REQUIRED, notes: 'Door interlock alignment adjustment required' },
    { serial: 'BEE-12K-2026-008', status: PanelStatus.ON_HOLD, notes: 'Awaiting customer drawing approval for custom metering layout' },
    { serial: 'BEE-12K-2026-009', status: PanelStatus.MATERIAL_READY, notes: 'Sheet metal fabricated and powder coated, staged for busbar' },
    { serial: 'BEE-12K-2026-010', status: PanelStatus.BOM_APPROVED, notes: 'BOM frozen, inward goods receipt underway' },
    { serial: 'BEE-12K-2026-011', status: PanelStatus.ENGINEERING, notes: 'Schematic wiring drawings under engineering review' },
    { serial: 'BEE-12K-2026-012', status: PanelStatus.DRAFT, notes: 'New panel batch registration' },
  ];

  for (const sp of syntheticPanels) {
    const qrData = await QRCode.toDataURL(
      JSON.stringify({ app: 'BE-QTrack', serial: sp.serial }),
      { margin: 2, color: { dark: '#181b20', light: '#ffffff' } }
    );

    const createdP = await prisma.panel.create({
      data: {
        serialNumber: sp.serial,
        workOrderId: wo1.id,
        status: sp.status,
        qrCodeData: qrData,
        notes: sp.notes,
      },
    });

    if (sp.status === PanelStatus.DISPATCHED) {
      await prisma.dispatchRecord.create({
        data: {
          panelId: createdP.id,
          dispatchNumber: 'DISP-2026-001',
          dispatchDate: new Date('2026-11-06'),
          transportMode: 'Dedicated Air-Suspension Truck',
          vehicleNo: 'MH-20-DE-4412',
          deliveryAddress: 'Wockhardt Pharma, Substation 2, Waluj MIDC, Chhatrapati Sambhajinagar',
          approvedBy: qmUser.name,
          approvedAt: new Date('2026-11-06'),
          remarks: 'Released with calibration certificates and PDI report',
        },
      });
    }
  }

  // 13. Additional NCRs (Open, Overdue, Closed) across categories for Pareto Dashboard charts
  await prisma.ncr.create({
    data: {
      ncrNumber: 'NCR-2026-002',
      panelId: panel001.id,
      department: 'Fabrication',
      defectCategory: 'Surface & Paint Finish',
      defectDescription: 'Minor paint scratch observed on rear access cover during transport to assembly bay.',
      severity: 'Low',
      status: NcrStatus.CLOSED,
      raisedById: inspUser.id,
      assignedToId: prodUser.id,
      immediateCorrection: 'Touched up using original RAL 7032 polyurethane paint touch-up kit.',
      targetDate: new Date('2026-11-01'),
      closedAt: new Date('2026-11-01'),
    },
  });

  await prisma.ncr.create({
    data: {
      ncrNumber: 'NCR-2026-003',
      department: 'Electrical Wiring',
      defectCategory: 'Loose Termination',
      defectDescription: 'Loose terminal screw found on CT secondary terminal block TB-2 during torque wrench audit.',
      severity: 'Medium',
      status: NcrStatus.UNDER_INVESTIGATION,
      raisedById: inspUser.id,
      assignedToId: prodUser.id,
      immediateCorrection: 'Torqued terminal screw to specified 1.2 N-m.',
      targetDate: new Date('2026-11-10'),
    },
  });

  await prisma.ncr.create({
    data: {
      ncrNumber: 'NCR-2026-004',
      department: 'Mechanical Assembly',
      defectCategory: 'Shutter Mechanism Operating-Force Variation',
      defectDescription: 'Shutter mechanism requires excess force (>35 N-m) due to carriage roller friction.',
      severity: 'High',
      status: NcrStatus.ASSIGNED,
      raisedById: inspUser.id,
      assignedToId: prodUser.id,
      targetDate: new Date('2026-11-05'), // Overdue!
    },
  });

  await prisma.ncr.create({
    data: {
      ncrNumber: 'NCR-2026-005',
      department: 'Incoming Material',
      defectCategory: 'Incoming Component Defect',
      defectDescription: 'Incoming batch of 12kV post insulators had chip marks on resin shedding skirts.',
      severity: 'Medium',
      status: NcrStatus.CORRECTIVE_ACTION_ASSIGNED,
      raisedById: storesUser.id,
      assignedToId: storesUser.id,
      targetDate: new Date('2026-11-12'),
    },
  });

  // 14. Suppliers & Incoming Inspections
  const supplierAbb = await prisma.supplier.create({
    data: {
      code: 'SUP-ABB',
      name: 'ABB India Limited',
      category: 'Medium Voltage Circuit Breakers',
      contact: 'Regional Sales Manager',
      email: 'orders.mv@in.abb.com',
      rating: 'A+ (Approved Strategic Partner)',
    },
  });

  const supplierSiemens = await prisma.supplier.create({
    data: {
      code: 'SUP-SIEMENS',
      name: 'Siemens India Ltd',
      category: 'Numerical Relays & Protection',
      contact: 'Smart Infrastructure Division',
      email: 'si.support@siemens.com',
      rating: 'A (Approved)',
    },
  });

  await prisma.incomingInspection.create({
    data: {
      grNumber: 'GRN-2026-0101',
      supplierId: supplierAbb.id,
      materialName: 'ABB VD4 12kV 1250A Vacuum Circuit Breaker',
      quantity: 5,
      unit: 'Nos',
      batchNumber: 'ABB-VD4-LOT-441',
      result: 'Accepted',
      remarks: 'Routine factory test certificates verified. Breaker contact travel and timing verified OK.',
      inspectedBy: inspUser.name,
    },
  });

  // 15. Engineering Change Request (ECR / ECN)
  await prisma.engineeringChange.create({
    data: {
      ecrNumber: 'ECR-2026-01',
      type: 'ECN',
      title: 'Auxiliary Relay Model Specification Standardization',
      description: 'Standardize Schneider CAD32-BD as reference model across all 12kV VCB indoor panels to eliminate bin mix-ups.',
      reason: 'Prevent model mismatch recurrence on shopfloor as flagged in NCR-2026-001.',
      impactAssessment: 'BOM update for WO-2026-081 and future work orders. No cost impact.',
      status: 'Approved',
      requestedBy: engUser.name,
      approvedBy: qmUser.name,
      approvedAt: new Date('2026-11-05'),
      effectiveDate: new Date('2026-11-05'),
      newBomRevision: 'Rev 1.1',
    },
  });

  console.log('✓ Seeded suppliers, incoming goods, and ECR/ECN records');
  console.log('=== BE-QTrack Seed Data Completed Successfully ===');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
