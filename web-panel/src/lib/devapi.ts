/**
 * DevCollective API Client for 48 Hauling
 * Professional REST API integration
 */

import type {
  ApiResponse, User, LoginResponse, Driver, CreateDriverData, UpdateDriverData,
  Job, LocationHistory, LocationParams, JobAttachment, ErrorLog, ErrorLogParams,
  ReportedIssue, IssueParams, UpdateIssueData, DashboardStats, RevenueAnalytics,
  DriverAnalytics, JobsTimeline, AnalyticsEvent, DatabaseTable, TableSchema,
  TableStats, QueryResult, TableRowsResponse, TableRowsParams, AppSettings,
  UserPreferences, AuditLog, AuditLogParams, AuditStats, Message, Conversation,
  Announcement, CreateAnnouncementData, UpdateAnnouncementData, Dvir,
  CreateDvirData, UpdateDvirData
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.azdevops.io/api';

class DevApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('devapi_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('devapi_token', token);
      // Also set in cookie for middleware access
      document.cookie = `devapi_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax; Secure`;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devapi_token');
      localStorage.removeItem('devapi_user');
      // Clear cookie
      document.cookie = 'devapi_token=; path=/; max-age=0; Secure';
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('DevApi request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('devapi_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async logout() {
    this.clearToken();
    return { success: true };
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('devapi_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // 48 Hauling API Methods

  // Jobs
  async getJobs() {
    return this.request<Job[]>('/hauling/jobs', { method: 'GET' });
  }

  async createJob(jobData: Partial<Job>) {
    return this.request<Job>('/hauling/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJobStatus(jobId: string, status: string) {
    return this.request<Job>(`/hauling/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Heartbeat / Device Status
  async getOnlineDevices() {
    return this.request<DeviceStatus[]>('/hauling/heartbeat/status', { method: 'GET' });
  }

  async sendHeartbeat(data: { appType?: string; appVersion?: string; deviceInfo?: Record<string, unknown> }) {
    return this.request<{ success: boolean }>('/hauling/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Location Tracking
  async getDriverLocation(driverId: string) {
    return this.request<LocationHistory>(`/hauling/location/${driverId}`, { method: 'GET' });
  }

  async getLocationHistory(driverId: string, params?: LocationParams) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<LocationHistory[]>(`/hauling/location/${driverId}/history${queryString}`, {
      method: 'GET',
    });
  }

  async updateLocation(data: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    jobId?: string;
  }) {
    return this.request<LocationHistory>('/hauling/location', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActiveLocations() {
    return this.request<LocationHistory[]>('/hauling/location', { method: 'GET' });
  }

  // Notifications
  async getNotifications(unreadOnly: boolean = false) {
    const queryString = unreadOnly ? '?unreadOnly=true' : '';
    return this.request<Notification[]>(`/hauling/notifications${queryString}`, { method: 'GET' });
  }

  async markNotificationRead(notificationId: string) {
    return this.request<{ success: boolean }>(`/hauling/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/hauling/notifications/mark-all-read', { method: 'PUT' });
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    return this.request<{ success: boolean }>('/hauling/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async trackAnalyticsEvent(data: {
    eventName: string;
    eventData?: Record<string, unknown>;
    appVersion?: string;
    platform?: string;
  }) {
    return this.request<AnalyticsEvent>('/hauling/analytics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDashboardStats() {
    return this.request<DashboardStats>('/hauling/analytics/dashboard', { method: 'GET' });
  }

  async getRevenueAnalytics(period: number = 30) {
    return this.request<RevenueAnalytics>(`/hauling/analytics/revenue?period=${period}`, { method: 'GET' });
  }

  async getDriverAnalytics(period: number = 30) {
    return this.request<DriverAnalytics[]>(`/hauling/analytics/drivers?period=${period}`, { method: 'GET' });
  }

  async getJobsTimeline(period: number = 30) {
    return this.request<JobsTimeline[]>(`/hauling/analytics/jobs-timeline?period=${period}`, { method: 'GET' });
  }

  async getAnalyticsEvents(params?: { eventName?: string; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<AnalyticsEvent[]>(`/hauling/analytics/events${queryString}`, { method: 'GET' });
  }

  // Error Logging
  async logError(data: {
    errorMessage: string;
    stackTrace?: string;
    appVersion?: string;
    deviceInfo?: Record<string, unknown>;
    severity?: string;
  }) {
    return this.request<ErrorLog>('/hauling/errors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getErrorLogs(params?: ErrorLogParams) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<ErrorLog[]>(`/hauling/errors${queryString}`, { method: 'GET' });
  }

  async resolveError(errorId: string) {
    return this.request<ErrorLog>(`/hauling/errors/${errorId}/resolve`, { method: 'PUT' });
  }

  // Issue Reporting
  async reportIssue(data: {
    description: string;
    category?: string;
    priority?: string;
  }) {
    return this.request<ReportedIssue>('/hauling/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIssues(params?: IssueParams) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<ReportedIssue[]>(`/hauling/issues${queryString}`, { method: 'GET' });
  }

  async getIssue(issueId: string) {
    return this.request<ReportedIssue>(`/hauling/issues/${issueId}`, { method: 'GET' });
  }

  async updateIssue(issueId: string, data: UpdateIssueData) {
    return this.request<ReportedIssue>(`/hauling/issues/${issueId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Driver Management
  async getDrivers() {
    return this.request<Driver[]>('/hauling/drivers', { method: 'GET' });
  }

  async getDriver(driverId: string) {
    return this.request<Driver>(`/hauling/drivers/${driverId}`, { method: 'GET' });
  }

  async createDriver(driverData: CreateDriverData) {
    return this.request<Driver>('/hauling/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriver(driverId: string, driverData: UpdateDriverData) {
    return this.request<Driver>(`/hauling/drivers/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  }

  async deleteDriver(driverId: string) {
    return this.request<{ success: boolean }>(`/hauling/drivers/${driverId}`, { method: 'DELETE' });
  }

  async getOnlineDrivers() {
    return this.request<Driver[]>('/hauling/drivers/stats/online', { method: 'GET' });
  }

  // Document Management
  async uploadDocument(file: File, jobId?: string, attachmentType?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (jobId) formData.append('jobId', jobId);
    if (attachmentType) formData.append('attachmentType', attachmentType);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/hauling/documents/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    return await response.json();
  }

  async getJobDocuments(jobId: string) {
    return this.request<JobAttachment[]>(`/hauling/documents/job/${jobId}`, { method: 'GET' });
  }

  async deleteDocument(documentId: string) {
    return this.request<{ success: boolean }>(`/hauling/documents/${documentId}`, { method: 'DELETE' });
  }

  getDocumentUrl(documentId: string) {
    return `${this.baseUrl}/hauling/documents/${documentId}`;
  }

  // DVIR (Driver Vehicle Inspection Report)
  async submitDvir(data: CreateDvirData) {
    return this.request<Dvir>('/hauling/dvir', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDriverDvirs(driverId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<Dvir[]>(`/hauling/dvir/${driverId}${queryString}`, { method: 'GET' });
  }

  async getDvir(dvirId: string) {
    return this.request<Dvir>(`/hauling/dvir/report/${dvirId}`, { method: 'GET' });
  }

  async updateDvir(dvirId: string, data: UpdateDvirData) {
    return this.request<Dvir>(`/hauling/dvir/${dvirId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPendingDvirs() {
    return this.request<Dvir[]>('/hauling/dvir/pending/all', { method: 'GET' });
  }

  // Database Management
  async getDatabaseTables() {
    return this.request<DatabaseTable[]>('/hauling/database/tables', { method: 'GET' });
  }

  async getTableSchema(tableName: string) {
    return this.request<TableSchema[]>(`/hauling/database/tables/${tableName}/schema`, { method: 'GET' });
  }

  async getTableRows(tableName: string, params?: TableRowsParams) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<TableRowsResponse>(`/hauling/database/tables/${tableName}/rows${queryString}`, { method: 'GET' });
  }

  async getTableStats(tableName: string) {
    return this.request<TableStats>(`/hauling/database/tables/${tableName}/stats`, { method: 'GET' });
  }

  async executeQuery(query: string) {
    return this.request<QueryResult>('/hauling/database/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Settings Management
  async getSettings() {
    return this.request<AppSettings>('/hauling/settings', { method: 'GET' });
  }

  async getSetting(key: string) {
    return this.request<unknown>(`/hauling/settings/${key}`, { method: 'GET' });
  }

  async updateSetting(key: string, value: unknown) {
    return this.request<{ success: boolean }>(`/hauling/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async bulkUpdateSettings(settings: AppSettings) {
    return this.request<{ success: boolean }>('/hauling/settings/bulk', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  }

  async deleteSetting(key: string) {
    return this.request<{ success: boolean }>(`/hauling/settings/${key}`, { method: 'DELETE' });
  }

  async getUserPreferences(userId: string) {
    return this.request<UserPreferences>(`/hauling/settings/users/${userId}/preferences`, { method: 'GET' });
  }

  async updateUserPreferences(userId: string, preferences: UserPreferences) {
    return this.request<UserPreferences>(`/hauling/settings/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Audit Logs
  async createAuditLog(data: {
    action: string;
    entityType: string;
    entityId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.request<AuditLog>('/hauling/audit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAuditLogs(params?: AuditLogParams) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<{ logs: AuditLog[] }>(`/hauling/audit${queryString}`, { method: 'GET' });
  }

  async getEntityAuditLogs(entityType: string, entityId: string, limit: number = 50) {
    return this.request<AuditLog[]>(`/hauling/audit/entity/${entityType}/${entityId}?limit=${limit}`, { method: 'GET' });
  }

  async getUserAuditLogs(userId: string, limit: number = 50) {
    return this.request<AuditLog[]>(`/hauling/audit/user/${userId}?limit=${limit}`, { method: 'GET' });
  }

  async getAuditStats(period: number = 30) {
    return this.request<AuditStats>(`/hauling/audit/stats?period=${period}`, { method: 'GET' });
  }

  async cleanupAuditLogs(daysToKeep: number = 90) {
    return this.request<{ success: boolean; message: string }>(`/hauling/audit/cleanup?daysToKeep=${daysToKeep}`, { method: 'DELETE' });
  }

  // Messaging
  async sendMessage(recipientId: string, content: string, messageType?: string) {
    return this.request<Message>('/hauling/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, messageType }),
    });
  }

  async getConversation(userId: string, limit: number = 50) {
    return this.request<Message[]>(`/hauling/messages/conversation/${userId}?limit=${limit}`, { method: 'GET' });
  }

  async getConversations() {
    return this.request<Conversation[]>('/hauling/messages/conversations', { method: 'GET' });
  }

  async markMessageRead(messageId: string) {
    return this.request<{ success: boolean }>(`/hauling/messages/${messageId}/read`, { method: 'PUT' });
  }

  async markConversationRead(userId: string) {
    return this.request<{ success: boolean }>(`/hauling/messages/conversation/${userId}/read`, { method: 'PUT' });
  }

  async getUnreadMessageCount() {
    return this.request<{ count: number }>('/hauling/messages/unread', { method: 'GET' });
  }

  async deleteMessage(messageId: string) {
    return this.request<{ success: boolean }>(`/hauling/messages/${messageId}`, { method: 'DELETE' });
  }

  // Announcements
  async createAnnouncement(data: CreateAnnouncementData) {
    return this.request<Announcement>('/hauling/messages/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnnouncements(includeExpired: boolean = false) {
    return this.request<Announcement[]>(`/hauling/messages/announcements?includeExpired=${includeExpired}`, { method: 'GET' });
  }

  async updateAnnouncement(id: string, data: UpdateAnnouncementData) {
    return this.request<Announcement>(`/hauling/messages/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.request<{ success: boolean }>(`/hauling/messages/announcements/${id}`, { method: 'DELETE' });
  }
}

// Export singleton instance
export const devapi = new DevApiClient();

// Export class for custom instances if needed
export default DevApiClient;
