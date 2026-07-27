type ToastType = 'success' | 'error' | 'info';
type Listener = (message: string, type: ToastType) => void;

let listener: Listener | null = null;

export function registerToastListener(fn: Listener | null) {
  listener = fn;
}

export function showToast(message: string, type: ToastType = 'success') {
  listener?.(message, type);
}
