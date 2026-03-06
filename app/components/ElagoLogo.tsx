// elaGO logo - "ela" in navy, "G" in navy, "O" replaced by orange target/bullseye circle
export default function ElagoLogo({ className = "", size = "md" }: { className?: string; size?: "sm"|"md"|"lg" }) {
  const h = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  return (
    <svg viewBox="0 0 140 40" height={h} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* "ela" in navy */}
      <text x="0" y="30" fontFamily="DM Sans, system-ui, sans-serif" fontWeight="700"
        fontSize="28" fill="#00405c" letterSpacing="-0.5">ela</text>
      {/* "G" in navy */}
      <text x="62" y="30" fontFamily="DM Sans, system-ui, sans-serif" fontWeight="700"
        fontSize="28" fill="#00405c" letterSpacing="-0.5">G</text>
      {/* "O" as target/bullseye - orange circle with inner ring */}
      <circle cx="118" cy="18" r="16" fill="#f15a29"/>
      <circle cx="118" cy="18" r="10" fill="white"/>
      <circle cx="118" cy="18" r="5" fill="#f15a29"/>
      <circle cx="118" cy="18" r="2" fill="white"/>
    </svg>
  );
}
