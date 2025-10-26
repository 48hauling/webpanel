// Audit logging - TODO: Implement with DevApi
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'download'
  | 'login'
  | 'logout'
  | 'assign'
  | 'unassign'
  | 'approve'
  | 'reject'
  | 'send'
  | 'filter'
  | 'search'
  | 'export'

export type AuditResourceType =
  | 'load'
  | 'driver'
  | 'dvir'
  | 'message'
  | 'document'
  | 'user'
  | 'bol'
  | 'attachment'
  | 'system'

export interface AuditLogParams {
  action: AuditAction
  resourceType: AuditResourceType
  resourceId?: string | number
  description?: string
  metadata?: Record<string, any>
  status?: 'success' | 'failure' | 'error'
  errorMessage?: string
}

export async function logAudit(params: AuditLogParams): Promise<string | null> {
  // TODO: Implement audit logging with DevApi
  console.log('[Audit]', params)
  return null
}

export const audit = {
  createLoad: (loadId: string | number, loadNumber: string) => logAudit({ action: 'create', resourceType: 'load', resourceId: loadId }),
  updateLoad: (loadId: string | number, loadNumber: string, changes: Record<string, any>) => logAudit({ action: 'update', resourceType: 'load', resourceId: loadId }),
  deleteLoad: (loadId: string | number, loadNumber: string) => logAudit({ action: 'delete', resourceType: 'load', resourceId: loadId }),
  assignDriver: (loadId: string | number, loadNumber: string, driverId: string, driverName: string) => logAudit({ action: 'assign', resourceType: 'load', resourceId: loadId }),
  createDriver: (driverId: string, driverName: string, email: string) => logAudit({ action: 'create', resourceType: 'driver', resourceId: driverId }),
  updateDriver: (driverId: string, driverName: string, changes: Record<string, any>) => logAudit({ action: 'update', resourceType: 'driver', resourceId: driverId }),
  deleteDriver: (driverId: string, driverName: string) => logAudit({ action: 'delete', resourceType: 'driver', resourceId: driverId }),
  viewDvir: (dvirId: string, dvirNumber: string) => logAudit({ action: 'view', resourceType: 'dvir', resourceId: dvirId }),
  approveDvir: (dvirId: string, dvirNumber: string, safeToOperate: boolean) => logAudit({ action: 'approve', resourceType: 'dvir', resourceId: dvirId }),
  sendMessage: (messageId: string, recipientId: string, recipientName: string) => logAudit({ action: 'send', resourceType: 'message', resourceId: messageId }),
  viewConversation: (userId: string, userName: string) => logAudit({ action: 'view', resourceType: 'message', resourceId: userId }),
  viewDocument: (docId: string, fileName: string, loadNumber?: string) => logAudit({ action: 'view', resourceType: 'document', resourceId: docId }),
  downloadDocument: (docId: string, fileName: string, loadNumber?: string) => logAudit({ action: 'download', resourceType: 'document', resourceId: docId }),
  deleteDocument: (docId: string, fileName: string) => logAudit({ action: 'delete', resourceType: 'document', resourceId: docId }),
  searchDocuments: (filters: Record<string, any>, resultCount: number) => logAudit({ action: 'search', resourceType: 'document' }),
  filterLoads: (filters: Record<string, any>, resultCount: number) => logAudit({ action: 'filter', resourceType: 'load' }),
  login: () => logAudit({ action: 'login', resourceType: 'system' }),
  logout: () => logAudit({ action: 'logout', resourceType: 'system' }),
  error: (action: AuditAction, resourceType: AuditResourceType, errorMessage: string, metadata?: Record<string, any>) => logAudit({ action, resourceType, status: 'error', errorMessage }),
}

export default audit
