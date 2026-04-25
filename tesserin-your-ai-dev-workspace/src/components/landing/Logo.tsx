import logoUrl from "@/assets/tesserin-logo.svg";

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className, size = 32 }: LogoProps) => {
  return (
    <img
      src={logoUrl}
      alt="Tesserin logo"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Logo;
