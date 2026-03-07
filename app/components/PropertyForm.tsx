'use client';
import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import type { PropertyPayload } from '../lib/api';
import type { PropertyType, PropertyStatus } from './data';

const ALL_TYPES:    PropertyType[]   = ['Flat', 'Villa', 'Commercial', 'Plot'];
const ALL_STATUSES: PropertyStatus[] = ['New Launch', 'Under Construction', 'Ready', 'Resale'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS  = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

const EMPTY: PropertyPayload = {
  name: '', builder: '', address: '', locality: '', city: '', lat: 0, lng: 0,
  type: 'Flat', status: 'New Launch',
  priceFrom: 0, priceTo: 0, areaSqft: 0,
  possession: '',
  phone: '', email: '', image: '',
  description: '', highlights: [], amenities: [],
  highAppreciation: false,
  builderDocLink: '', priceChartUrl: '',
};

interface Props {
  initial?: Partial<PropertyPayload>;
  submitLabel: string;
  onSubmit: (payload: PropertyPayload) => Promise<void>;
  onCancel: () => void;
}

export default function PropertyForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm]       = useState<PropertyPayload>({ ...EMPTY, ...initial });
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof PropertyPayload, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Controlled list helpers
  const [hlInput, setHlInput] = useState('');
  const [amInput, setAmInput] = useState('');

  const set = <K extends keyof PropertyPayload>(k: K, v: PropertyPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())        e.name        = 'Required';
    if (!form.builder.trim())     e.builder     = 'Required';
    if (!form.address.trim())     e.address     = 'Required';
    if (!form.phone.trim())       e.phone       = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    if (form.areaSqft <= 0)       e.areaSqft    = 'Must be > 0';
    if (!form.locality.trim())    e.locality    = 'Required';
    if (!form.city.trim())        e.city        = 'Required';
    if (!form.possession.trim())  e.possession  = 'Required';
    if (!form.image.trim())       e.image       = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (form.priceFrom <= 0)      e.priceFrom   = 'Must be > 0';
    if (form.priceTo < form.priceFrom) e.priceTo = 'Must be ≥ Price From';
    if (form.lat === 0 && form.lng === 0) { e.lat = 'Required'; e.lng = 'Required'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    const v = hlInput.trim();
    if (v && !form.highlights.includes(v)) set('highlights', [...form.highlights, v]);
    setHlInput('');
  };
  const addAmenity = () => {
    const v = amInput.trim();
    if (v && !form.amenities.includes(v)) set('amenities', [...form.amenities, v]);
    setAmInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-body">{apiError}</div>
      )}

      {/* ── Basic Info ─────────────────────────────────────── */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Project Name" required error={errors.name}>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className={input(!!errors.name)} placeholder="e.g. Prestige Lakeside Habitat" />
          </Field>
          <Field label="Builder" required error={errors.builder}>
            <input value={form.builder} onChange={e => set('builder', e.target.value)}
              className={input(!!errors.builder)} placeholder="e.g. Prestige Group" />
          </Field>
          <Field label="Address / Area" required error={errors.address} className="md:col-span-2">
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className={input(!!errors.address)} placeholder="e.g. Whitefield, Bangalore" />
          </Field>
          <Field label="Description" required error={errors.description} className="md:col-span-2">
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className={input(!!errors.description) + ' resize-none'} placeholder="Project overview…" />
          </Field>
        </div>
      </Section>

      {/* ── Classification ─────────────────────────────────── */}
      <Section title="Classification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Property Type" required>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`px-3 py-2 rounded-xl border text-sm font-body font-semibold transition-all ${
                    form.type === t
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'border-brand-border text-brand-muted hover:border-brand-navy hover:text-brand-navy'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Status" required>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`px-3 py-2 rounded-xl border text-xs font-body font-semibold transition-all ${
                    form.status === s
                      ? 'bg-brand-orange text-white border-brand-orange'
                      : 'border-brand-border text-brand-muted hover:border-brand-orange hover:text-brand-orange'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Bedrooms (BHK)" error={errors.bedrooms}>
            <input type="number" min={1} value={form.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
              className={input(!!errors.bedrooms)} placeholder="e.g. 3" />
          </Field>
          <Field label="Area (sqft)" required error={errors.areaSqft}>
            <input type="number" min={1} value={form.areaSqft || ''} onChange={e => set('areaSqft', Number(e.target.value))}
              className={input(!!errors.areaSqft)} placeholder="e.g. 1200" />
          </Field>
          <Field label="Possession Month / Year" required error={errors.possession}>
            <div className="flex gap-2">
              <select
                value={form.possession.split(' ')[0] ?? ''}
                onChange={e => {
                  const yr = form.possession.split(' ')[1] ?? '';
                  set('possession', `${e.target.value}${yr ? ' ' + yr : ''}`);
                }}
                className={input(!!errors.possession) + ' flex-1'}
              >
                <option value="">Month</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
              <select
                value={form.possession.split(' ')[1] ?? ''}
                onChange={e => {
                  const mo = form.possession.split(' ')[0] ?? '';
                  set('possession', `${mo}${mo ? ' ' : ''}${e.target.value}`);
                }}
                className={input(!!errors.possession) + ' flex-1'}
              >
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </Field>
          <Field label="High Appreciation">
            <label className="flex items-center gap-3 cursor-pointer select-none mt-1">
              <div
                onClick={() => set('highAppreciation', !form.highAppreciation)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.highAppreciation ? 'bg-brand-orange' : 'bg-brand-border'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.highAppreciation ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm font-body text-brand-text">
                {form.highAppreciation ? 'Yes — High Appreciation Area' : 'No'}
              </span>
            </label>
          </Field>
        </div>
      </Section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <Section title="Pricing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Price From (₹)" required error={errors.priceFrom}>
            <input type="number" min={0} value={form.priceFrom || ''} onChange={e => set('priceFrom', Number(e.target.value))}
              className={input(!!errors.priceFrom)} placeholder="e.g. 8500000" />
          </Field>
          <Field label="Price To (₹)" required error={errors.priceTo}>
            <input type="number" min={0} value={form.priceTo || ''} onChange={e => set('priceTo', Number(e.target.value))}
              className={input(!!errors.priceTo)} placeholder="e.g. 14500000" />
          </Field>
          <Field label="Price / sqft (₹)" error={errors.pricePerSqft}>
            <input type="number" min={0} value={form.pricePerSqft ?? ''} onChange={e => set('pricePerSqft', e.target.value ? Number(e.target.value) : undefined)}
              className={input(false)} placeholder="Optional" />
          </Field>
        </div>
      </Section>

      {/* ── Location ─────────────────────────────────────── */}
      <Section title="Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Locality / Area" required error={errors.locality}>
            <input value={form.locality} onChange={e => set('locality', e.target.value)}
              className={input(!!errors.locality)} placeholder="e.g. MG Road" />
          </Field>
          <Field label="City" required error={errors.city}>
            <input value={form.city} onChange={e => set('city', e.target.value)}
              className={input(!!errors.city)} placeholder="e.g. Bengaluru" />
          </Field>
          <Field label="Latitude" required error={errors.lat}>
            <input type="number" step="any" value={form.lat || ''} onChange={e => set('lat', Number(e.target.value))}
              className={input(!!errors.lat)} placeholder="e.g. 12.9698" />
          </Field>
          <Field label="Longitude" required error={errors.lng}>
            <input type="number" step="any" value={form.lng || ''} onChange={e => set('lng', Number(e.target.value))}
              className={input(!!errors.lng)} placeholder="e.g. 77.7499" />
          </Field>
        </div>
      </Section>

      {/* ── Contact ────────────────────────────────────────── */}
      <Section title="Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone" required error={errors.phone}>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              className={input(!!errors.phone)} placeholder="10-digit mobile" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className={input(!!errors.email)} placeholder="sales@example.com" />
          </Field>
        </div>
      </Section>

      {/* ── Media & Docs ───────────────────────────────────── */}
      <Section title="Media & Documents">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cover Image URL" required error={errors.image} className="md:col-span-2">
            <input value={form.image} onChange={e => set('image', e.target.value)}
              className={input(!!errors.image)} placeholder="https://…" />
          </Field>
          {form.image && (
            <div className="md:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="preview" className="h-32 w-full object-cover rounded-xl border border-brand-border" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <Field label="Builder Brochure URL" error={errors.builderDocLink}>
            <input value={form.builderDocLink ?? ''} onChange={e => set('builderDocLink', e.target.value)}
              className={input(false)} placeholder="https://… (optional)" />
          </Field>
          <Field label="Price Chart URL" error={errors.priceChartUrl}>
            <input value={form.priceChartUrl ?? ''} onChange={e => set('priceChartUrl', e.target.value)}
              className={input(false)} placeholder="https://… (optional)" />
          </Field>
        </div>
      </Section>

      {/* ── Highlights ─────────────────────────────────────── */}
      <Section title="Key Highlights">
        <div className="flex gap-2 mb-3">
          <input
            value={hlInput}
            onChange={e => setHlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
            className={input(false) + ' flex-1'}
            placeholder="Add highlight and press Enter"
          />
          <button type="button" onClick={addHighlight}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-navy text-white text-xs font-body font-semibold hover:bg-brand-navy2 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.highlights.map(h => (
            <span key={h} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light border border-brand-border text-xs font-body text-brand-text">
              {h}
              <button type="button" onClick={() => set('highlights', form.highlights.filter(x => x !== h))} className="text-brand-muted hover:text-red-500 transition-colors"><X size={10} /></button>
            </span>
          ))}
        </div>
      </Section>

      {/* ── Amenities ──────────────────────────────────────── */}
      <Section title="Amenities">
        <div className="flex gap-2 mb-3">
          <input
            value={amInput}
            onChange={e => setAmInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
            className={input(false) + ' flex-1'}
            placeholder="Add amenity and press Enter"
          />
          <button type="button" onClick={addAmenity}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-navy text-white text-xs font-body font-semibold hover:bg-brand-navy2 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.amenities.map(a => (
            <span key={a} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-xs font-body text-brand-orange font-medium">
              {a}
              <button type="button" onClick={() => set('amenities', form.amenities.filter(x => x !== a))} className="hover:text-red-500 transition-colors"><X size={10} /></button>
            </span>
          ))}
        </div>
      </Section>

      {/* ── Submit ─────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border">
        <button type="button" onClick={onCancel} disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted font-body text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-white font-body text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors shadow">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Small layout helpers ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
      <div className="px-5 py-3.5 border-b border-brand-border bg-brand-light/50">
        <h2 className="font-body text-xs font-bold text-brand-navy uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}
function Field({ label, required, error, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-body font-semibold text-brand-muted uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-brand-orange ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-body mt-1">{error}</p>}
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full px-3 py-2 rounded-xl border text-sm font-body text-brand-text bg-brand-light placeholder:text-brand-muted/60 focus:outline-none focus:bg-white transition-all ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-brand-border focus:border-brand-orange/50'
  }`;
}
