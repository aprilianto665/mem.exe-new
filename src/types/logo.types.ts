import type { ImgHTMLAttributes } from 'react';

export interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  showGridPattern?: boolean;
}

