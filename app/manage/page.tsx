'use client';
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Trash2, Search, Loader2, AlertTriangle, X,
  ChevronLeft, ChevronRight, Building2, TrendingUp, Upload, FileSpreadsheet, CheckCircle2,
} from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader';
import { api, ApiError, type Property, type Pagination, type BulkUploadResult } from '../lib/api';
import { formatPrice, TYPE_COLORS, STATUS_LIGHT } from '../components/data';

const LIMIT = 15;
const MAX_CSV_SIZE_BYTES = 50 * 1024 * 1024;
const REQUIRED_CSV_HEADERS = [
  'name',
  'builder',
  'propertyType',
  'status',
  'location.address',
  'location.area',
  'location.city',
  'location.coordinates.lat',
  'location.coordinates.lng',
  'details.area_sqft',
  'details.description',
  'details.possession_date',
  'pricing.price_from',
  'pricing.price_to',
];

interface CsvValidationIssue {
  field: string;
  message: string;
}

interface CsvValidationRowError {
  rowNumber: number;
  errors: CsvValidationIssue[];
}

function isCsvFile(file: File): boolean {
  const csvMimeTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];
  return file.name.toLowerCase().endsWith('.csv') || csvMimeTypes.includes(file.type.toLowerCase());
}

async function validateCsvHeaders(file: File): Promise<string[]> {
  const firstChunk = await file.slice(0, 16 * 1024).text();
  const firstLine = firstChunk.split(/\r?\n/).find(line => line.trim().length > 0) ?? '';
  if (!firstLine) return [...REQUIRED_CSV_HEADERS];

  const headers = firstLine
    .split(',')
    .map(h => h.trim().replace(/^"|"$/g, ''));

  return REQUIRED_CSV_HEADERS.filter(required => !headers.includes(required));
}

