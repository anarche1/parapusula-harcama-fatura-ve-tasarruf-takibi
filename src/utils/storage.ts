import { AppDataState } from '../types';
import { INITIAL_APP_STATE } from '../data/initialData';

const STORAGE_KEY = 'parapusula_app_data_v1';

export function loadLocalData(): AppDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_APP_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_APP_STATE,
      ...parsed,
      settings: {
        ...INITIAL_APP_STATE.settings,
        ...(parsed.settings || {})
      }
    };
  } catch (e) {
    console.error('Failed to load local storage data:', e);
    return INITIAL_APP_STATE;
  }
}

export function saveLocalData(data: AppDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to local storage:', e);
  }
}

export async function pushToCloudSync(data: AppDataState): Promise<{ success: boolean; syncedAt?: string; message?: string }> {
  try {
    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncKey: data.settings.syncKey,
        data: data
      })
    });

    if (!response.ok) {
      throw new Error('Buluta gönderme başarısız oldu');
    }

    const result = await response.json();
    return {
      success: true,
      syncedAt: result.syncedAt,
      message: result.message
    };
  } catch (e: any) {
    console.warn('Cloud sync offline or error:', e);
    return { success: false, message: e.message || 'Bulut bağlantısı kurulamadı' };
  }
}

export async function pullFromCloudSync(syncKey: string): Promise<{ success: boolean; data?: AppDataState; message?: string }> {
  try {
    const response = await fetch(`/api/sync/pull/${encodeURIComponent(syncKey)}`);
    if (!response.ok) {
      const err = await response.json();
      return { success: false, message: err.message || 'Buluttan veri çekilemedi' };
    }

    const result = await response.json();
    if (result.found && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'Bulut verileri başarıyla senkronize edildi.'
      };
    }
    return { success: false, message: 'Bu anahtarla eşleşen bulut verisi bulunamadı.' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Ağ hatası oluştu' };
  }
}

export function loadInitialData(): AppDataState {
  return loadLocalData();
}

export function saveAppData(data: AppDataState): void {
  saveLocalData(data);
}

export function resetAppData(): AppDataState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_APP_STATE;
}

export async function syncWithCloud(syncKey: string, data: AppDataState): Promise<boolean> {
  const res = await pushToCloudSync({
    ...data,
    settings: {
      ...data.settings,
      syncKey
    }
  });
  return res.success;
}

export async function fetchFromCloud(syncKey: string): Promise<AppDataState | null> {
  const res = await pullFromCloudSync(syncKey);
  return res.data || null;
}

export function exportDataAsJSON(data: AppDataState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `parapusula_yedek_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}


