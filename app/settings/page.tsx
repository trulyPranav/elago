'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Bell, Shield, Palette, Globe, ChevronRight, Save, Edit2 } from 'lucide-react';
import ElagoLogo from '../components/ElagoLogo';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'profile'|'notifications'|'security'|'preferences'>('profile');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'' });
  const [notifs, setNotifs] = useState({ newListings: true, priceDrops: true, openHouses: false, newsletter: false });

  useEffect(() => {
    const u = localStorage.getItem('elago_user');
    if (!u) { router.replace('/login'); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({ name: parsed.name||'', email: parsed.email||'', phone: parsed.phone||'', role: parsed.role||'Sales Agent' });
  }, []);

  const saveProfile = () => {
    const updated = { ...user, ...form };
    localStorage.setItem('elago_user', JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-light" style={{ overflowY:'auto', height:'100vh' }}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-brand-border card-shadow">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-body"><ArrowLeft size={15}/> Back</button>
          <div className="h-4 w-px bg-brand-border"/>
          <ElagoLogo size="sm"/>
        </div>
        <h1 className="font-body text-sm font-bold text-brand-navy uppercase tracking-wider">Settings</h1>
        <div className="w-32"/>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-brand-border card-shadow overflow-hidden">
              {[
                { key:'profile', label:'Profile', icon:User },
                { key:'notifications', label:'Notifications', icon:Bell },
                { key:'security', label:'Security', icon:Shield },
                { key:'preferences', label:'Preferences', icon:Palette },
              ].map(({ key, label, icon:Icon }) => (
                <button key={key} onClick={() => setTab(key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors border-b border-brand-border/50 last:border-0 text-left ${tab===key ? 'bg-brand-navy text-white font-semibold' : 'text-brand-muted hover:bg-brand-hover hover:text-brand-text'}`}>
                  <Icon size={15}/> {label}
                  {tab!==key && <ChevronRight size={12} className="ml-auto opacity-40"/>}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {tab === 'profile' && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-brand-border">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-orange flex items-center justify-center text-white text-xl font-bold font-body shadow-lg">
                    {(form.name||'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-body text-lg font-bold text-brand-navy">{form.name || 'Your Name'}</h2>
                    <p className="text-brand-muted text-sm font-body">{form.role}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[['Full Name','name','text','Your full name'],['Email','email','email','your@email.com'],['Phone','phone','tel','+91 XXXXX XXXXX']].map(([label,key,type,placeholder]) => (
                    <div key={key}>
                      <label className="text-xs font-body font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">{label}</label>
                      <input type={type} value={(form as any)[key]} placeholder={placeholder} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                        className="w-full bg-brand-light border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text font-body focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-body font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">Role</label>
                    <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
                      className="w-full bg-brand-light border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text font-body focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all">
                      {['Sales Agent','Admin','BD Manager','Buyer'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={saveProfile}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-body text-sm font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-brand-navy text-white hover:bg-brand-navy2'}`}>
                    <Save size={14}/> {saved ? 'Saved ✓' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-6">
                <h3 className="font-body text-base font-bold text-brand-navy mb-5">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key:'newListings', label:'New Listings', desc:'Get notified when new properties are added' },
                    { key:'priceDrops', label:'Price Drops', desc:'Alert when a saved property price decreases' },
                    { key:'openHouses', label:'Open House Events', desc:'Notifications for upcoming open house events' },
                    { key:'newsletter', label:'Weekly Newsletter', desc:'Weekly digest of top properties and insights' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-brand-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-body font-semibold text-brand-text">{label}</p>
                        <p className="text-xs text-brand-muted font-body">{desc}</p>
                      </div>
                      <button onClick={() => setNotifs(n => ({...n, [key]: !(n as any)[key]}))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${(notifs as any)[key] ? 'bg-brand-orange' : 'bg-brand-border'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${(notifs as any)[key] ? 'left-5' : 'left-0.5'}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-6 space-y-4">
                <h3 className="font-body text-base font-bold text-brand-navy mb-5">Account Security</h3>
                {['Current Password','New Password','Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-xs font-body font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full bg-brand-light border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text font-body focus:outline-none focus:border-brand-orange/60 focus:bg-white transition-all" />
                  </div>
                ))}
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy text-white font-body text-sm font-semibold hover:bg-brand-navy2 transition-colors">
                  <Shield size={14}/> Update Password
                </button>
              </div>
            )}

            {tab === 'preferences' && (
              <div className="bg-white rounded-2xl border border-brand-border card-shadow p-6 space-y-5">
                <h3 className="font-body text-base font-bold text-brand-navy mb-2">App Preferences</h3>
                {[
                  { label:'Default Map View', options:['Bangalore','Mumbai','Pune','Hyderabad'] },
                  { label:'Currency Display', options:['INR (₹)','USD ($)'] },
                  { label:'Area Unit', options:['sqft','sqm'] },
                ].map(({ label, options }) => (
                  <div key={label}>
                    <label className="text-xs font-body font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">{label}</label>
                    <select className="w-full bg-brand-light border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text font-body focus:outline-none focus:border-brand-orange/60 transition-all">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy text-white font-body text-sm font-semibold hover:bg-brand-navy2 transition-colors">
                  <Save size={14}/> Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
