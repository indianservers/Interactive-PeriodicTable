export default function ViewerLoadingState({ status, message, onRetry }) {
  if (status === 'ready') return null;
  return <div className={`molstar-viewer-state is-${status}`} role={status === 'error' ? 'alert' : 'status'}>
    {status === 'loading' && <span className="molstar-viewer-spinner" />}
    <strong>{message}</strong>
    {status === 'error' && onRetry && <button type="button" onClick={onRetry}>Retry</button>}
  </div>;
}
