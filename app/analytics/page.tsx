'use client';
import { useRouter } from 'next/navigation';
import { TrendingUp, Building2, MapPin, BarChart2, Home } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader';
import { PROPERTIES, formatPrice } from '../components/data';

export default function AnalyticsPage() {
  const router = useRouter();

  const totalValue = PROPERTIES.reduce((s, p) => s + p.priceFrom, 0);
  const byType = Object.entries(PROPERTIES.reduce((acc, p) => { acc[p.type] = (acc[p.type]||0)+1; return acc; }, {} as Record<string,number>));
  const byStatus = Object.entries(PROPERTIES.reduce((acc, p) => { acc[p.status] = (acc[p.status]||0)+1; return acc; }, {} as Record<string,number>));
  const highApp = PROPERTIES.filter(p => p.highAppreciation).length;

  const TYPE_COLS: Record<string, string> = { Flat:'#00405c', Villa:'#f15a29', Commercial:'#10b981', Plot:'#F0B429' };
  const STATUS_COLS: Record<string, string> = { 'New Launch':'#f15a29', 'Under Construction':'#F0B429', 'Ready':'#10b981', 'Resale':'#8B5CF6' };

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY:'auto', height:'100vh' }}>
      <SubPageHeader
        backLabel="Map View"
        center={<h1 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">Analytics Dashboard</h1>}
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Listings', value: PROPERTIES.length, icon: Home, color:'#00405c', bg:'#00405c15' },
            { label:'High Appreciation', value: highApp, icon: TrendingUp, color:'#f15a29', bg:'#f15a2915' },
            { label:'Ready to Move', value: PROPERTIES.filter(p=>p.status==='Ready').length, icon: Building2, color:'#10b981', bg:'#10b98115' },
            { label:'New Launches', value: PROPERTIES.filter(p=>p.status==='New Launch').length, icon: MapPin, color:'#8B5CF6', bg:'#8B5CF615' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon size={18} style={{ color }}/>
                </div>
                <span className="text-3xl font-mono font-bold" style={{ color }}>{value}</span>
              </div>
              <p className="text-xs text-brand-muted font-body font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* By Type */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
            <h3 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 size={14} className="text-brand-orange"/> By Property Type
            </h3>
            <div className="space-y-3">
              {byType.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body text-brand-text font-medium">{type}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: TYPE_COLS[type] }}>{count}</span>
                  </div>
                  <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(count/PROPERTIES.length)*100}%`, backgroundColor: TYPE_COLS[type] }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border card-shadow">
            <h3 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 size={14} className="text-brand-orange"/> By Status
            </h3>
            <div className="space-y-3">
              {byStatus.map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body text-brand-text font-medium">{status}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: STATUS_COLS[status] }}>{count}</span>
                  </div>
                  <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(count/PROPERTIES.length)*100}%`, backgroundColor: STATUS_COLS[status] }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">All Projects Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-light border-b border-brand-border">
                <tr>{['Project','Builder','Type','Status','Price Range','Possession','Appreciation'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-body font-bold text-brand-muted uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {PROPERTIES.map((p, i) => (
                  <tr key={p.id} onClick={() => router.push(`/property/${p.id}`)}
                    className={`border-b border-brand-border/50 last:border-0 hover:bg-brand-hover cursor-pointer transition-colors ${i%2===0?'':'bg-brand-light/30'}`}>
                    <td className="px-4 py-3 text-sm font-body font-semibold text-brand-navy">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-body text-brand-muted">{p.builder}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-body font-bold text-white" style={{ backgroundColor: TYPE_COLS[p.type] }}>{p.type}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-body font-bold text-white" style={{ backgroundColor: STATUS_COLS[p.status] || '#64748b' }}>{p.status}</span></td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-brand-orange">{formatPrice(p.priceFrom)}–{formatPrice(p.priceTo)}</td>
                    <td className="px-4 py-3 text-sm font-body text-brand-muted">{p.possession}</td>
                    <td className="px-4 py-3">{p.highAppreciation ? <span className="text-xs text-brand-orange font-body font-semibold flex items-center gap-1"><TrendingUp size={10}/> High</span> : <span className="text-xs text-brand-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
