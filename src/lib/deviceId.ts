import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

const DEVICE_ID_KEY = '@goshdang/device_id'

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const newId = uuidv4()
  await AsyncStorage.setItem(DEVICE_ID_KEY, newId)
  return newId
}
