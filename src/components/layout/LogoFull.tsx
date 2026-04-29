import Image from "next/image";

// Versão branca — para sidebar com fundo navy
export function LogoFull() {
  return (
    <Image
      src="/logo.png"
      alt="Capital Finanças"
      width={148}
      height={40}
      priority
      style={{ objectFit: "contain" }}
    />
  );
}

// Ícone isolado — fallback quando não há espaço para o logotipo completo
export function LogoIcon() {
  return (
    <Image
      src="/logo.png"
      alt="Capital Finanças"
      width={40}
      height={40}
      priority
      style={{ objectFit: "contain" }}
    />
  );
}

// Versão colorida — para fundos claros (header, login, relatórios)
export function LogoSmall() {
  return (
    <Image
      src="/logo2.png"
      alt="Capital Finanças"
      width={140}
      height={36}
      style={{ objectFit: "contain" }}
    />
  );
}
