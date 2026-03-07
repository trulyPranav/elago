'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import SubPageHeader from '../../../components/SubPageHeader';
import PropertyForm from '../../../components/PropertyForm';
import { api, ApiError, type PropertyPayload } from '../../../lib/api';

export default function EditPropertyPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [initial, setInitial]   = useState<Partial<PropertyPayload> | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api.getProperty(id)
      .then((res: Awaited<ReturnType<typeof api.getProperty>>) => {
        if (cancelled) return;
        // Map Property → PropertyPayload (drop read-only server fields)
        const p = res.data;
        setInitial({
          name: p.name, builder: p.builder, address: p.address,
          locality: '', city: '',
          lat: p.lat, lng: p.lng, type: p.type, status: p.status,
          priceFrom: p.priceFrom, priceTo: p.priceTo,
          pricePerSqft: p.pricePerSqft,
          areaSqft: parseInt(p.area) || 0,
          bedrooms: p.bedrooms ? parseInt(p.bedrooms) || undefined : undefined,
          possession: p.possession,
          phone: p.phone, email: p.email, image: p.image,
          description: p.description,
          highlights: p.highlights ?? [],
          amenities: p.amenities ?? [],
          highAppreciation: p.highAppreciation,
          builderDocLink: p.builderDocLink ?? '',
          priceChartUrl: p.priceChartUrl ?? '',
        });
      })
      .catch(err => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 400)) {
          setNotFound(true);
        } else {
          setFetchErr(err instanceof Error ? err.message : 'Failed to load property');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (payload: PropertyPayload) => {
    await api.updateProperty(id, payload);
    router.push('/manage');
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <Loader2 size={26} className="text-brand-orange animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="text-center">
        <p className="text-brand-muted font-body font-semibold mb-2">Property not found</p>
        <button onClick={() => router.push('/manage')} className="text-xs text-brand-orange font-body font-semibold underline">Back to Manage</button>
      </div>
    </div>
  );

  if (fetchErr || !initial) return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="text-center">
        <p className="text-brand-muted font-body mb-2">{fetchErr ?? 'Unknown error'}</p>
        <button onClick={() => window.location.reload()} className="text-xs text-brand-orange font-body font-semibold underline">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY: 'auto', height: '100vh' }}>
      <SubPageHeader
        backLabel="Manage"
        onBack={() => router.push('/manage')}
        center={
          <h1 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">
            Edit Property
          </h1>
        }
      />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PropertyForm
          initial={initial}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manage')}
        />
      </div>
    </div>
  );
}
