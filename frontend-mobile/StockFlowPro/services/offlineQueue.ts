import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = 'offline_sale_queue_v1';

export interface PendingSale {
  id: string;
  endpoint: string;
  body: any;
  label: string;
  createdAt: number;
}

/** Good enough for a client-side dedupe key — doesn't need to be cryptographically random. */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

async function readQueue(): Promise<PendingSale[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: PendingSale[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Call when a sale request fails with no server response (dropped connection). */
export async function enqueueSale(endpoint: string, body: any, label: string): Promise<void> {
  const queue = await readQueue();
  queue.push({ id: body.idempotencyKey, endpoint, body, label, createdAt: Date.now() });
  await writeQueue(queue);
}

export async function getPendingSales(): Promise<PendingSale[]> {
  return readQueue();
}

/** A failed request with no response at all means the network dropped, not that the server rejected it. */
export function isNetworkFailure(error: any): boolean {
  return !error?.response && !!error?.request;
}

/**
 * Attempts to resend every queued sale, in order, stopping at the first one
 * that still can't reach the server (keeps remaining items queued for next
 * time). Sales that reach the server and get a real error response (e.g.
 * insufficient stock by the time it synced) are dropped from the queue and
 * reported back so the UI can surface them — resending those forever would
 * never succeed.
 */
export async function flushQueue(): Promise<{ synced: number; failed: number; droppedErrors: string[] }> {
  const queue = await readQueue();
  let synced = 0;
  const droppedErrors: string[] = [];
  const stillPending: PendingSale[] = [];
  let hitNetworkFailure = false;

  for (const item of queue) {
    if (hitNetworkFailure) {
      stillPending.push(item); // still offline — leave every item after the failure queued, untouched
      continue;
    }
    try {
      await api.post(item.endpoint, item.body);
      synced++;
    } catch (e: any) {
      if (isNetworkFailure(e)) {
        hitNetworkFailure = true;
        stillPending.push(item);
      } else {
        // Server actually responded with a rejection — don't retry forever.
        droppedErrors.push(`${item.label}: ${e?.response?.data?.error || e?.response?.data?.message || 'failed to sync'}`);
      }
    }
  }

  await writeQueue(stillPending);
  return { synced, failed: stillPending.length, droppedErrors };
}
