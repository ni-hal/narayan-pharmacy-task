export default function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}
