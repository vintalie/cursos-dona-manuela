import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

interface EmptyStateProps {
  variant?: "error" | "empty";
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function EmptyState({
  variant = "empty",
  title,
  description,
  onRetry,
  retryLabel = "Tentar novamente",
}: EmptyStateProps) {
  const Icon = variant === "error" ? AlertCircle : Inbox;

  return (
    <div className="empty-state">
      <div className={`empty-state-icon ${variant}`}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="empty-state-retry"
        >
          <RefreshCw size={18} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