export default function ManagePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage]             = useState(1);
  const [q, setQ]                   = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  // Bulk upload state
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkValidationErrors, setBulkValidationErrors] = useState<CsvValidationRowError[]>([]);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (val: string) => {
    setQ(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedQ(val);
    }, 350);
  };

  // Fetch list
  const fetchList = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.getProperties({ page, limit: LIMIT, q: debouncedQ || undefined, sortBy: 'newest' })
      .then(({ data, pagination: pg }) => {
        if (cancelled) return;
        setProperties(data);
        setPagination(pg);
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, debouncedQ]);

  const validateAndSetCsv = (file: File | null) => {
    setBulkError(null);
    setBulkValidationErrors([]);
    setBulkResult(null);

    if (!file) {
      setCsvFile(null);
      return;
    }

    if (!isCsvFile(file)) {
      setCsvFile(null);
      setBulkError('Only CSV files are allowed.');
      return;
    }

    if (file.size > MAX_CSV_SIZE_BYTES) {
      setCsvFile(null);
      setBulkError('File is too large. Maximum allowed size is 50 MB.');
      return;
    }

    setCsvFile(file);
  };

  const onCsvInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    validateAndSetCsv(file);
  };

  const resetCsvSelection = () => {
    setCsvFile(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const uploadCsv = async () => {
    if (!csvFile || uploadingCsv) return;

    setUploadingCsv(true);
    setBulkError(null);
    setBulkValidationErrors([]);
    setBulkResult(null);

    try {
      const missingHeaders = await validateCsvHeaders(csvFile);
      if (missingHeaders.length > 0) {
        setBulkError(`Missing required CSV header(s): ${missingHeaders.join(', ')}`);
        setUploadingCsv(false);
        return;
      }

      const result = await api.bulkUploadProperties(csvFile);
      setBulkResult(result);
      resetCsvSelection();
      setPage(1);
      setDebouncedQ('');
      setQ('');
      fetchList();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details as {
          error?: { validationErrors?: CsvValidationRowError[] };
        } | undefined;

        if (err.statusCode === 422 && details?.error?.validationErrors?.length) {
          setBulkValidationErrors(details.error.validationErrors);
        }
        setBulkError(err.message || 'Bulk upload failed');
      } else {
        setBulkError(err instanceof Error ? err.message : 'Bulk upload failed');
      }
    } finally {
      setUploadingCsv(false);
    }
  };

  useEffect(() => {
    const cancel = fetchList();
    return cancel;
  }, [fetchList]);

  // Delete handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteProperty(deleteTarget.id);
      setDeleteTarget(null);
      fetchList();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY: 'auto', height: '100vh' }}>
      <SubPageHeader
        backLabel="Map View"
        center={
          <h1 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">
            Manage Properties
          </h1>
        }
        right={
          <button
            onClick={() => router.push('/manage/add')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-body font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus size={13} /> Add Property
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={q}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search name, builder, area…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-brand-border text-sm font-body text-brand-text placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-orange/50 transition-all"
            />
            {q && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text">
                <X size={13} />
              </button>
            )}
          </div>
          {pagination && (
            <span className="text-xs text-brand-muted font-body">
              {pagination.total} propert{pagination.total === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>

        {/* Bulk upload */}
        <div className="mb-5 bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
          <div className="px-4 md:px-5 py-3 border-b border-brand-border bg-brand-light/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-brand-navy" />
              <h2 className="font-body text-xs font-bold text-brand-navy uppercase tracking-wider">Bulk CSV Upload</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = [
                  'name', 'builder', 'propertyType', 'status',
                  'location.address', 'location.area', 'location.city',
                  'location.coordinates.lat', 'location.coordinates.lng',
                  'details.area_sqft', 'details.bedrooms', 'details.description', 'details.possession_date',
                  'pricing.price_from', 'pricing.price_to', 'pricing.price_per_sqft',
                  'media.brochure_url', 'contact.phone', 'contact.email',
                  'amenities', 'highlights', 'high_appreciation',
                  'rental.expected_rent', 'rental.vacancy_rate',
                ];
                const sampleRows = [
                  [
                    'Prestige Palm Heights', 'Prestige Group', 'Flat', 'Under Construction',
                    'Whitefield Main Road, Bengaluru', 'Whitefield', 'Bengaluru',
                    '12.9716', '77.5946',
                    '1450', '2,3', 'Premium gated community with lake-facing towers', 'Dec 2026',
                    '8500000', '12500000', '5862',
                    'https://example.com/brochure.pdf', '9876543210', 'sales@prestige.in',
                    'Swimming Pool|Gymnasium|Clubhouse', 'RERA Approved|East Bengaluru|Metro Nearby', 'true',
                    '35000', '0.05',
                  ],
                ];
                const csv = [headers.join(','), ...sampleRows.map(r => r.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'BULK_UPLOAD_SAMPLE.csv';
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                URL.revokeObjectURL(url);
              }}
              className="text-xs font-body font-semibold text-brand-orange hover:underline"
            >
              Download Sample CSV
            </button>
          </div>

          <div className="px-4 md:px-5 py-4 space-y-3">
            <p className="text-xs text-brand-muted font-body leading-relaxed">
              Upload a CSV file up to 50 MB. Bedrooms must be comma-separated values (for example 2,3), and amenities/highlights must be pipe-separated (for example Pool|Gym|Clubhouse).
            </p>

            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={onCsvInputChange}
                className="hidden"
                id="bulk-upload-csv"
              />
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                disabled={uploadingCsv}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-brand-navy text-sm font-body font-semibold hover:bg-brand-hover disabled:opacity-60"
              >
                <Upload size={14} /> Choose CSV
              </button>
              <button
                type="button"
                onClick={uploadCsv}
                disabled={!csvFile || uploadingCsv}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-body font-semibold hover:bg-orange-600 disabled:opacity-60"
              >
                {uploadingCsv ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Upload Properties'}
              </button>
              {csvFile && !uploadingCsv && (
                <button
                  type="button"
                  onClick={resetCsvSelection}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-semibold border border-brand-border text-brand-muted hover:bg-brand-hover"
                >
                  <X size={12} /> Clear
                </button>
              )}
              <span className="text-xs font-body text-brand-muted truncate">
                {csvFile ? `${csvFile.name} (${(csvFile.size / 1024 / 1024).toFixed(2)} MB)` : 'No file selected'}
              </span>
            </div>

            {bulkError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-body text-red-700">
                {bulkError}
              </div>
            )}

            {bulkResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <p className="text-sm font-body font-semibold">{bulkResult.message}</p>
                </div>
                <div className="text-xs font-body text-emerald-800">
                  Imported: <span className="font-semibold">{bulkResult.imported}</span> | Skipped: <span className="font-semibold">{bulkResult.skipped}</span>
                </div>
                {(bulkResult.skippedDuplicates?.length ?? 0) > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-body font-semibold text-emerald-900 mb-1">Skipped duplicates</p>
                    <div className="max-h-36 overflow-auto rounded-lg border border-emerald-200 bg-white">
                      <table className="w-full">
                        <thead className="bg-emerald-50 border-b border-emerald-100">
                          <tr>
                            <th className="px-2 py-1.5 text-left text-[11px] font-body font-bold text-emerald-800">Row</th>
                            <th className="px-2 py-1.5 text-left text-[11px] font-body font-bold text-emerald-800">Property</th>
                            <th className="px-2 py-1.5 text-left text-[11px] font-body font-bold text-emerald-800">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(bulkResult.skippedDuplicates ?? []).map((dup) => (
                            <tr key={`${dup.rowNumber}-${dup.name}-${dup.builder}`} className="border-b border-emerald-100 last:border-b-0">
                              <td className="px-2 py-1.5 text-xs font-body text-brand-text">{dup.rowNumber}</td>
                              <td className="px-2 py-1.5 text-xs font-body text-brand-text">{dup.name} ({dup.builder})</td>
                              <td className="px-2 py-1.5 text-xs font-body text-brand-muted">{dup.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {bulkValidationErrors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3">
                <p className="text-sm font-body font-semibold text-red-700 mb-2">CSV validation errors</p>
                <div className="space-y-2 max-h-52 overflow-auto pr-1">
                  {bulkValidationErrors.map((row) => (
                    <div key={row.rowNumber} className="rounded-lg border border-red-200 bg-white p-2.5">
                      <p className="text-xs font-body font-semibold text-red-700 mb-1">Row {row.rowNumber}</p>
                      <ul className="space-y-1">
                        {row.errors.map((issue, idx) => (
                          <li key={`${issue.field}-${idx}`} className="text-xs font-body text-brand-text">
                            <span className="font-semibold">{issue.field}:</span> {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-light border-b border-brand-border">
                <tr>
                  {['Project', 'Builder', 'Type', 'Status', 'Price Range', 'Possession', 'Apprec.', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-body font-bold text-brand-muted uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: LIMIT }).map((_, i) => (
                      <tr key={i} className="border-b border-brand-border/40">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3 rounded bg-brand-border/40 animate-pulse" style={{ width: j === 0 ? '60%' : j === 7 ? '40%' : '50%' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : error
                  ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center">
                          <p className="text-brand-muted font-body text-sm mb-2">{error}</p>
                          <button onClick={fetchList} className="text-xs text-brand-orange font-semibold underline font-body">Retry</button>
                        </td>
                      </tr>
                    )
                  : properties.length === 0
                  ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-14 text-center">
                          <Building2 size={28} className="text-brand-border mx-auto mb-3" />
                          <p className="text-brand-muted font-body text-sm">No properties found</p>
                        </td>
                      </tr>
                    )
                  : properties.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-b border-brand-border/40 last:border-0 hover:bg-brand-hover transition-colors ${i % 2 !== 0 ? 'bg-brand-light/30' : ''}`}
                      >
                        <td className="px-4 py-3 max-w-[180px]">
                          <button
                            onClick={() => router.push(`/property/${p.id}`)}
                            className="text-sm font-body font-semibold text-brand-navy hover:underline truncate block max-w-full text-left"
                          >
                            {p.name}
                          </button>
                          <p className="text-xs text-brand-muted font-body truncate">{p.address}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-brand-muted whitespace-nowrap">{p.builder}</td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-body font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: TYPE_COLORS[p.type] ?? '#64748b' }}
                          >
                            {p.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-body font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: STATUS_LIGHT[p.status] ?? '#64748b' }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-bold text-brand-orange whitespace-nowrap">
                          {formatPrice(p.priceFrom)}–{formatPrice(p.priceTo)}
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-brand-muted whitespace-nowrap">{p.possession}</td>
                        <td className="px-4 py-3">
                          {p.highAppreciation
                            ? <span className="flex items-center gap-1 text-xs text-brand-orange font-semibold font-body"><TrendingUp size={11} /> High</span>
                            : <span className="text-xs text-brand-muted">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => router.push(`/manage/edit/${p.id}`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-navy hover:border-brand-navy hover:bg-brand-hover text-xs font-body font-semibold transition-all"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(p); setDeleteError(null); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-400 hover:text-red-600 hover:border-red-400 hover:bg-red-50 text-xs font-body font-semibold transition-all"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {!loading && !error && pagination && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between bg-brand-light/50">
              <span className="text-xs text-brand-muted font-body">
                Page {pagination.page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
                  if (pg < 1 || pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                        pg === page
                          ? 'bg-brand-navy text-white'
                          : 'border border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-hover'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadein-fast">
          <div className="bg-white rounded-2xl card-shadow-lg border border-brand-border w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-brand-navy text-base">Delete Property</h3>
                  <p className="text-sm text-brand-muted font-body mt-1 leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-brand-navy">{deleteTarget.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              {deleteError && (
                <p className="mt-3 text-xs text-red-500 font-body bg-red-50 border border-red-100 rounded-lg px-3 py-2">{deleteError}</p>
              )}
            </div>
            <div className="px-6 pb-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-brand-border text-brand-muted font-body text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-body text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : <><Trash2 size={13} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
