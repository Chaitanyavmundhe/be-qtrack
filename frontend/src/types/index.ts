export type Role =
  | 'ADMIN'
  | 'ENGINEERING'
  | 'PROCUREMENT'
  | 'PRODUCTION'
  | 'QUALITY_INSPECTOR'
  | 'QUALITY_MANAGER'
  | 'MANAGEMENT';

export type PanelStatus =
  | 'DRAFT'
  | 'ENGINEERING'
  | 'BOM_APPROVED'
  | 'MATERIAL_READY'
  | 'MANUFACTURING'
  | 'IN_PROCESS_QC'
  | 'FINAL_TESTING'
  | 'PDI'
  | 'DISPATCH_READY'
  | 'DISPATCHED'
  | 'ON_HOLD'
  | 'REWORK_REQUIRED'
  | 'REJECTED'
  | 'CANCELLED';

export type NcrStatus =
  | 'IDENTIFIED'
  | 'RAISED'
  | 'ASSIGNED'
  | 'UNDER_INVESTIGATION'
  | 'ROOT_CAUSE_IDENTIFIED'
  | 'CORRECTIVE_ACTION_ASSIGNED'
  | 'ACTION_COMPLETED'
  | 'VERIFICATION_PENDING'
  | 'CLOSED'
  | 'REOPENED'
  | 'REJECTED'
  | 'ON_HOLD';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  badgeNumber?: string;
}

export interface Panel {
  id: string;
  serialNumber: string;
  workOrderId: string;
  status: PanelStatus;
  specifications?: any;
  qrCodeData?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  workOrder?: WorkOrder;
  ncrs?: Ncr[];
  inspectionRuns?: InspectionRun[];
  operationLogs?: OperationLog[];
  bomVerifications?: BomItemVerification[];
  statusHistory?: any[];
  dispatchRecord?: any;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  projectId: string;
  productTemplateId: string;
  quantity: number;
  status: string;
  priority: string;
  description?: string;
  specifications?: any;
  targetDate?: string;
  project?: Project;
  productTemplate?: ProductTemplate;
  panels?: Panel[];
  bomRevisions?: BomRevision[];
}

export interface Project {
  id: string;
  projectNo: string;
  name: string;
  customerId: string;
  description?: string;
  customer?: Customer;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  address?: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface ProductTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  ratedVoltage?: string;
  ratedCurrent?: string;
  ratedFrequency?: string;
  imageUrl?: string;
  specifications?: any;
}

export interface BomRevision {
  id: string;
  bomNumber: string;
  workOrderId: string;
  revision: number;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  items?: BomItem[];
}

export interface BomItem {
  id: string;
  bomRevisionId: string;
  itemNo: number;
  componentCode: string;
  componentName: string;
  manufacturer?: string;
  modelNumber?: string;
  requiredQty: number;
  unit: string;
  technicalSpec?: string;
  category?: string;
  installLocation?: string;
}

export interface BomItemVerification {
  id: string;
  bomItemId: string;
  panelId: string;
  actualModel?: string;
  actualManufacturer?: string;
  actualQty?: number;
  actualSpec?: string;
  actualBatch?: string;
  actualSerial?: string;
  status: string;
  remarks?: string;
  verifiedBy?: User;
  verifiedAt?: string;
}

export interface Ncr {
  id: string;
  ncrNumber: string;
  panelId?: string;
  workOrderId?: string;
  department?: string;
  defectCategory: string;
  defectDescription: string;
  severity: string;
  status: NcrStatus;
  raisedById: string;
  raisedBy?: User;
  assignedToId?: string;
  assignedTo?: User;
  immediateCorrection?: string;
  rootCauseMethod?: string;
  rootCauseAnalysis?: string;
  targetDate?: string;
  closedAt?: string;
  createdAt: string;
  panel?: Panel;
  correctiveActions?: CorrectiveAction[];
  statusHistory?: any[];
}

export interface CorrectiveAction {
  id: string;
  ncrId: string;
  actionType: string;
  description: string;
  assignedTo?: User;
  targetDate?: string;
  completedAt?: string;
  status: string;
  verificationResult?: string;
  verifiedBy?: User;
  verifiedAt?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  type: string;
  productCode?: string;
  items: InspectionTemplateItem[];
}

export interface InspectionTemplateItem {
  id: string;
  templateId: string;
  category: string;
  itemNo: number;
  checkItem: string;
  acceptance?: string;
  unit?: string;
  isMandatory: boolean;
  sortOrder: number;
}

export interface InspectionRun {
  id: string;
  templateId: string;
  panelId: string;
  runNumber: number;
  status: string;
  inspectorId: string;
  inspector: User;
  approvedById?: string;
  approvedAt?: string;
  remarks?: string;
  createdAt: string;
  template: InspectionTemplate;
  panel: Panel;
  results: InspectionResult[];
}

export interface InspectionResult {
  id: string;
  inspectionRunId: string;
  templateItemId?: string;
  checkItem: string;
  category: string;
  result?: string;
  measuredValue?: string;
  unit?: string;
  acceptance?: string;
  comment?: string;
  evidenceUrl?: string;
  ncrId?: string;
}

export interface OperationLog {
  id: string;
  panelId: string;
  operation: string;
  stage: string;
  description?: string;
  operatorId: string;
  operator?: User;
  startTime: string;
  endTime?: string;
  status: string;
  remarks?: string;
}
