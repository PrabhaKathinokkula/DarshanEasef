import { Inbox } from "lucide-react";

/**
 * Reusable empty state block.
 * icon: a lucide-react component (optional, defaults to Inbox)
 * action: optional { label, onClick } or { label, to } rendered as a button/link by the caller via children
 */
const EmptyState = ({ icon: Icon = Inbox, title, description, children }) => (
  <div className="empty-state">
    <div className="state-icon">
      <Icon size={26} />
    </div>
    {title && <h4>{title}</h4>}
    {description && <p>{description}</p>}
    {children}
  </div>
);

export default EmptyState;
