import { X, Phone, Mail, ArrowRight, BedDouble, Square, Calendar, TrendingUp } from 'lucide-react';
import { Property, TYPE_COLORS, STATUS_LIGHT, formatPrice } from './data';

export default function MapPreviewCard({ property, onClose, onOpenDetails }: {
  property: Property; onClose: ()=>void; onOpenDetails: ()=>void;
}) {
  return (
    <div className="w-72 bg-white rounded-2xl overflow-hidden card-shadow-lg animate-fadein border border-brand-border">
      <div className="relative h-40 overflow-hidden">
        <img src={property.image} alt={property.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
        <button onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-brand-muted hover:text-brand-text shadow transition-colors">
          <X size={12}/>
        </button>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-body font-semibold text-white"
            style={{ backgroundColor: STATUS_LIGHT[property.status] || '#64748b' }}>
            {property.status}
          </span>
          {property.highAppreciation && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-body bg-brand-orange text-white flex items-center gap-1">
              <TrendingUp size={9}/>
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-body text-white font-semibold"
            style={{ backgroundColor: TYPE_COLORS[property.type] }}>
            {property.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-body text-sm font-bold text-brand-navy leading-tight mb-0.5">{property.name}</h3>
        <p className="text-xs text-brand-muted font-body mb-3">{property.builder} · {property.address}</p>

        <div className="text-base font-mono font-bold text-brand-orange mb-3">
          {formatPrice(property.priceFrom)} – {formatPrice(property.priceTo)}
        </div>

        <div className="flex items-center gap-3 text-xs text-brand-muted font-body mb-3">
          {property.bedrooms && <span className="flex items-center gap-1"><BedDouble size={11}/> {property.bedrooms}</span>}
          <span className="flex items-center gap-1"><Square size={11}/> {property.area}</span>
          <span className="flex items-center gap-1"><Calendar size={11}/> {property.possession}</span>
        </div>

        <p className="text-xs text-brand-muted font-body leading-relaxed mb-4 line-clamp-2">{property.description}</p>

        <div className="flex gap-2 mb-2">
          <a href={`tel:${property.phone}`} onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-orange text-white text-xs font-body font-medium hover:bg-orange-600 transition-colors">
            <Phone size={12}/> Call
          </a>
          <a href={`mailto:${property.email}`} onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-brand-border text-brand-muted text-xs font-body hover:bg-brand-hover hover:text-brand-text transition-colors">
            <Mail size={12}/> Enquire
          </a>
        </div>
        <button onClick={onOpenDetails}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-navy text-white text-xs font-body font-medium hover:bg-brand-navy2 transition-colors group">
          View Full Details <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform"/>
        </button>
      </div>
    </div>
  );
}
