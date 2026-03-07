'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ElagoLogo from './ElagoLogo';

interface SubPageHeaderProps {
  /** Label for the back button. Defaults to "Back". */
  backLabel?: string;
  /** Optional text shown after the logo divider (e.g. property name). */
  subtitle?: string;
  /** Optional center slot (e.g. search input). When provided and no right is given, a spacer is auto-rendered on the right to keep the center visually centered. */
  center?: ReactNode;
  /** Optional right slot (e.g. action buttons). */
  right?: ReactNode;
}

export default function SubPageHeader({
  backLabel = 'Back',
  subtitle,
  center,
  right,
}: SubPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-brand-border card-shadow">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-body font-medium transition-colors"
        >
          <ArrowLeft size={15} /> {backLabel}
        </button>
        <div className="h-4 w-px bg-brand-border" />
        <ElagoLogo size="sm" />
        {subtitle && (
          <>
            <div className="h-4 w-px bg-brand-border" />
            <span className="text-xs text-brand-muted font-body truncate max-w-xs">{subtitle}</span>
          </>
        )}
      </div>

      {center}

      {/* Render right slot; if center is present but no right, render a spacer to keep center balanced */}
      {right ?? (center ? <div className="w-32" /> : null)}
    </header>
  );
}
