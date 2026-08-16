import { useToast } from '../context/ToastContext';
import './Toast.css';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-item mono"
          onClick={() => dismissToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
