'use client';
import { useRouter } from 'next/navigation';
import SubPageHeader from '../../components/SubPageHeader';
import PropertyForm from '../../components/PropertyForm';
import { api, type PropertyPayload } from '../../lib/api';

export default function AddPropertyPage() {
  const router = useRouter();

  const handleSubmit = async (payload: PropertyPayload) => {
    await api.createProperty(payload);
    router.push('/manage');
  };

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY: 'auto', height: '100vh' }}>
      <SubPageHeader
        backLabel="Manage"
        onBack={() => router.push('/manage')}
        center={
          <h1 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">
            Add New Property
          </h1>
        }
      />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PropertyForm
          submitLabel="Create Property"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manage')}
        />
      </div>
    </div>
  );
}
