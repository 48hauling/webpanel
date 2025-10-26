// API Response Types for 48 Hauling Web Panel

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User & Authentication Types
export interface User {
  id: string
  userId: string
  email: string
  username: string
  role: 'ADMIN' | 'DRIVER' | 'USER'
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt?: string
  theme?: string
  language?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// Driver Types
export interface HaulingProfile {
  userId: string
  pushToken?: string
  pushPlatform?: string
  notificationsEnabled: boolean
  driverLicenseNumber?: string
  vehicleAssigned?: string
  createdAt: string
  updatedAt: string
}

export interface DeviceStatus {
  userId: string
  appType: string
  lastSeen: Date | string
  appVersion?: string
  deviceInfo?: Record<string, any>
  isOnline?: boolean
}

export interface DriverStats {
  totalJobs: number
  completedJobs: number
  activeJobs: number
}

export interface Driver extends User {
  profile?: HaulingProfile
  deviceStatus?: DeviceStatus
  stats?: DriverStats
}

export interface CreateDriverData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  driverLicenseNumber?: string
  vehicleAssigned?: string
}

export interface UpdateDriverData {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  driverLicenseNumber?: string
  vehicleAssigned?: string
}

// Job Types
export interface Job {
  id: number | string
  reference?: string
  pickupAddress: string
  pickupLat?: number
  pickupLng?: number
  deliveryAddress: string
  deliveryLat?: number
  deliveryLng?: number
  status: string
  driverId?: string
  assignedTo?: string
  assignedDriverId?: string
  assignedAt?: Date | string
  startedAt?: Date | string
  completedAt?: Date | string
  notes?: string
  customerName?: string
  customerPhone?: string
  priority: number
  estimatedDurationMinutes?: number
  price?: string
  createdAt: string | Date
  updatedAt: string | Date
}

// Location Types
export interface LocationHistory {
  id: number
  driverId: string
  jobId?: number
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  recordedAt: string | Date
  createdAt: string | Date
}

export interface LocationParams {
  jobId?: number | string
  startTime?: string
  endTime?: string
  limit?: number
}

// Document Types
export interface JobAttachment {
  id: number
  jobId: number
  uploadedBy: string
  fileName: string
  fileUrl: string
  fileType?: string
  attachmentType?: string
  createdAt: string
}

// Error Log Types
export interface ErrorLog {
  id: number
  userId?: string
  errorMessage: string
  stackTrace?: string
  appVersion?: string
  deviceInfo?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  createdAt: string
}

export interface ErrorLogParams {
  limit?: number
  severity?: string
  resolved?: boolean
}

// Issue Types
export interface ReportedIssue {
  id: number
  reporterId?: string
  description: string
  status: string
  category: string
  priority: string
  adminNotes?: string
  assignedTo?: string
  resolvedAt?: Date | string
  reportedAt: string | Date
}

export interface IssueParams {
  status?: string
  category?: string
  priority?: string
}

export interface UpdateIssueData {
  status?: string
  adminNotes?: string
  assignedTo?: string
}

// Analytics Types
export interface DashboardStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalDrivers: number
  onlineDrivers: number
  totalRevenue: number
  avgJobDuration: number
  completionRate: number
}

export interface RevenueAnalytics {
  period: string
  totalRevenue: number
  jobCount: number
  avgRevenuePerJob: number
  timeSeriesData: Array<{
    date: string
    revenue: number
    jobs: number
  }>
}

export interface DriverAnalytics {
  driverId: string
  driverName: string
  totalJobs: number
  completedJobs: number
  totalRevenue: number
  avgJobDuration: number
  completionRate: number
}

export interface JobsTimeline {
  date: string
  pending: number
  assigned: number
  in_progress: number
  completed: number
  cancelled: number
}

export interface AnalyticsEvent {
  id: number
  userId?: string
  eventName: string
  eventData?: Record<string, any>
  appVersion?: string
  platform?: string
  createdAt: string
}

// Database Management Types
export interface DatabaseTable {
  tableName: string
  rowCount: number
}

export interface TableSchema {
  columnName: string
  dataType: string
  isNullable: boolean
  columnDefault?: string
}

export interface TableStats {
  rowCount: number
  tableSize: string
  indexSize: string
}

export interface QueryResult {
  rows?: any[]
  rowCount?: number
  error?: string
}

export interface TableRowsResponse {
  rows: any[]
  total: number
}

export interface TableRowsParams {
  limit?: number
  offset?: number
}

// Settings Types
export interface AppSettings {
  [key: string]: any
}

export interface UserPreferences {
  theme?: string
  language?: string
  notificationsEnabled?: boolean
  emailNotifications?: boolean
  [key: string]: any
}

// Audit Log Types
export interface AuditLog {
  id: number
  userId?: string
  action: string
  entityType: string
  entityId?: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditLogParams {
  limit?: number
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export interface AuditStats {
  totalLogs: number
  actionBreakdown: Record<string, number>
  entityBreakdown: Record<string, number>
  recentActions: AuditLog[]
}

// Messaging Types
export interface Message {
  id: number
  senderId: string
  recipientId: string
  content: string
  messageType: string
  isRead: boolean
  readAt?: Date | string
  createdAt: string
  sender?: User
  recipient?: User
}

export interface Conversation {
  userId: string
  username: string
  email: string
  role: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface Announcement {
  id: number
  title: string
  content: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isActive: boolean
  expiresAt?: string | Date
  createdAt: string
}

export interface CreateAnnouncementData {
  title: string
  content: string
  priority?: string
  expiresAt?: string
}

export interface UpdateAnnouncementData {
  title?: string
  content?: string
  priority?: string
  isActive?: boolean
  expiresAt?: string
}

// DVIR Types
export interface Dvir {
  id: number
  driverId: string
  vehicleId?: string
  inspectionType: 'PRE_TRIP' | 'POST_TRIP'
  odometer?: number
  checklistItems: Record<string, boolean>
  defectsFound: boolean
  defectDescription?: string
  safeToOperate: boolean
  driverSignature?: string
  mechanicNotes?: string
  status: 'pending' | 'COMPLETED'
  photos?: string[]
  createdAt: string
}

export interface CreateDvirData {
  vehicleId?: string
  inspectionType: string
  odometer?: number
  checklistItems: Record<string, boolean>
  defectsFound: boolean
  defectDescription?: string
  safeToOperate: boolean
  driverSignature?: string
}

export interface UpdateDvirData {
  mechanicNotes?: string
  status?: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  data?: Record<string, any>
  readAt?: Date | string
  createdAt: string
}

// App Version Types
export interface AppVersion {
  id: number
  versionNumber: string
  platform: string
  forceUpdate: boolean
  isActive: boolean
  releasedAt: string
}
