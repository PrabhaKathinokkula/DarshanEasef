// Presentation-only temple (gopuram) mark used by the Navbar and Footer.
const BrandLogo = ({ size = 40, light = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M24 3v4" stroke="#E8A928" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 8h6l1.5 3h-9L21 8Z" fill="#E8A928" />
    <path d="M18 11h12l2 5H16l2-5Z" fill={light ? "#E9F3F1" : "#0B6B63"} />
    <path d="M15 16h18l2.5 6h-23L15 16Z" fill={light ? "#FFFFFF" : "#064E4A"} />
    <path d="M12 22h24l3 7H9l3-7Z" fill={light ? "#E9F3F1" : "#0B6B63"} />
    <path d="M9 29h30v11H9V29Z" fill={light ? "#FFFFFF" : "#064E4A"} />
    <path d="M20 40v-6a4 4 0 0 1 8 0v6h-8Z" fill="#E8A928" />
    <path d="M4 40h40v3H4v-3Z" fill="#E8A928" />
  </svg>
);

export default BrandLogo;
