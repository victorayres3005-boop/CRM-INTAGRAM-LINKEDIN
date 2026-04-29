export function LogoFull() {
  return (
    <svg width="148" height="32" viewBox="0 0 148 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Círculo branco + ponto verde */}
      <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="16" r="4" fill="#a8d96b" />
      {/* "capital" em branco */}
      <text x="36" y="14" fill="white" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="0.5">capital</text>
      {/* "finanças" em verde claro */}
      <text x="36" y="26" fill="#a8d96b" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="0.5">finanças</text>
    </svg>
  );
}

export function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="16" r="4" fill="#a8d96b" />
    </svg>
  );
}

export function LogoSmall() {
  return (
    <svg width="140" height="28" viewBox="0 0 140 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke="#203b88" strokeWidth="2.2" fill="none" />
      <circle cx="14" cy="14" r="3.5" fill="#73b815" />
      <text x="32" y="12" fill="#203b88" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="0.4">capital</text>
      <text x="32" y="24" fill="#73b815" fontSize="11" fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="0.4">finanças</text>
    </svg>
  );
}
