// Realtime subscriptions - Not available with DevApi REST API
// Components will use polling instead

export interface RealtimeChannel {
  unsubscribe: () => void
}

export function subscribeToDeviceStatus(callback: (payload: unknown) => void): RealtimeChannel {
  console.warn('[Realtime] Device status subscriptions not implemented - use polling instead')
  return { unsubscribe: () => {} }
}

export function subscribeToJobs(callback: (payload: unknown) => void, driverId?: string): RealtimeChannel {
  console.warn('[Realtime] Job subscriptions not implemented - use polling instead')
  return { unsubscribe: () => {} }
}

export function subscribeToErrorLogs(callback: (payload: unknown) => void): RealtimeChannel {
  console.warn('[Realtime] Error log subscriptions not implemented - use polling instead')
  return { unsubscribe: () => {} }
}

export function subscribeToIssues(callback: (payload: unknown) => void): RealtimeChannel {
  console.warn('[Realtime] Issue subscriptions not implemented - use polling instead')
  return { unsubscribe: () => {} }
}

export async function unsubscribe(channel: RealtimeChannel) {
  channel.unsubscribe()
}
