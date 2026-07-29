import Image from 'next/image';

interface ElagoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ElagoLogo({ className = '', size = 'md' }: ElagoLogoProps) {
  // Height options: sm = 28px, md = 36px, lg = 48px
  // Since the image has dimensions 294x148 (approx 1.986:1 ratio), width will be height * (294 / 148)
  const height = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const width = Math.round(height * (294 / 148));

  return (
    <Image
      src="/elago-logo.jpeg"
      alt="elaGO"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );
}
