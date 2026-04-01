import { supabase } from './supabase'
import { getDeviceId } from './deviceId'

export async function logEvent(
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    const device_id = await getDeviceId()
    await supabase.from('events').insert({
      device_id,
      event_name: eventName,
      properties: properties ?? null,
    })
  } catch (_) {
    // never throw — analytics must not break the app
  }
}
