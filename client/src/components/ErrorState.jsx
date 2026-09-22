import { AlertTriangle, RotateCw } from "lucide-react";

const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="error-state">
    <div className="state-icon">
      <AlertTriangle size={26} />
    </div>
    <h4>Unable to load this page</h4>
    <p>{message}</p>
    {onRetry && (
      <button className="btn btn-outline btn-sm" onClick={onRetry}>
        <RotateCw size={15} /> Try again
      </button>
    )}
  </div>
);

export default ErrorState;
