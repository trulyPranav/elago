'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('elago_token');
    if (!token) {
      // Redirect to login page and keep track of where we wanted to go
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light">
        <Loader2 className="h-8 w-8 text-brand-orange animate-spin mb-2" />
        <p className="text-sm font-body text-brand-muted">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
