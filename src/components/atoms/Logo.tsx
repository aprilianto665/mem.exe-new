import type { LogoProps } from '../../types/logo.types';

export const Logo = ({
  src,
  alt,
  showGridPattern = true,
  className = '',
  ...props
}: LogoProps) => {
  return (
    <div className="logo-grid-container mb-4">
      {showGridPattern && <div className="logo-grid-pattern"></div>}
      <img
        src={src}
        alt={alt}
        className={`h-40 w-auto object-contain relative z-10 ${className}`}
        {...props}
      />
    </div>
  );
};

