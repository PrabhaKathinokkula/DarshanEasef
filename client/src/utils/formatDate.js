// Formats a stored ISO date string using its UTC calendar-date components,
// so the displayed date never shifts based on the viewer's local timezone.
export const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

// Compares a stored slot date (UTC calendar date) against today's date,
// also read via UTC components, so this lines up with how formatDate
// displays it and isn't thrown off by the viewer's local timezone.
export const isToday = (dateInput) => {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
};