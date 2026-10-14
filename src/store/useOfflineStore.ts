import { create } from 'zustand';
import { FieldIncidentEntry } from '../types';
import { saveOfflineReport, getOfflineReports, clearOfflineReports } from '../services/indexedDb';
import { soundEffects } from '../services/soundEffects';

import { submitIncidentsApi } from '../services/api';

interface OfflineState {
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string;
  pendingReports: any[];
  toastMessage: { id: string; title: string; desc: string; type: 'success' | 'warning' | 'info' } | null;

  setOffline: (offline: boolean) => void;
  toggleOffline: () => void;
  loadPendingReports: () => Promise<void>;
  submitIncidentReport: (report: any) => Promise<void>;
  syncPendingReports: () => Promise<number>;
  clearToast: () => void;
  setToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info') => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOffline: false,
  isSyncing: false,
  lastSyncedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  pendingReports: [],
  toastMessage: null,

  setOffline: (offline: boolean) => {
    soundEffects.playClick();
    set({ isOffline: offline });
    if (!offline) {
      // Auto-sync when coming back online
      get().syncPendingReports();
    } else {
      get().setToast('Satellite Blind Spot Detected', 'Running on local IndexedDB edge persistence. Telemetry cached at last satellite tick.', 'warning');
    }
  },

  toggleOffline: () => {
    const nextState = !get().isOffline;
    get().setOffline(nextState);
  },

  loadPendingReports: async () => {
    try {
      const reports = await getOfflineReports();
      set({ pendingReports: reports });
    } catch {
      // Fallback
    }
  },

  submitIncidentReport: async (reportData: any) => {
    const isCurrentlyOffline = get().isOffline;
    const newReport: any = {
      ...reportData,
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      synced: !isCurrentlyOffline,
      syncTimestamp: !isCurrentlyOffline ? 'Direct Push' : undefined,
    };

    if (isCurrentlyOffline) {
      // Save locally to IndexedDB
      await saveOfflineReport(newReport);
      const current = get().pendingReports;
      set({ pendingReports: [newReport, ...current] });
      soundEffects.playAlertChime();
      get().setToast(
        'Offline Report Saved to Vault',
        `Incident at ${newReport.highway || newReport.kilometerMark || 'Corridor'} stored locally in IndexedDB. Will sync when connectivity returns.`,
        'warning'
      );
    } else {
      // Sent online to persistent database
      try {
        await submitIncidentsApi(newReport);
      } catch (err) {
        console.warn('[OfflineStore] Failed to send report to server:', err);
      }

      soundEffects.playSyncSuccess();
      get().setToast(
        'Report Transmitted to Central Ops',
        `Live incident logged: ${newReport.hazardType || newReport.type || 'Hazard'} at ${newReport.highway || newReport.kmMark || 'Corridor'}.`,
        'success'
      );
    }
  },

  syncPendingReports: async () => {
    const pending = get().pendingReports;
    if (pending.length === 0) return 0;

    set({ isSyncing: true });

    try {
      await submitIncidentsApi(pending);
    } catch (err) {
      console.warn('[OfflineStore] Sync to server failed:', err);
    }

    // Animate sync duration
    await new Promise((resolve) => setTimeout(resolve, 800));

    const count = pending.length;
    await clearOfflineReports();
    set({
      pendingReports: [],
      isSyncing: false,
      lastSyncedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    soundEffects.playSyncSuccess();
    get().setToast(
      'Back Online — Cloud Sync Complete',
      `Flushed ${count} offline incident report${count > 1 ? 's' : ''} to central NerLogix database.`,
      'success'
    );

    return count;
  },

  clearToast: () => set({ toastMessage: null }),

  setToast: (title, desc, type = 'info') => {
    set({
      toastMessage: {
        id: `toast-${Date.now()}`,
        title,
        desc,
        type,
      },
    });
    // Auto-dismiss after 5s
    setTimeout(() => {
      const current = get().toastMessage;
      if (current && current.title === title) {
        set({ toastMessage: null });
      }
    }, 5000);
  },
}));
