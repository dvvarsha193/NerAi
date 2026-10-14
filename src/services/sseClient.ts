import { useTelemetryStore } from '../store/useTelemetryStore';
import { useOfflineStore } from '../store/useOfflineStore';
import { soundEffects } from './soundEffects';

class SseClientService {
  private eventSource: EventSource | null = null;
  private localTickerInterval: any = null;
  private reconnectTimer: any = null;

  public connect() {
    const isOffline = useOfflineStore.getState().isOffline;
    if (isOffline) return;

    // Start local simulation ticker for smooth movement
    this.startLocalTicker();

    // Connect to real-time Server-Sent Events (SSE)
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        const streamUrl = window.location.port === '5173'
          ? 'http://localhost:3001/api/stream'
          : '/api/stream';

        this.eventSource = new EventSource(streamUrl);

        this.eventSource.onopen = () => {
          // Connection established
        };

        this.eventSource.onmessage = (event) => {
          const isCurrentlyOffline = useOfflineStore.getState().isOffline;
          if (isCurrentlyOffline) return;

          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'INIT':
                if (data.convoys && data.convoys.length > 0) {
                  useTelemetryStore.getState().syncConvoysFromServer(data.convoys);
                }
                if (data.alerts && data.alerts.length > 0) {
                  useTelemetryStore.getState().syncAlertsFromServer(data.alerts);
                }
                break;

              case 'CONVOY_REROUTED':
                soundEffects.playRerouteCalculated();
                if (data.convoys) {
                  useTelemetryStore.getState().syncConvoysFromServer(data.convoys);
                } else if (data.convoy) {
                  useTelemetryStore.getState().applyRerouteFromServer(data.convoy);
                }
                useOfflineStore.getState().setToast(
                  '🚨 Reroute Dispatched',
                  data.message || 'Convoy diverted to dynamic bypass route.',
                  'warning'
                );
                break;

              case 'CONVOY_ADDED':
                soundEffects.playSyncSuccess();
                if (data.convoys) {
                  useTelemetryStore.getState().syncConvoysFromServer(data.convoys);
                } else if (data.convoy) {
                  useTelemetryStore.getState().applyNewConvoyFromServer(data.convoy);
                }
                useOfflineStore.getState().setToast(
                  'Vehicle Registered',
                  data.message || `Vehicle active on live corridor.`,
                  'success'
                );
                break;

              case 'INCIDENT_REPORTED':
                soundEffects.playAlertChime();
                if (data.alerts) {
                  useTelemetryStore.getState().syncAlertsFromServer(data.alerts);
                }
                useOfflineStore.getState().setToast(
                  '⚠️ Field Hazard Alert',
                  data.message || 'New incident reported on active corridor.',
                  'warning'
                );
                break;

              case 'SIMULATION_INJECTED':
                soundEffects.playAlertChime();
                if (data.alerts) {
                  useTelemetryStore.getState().syncAlertsFromServer(data.alerts);
                }
                useOfflineStore.getState().setToast(
                  '⚡ Simulation Scenario Injected',
                  data.message || 'Disaster threat simulated on network.',
                  'warning'
                );
                break;

              case 'ALERT_ACKNOWLEDGED':
                if (data.alerts) {
                  useTelemetryStore.getState().syncAlertsFromServer(data.alerts);
                } else if (data.alertId) {
                  useTelemetryStore.getState().acknowledgeAlertLocally(data.alertId);
                }
                break;

              case 'TELEMETRY_TICK':
                // Server heartbeat
                break;

              default:
                break;
            }
          } catch (err) {
            console.warn('[SSE] Error processing stream event:', err);
          }
        };

        this.eventSource.onerror = () => {
          if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
          }
          // Retry connection after 5 seconds
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              this.connect();
            }, 5000);
          }
        };
      }
    } catch {
      // Local ticker ensures flawless operation
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private startLocalTicker() {
    if (this.localTickerInterval) return;

    this.localTickerInterval = setInterval(() => {
      const isOffline = useOfflineStore.getState().isOffline;
      if (!isOffline) {
        useTelemetryStore.getState().tickTelemetry();
      }
    }, 2200);
  }

  public stopLocalTicker() {
    if (this.localTickerInterval) {
      clearInterval(this.localTickerInterval);
      this.localTickerInterval = null;
    }
  }
}

export const sseClient = new SseClientService();
