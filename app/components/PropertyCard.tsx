import Link from 'next/link';
import { BedDouble, Square, Phone, TrendingUp } from 'lucide-react';
import { Property, formatPrice, TYPE_COLORS, STATUS_LIGHT } from './data';

interface PropertyCardProps {
  property: Property;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function PropertyCard({ property, selected, onClick, index }: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-200 group animate-fadein bg-white ${
        selected
          ? 'border-brand-orange shadow-md ring-1 ring-brand-orange/20'
          : 'border-brand-border hover:border-brand-navy/30 hover:shadow-md'
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          <span
            className="text-[10px] font-body font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: STATUS_LIGHT[property.status] ?? '#64748b' }}
          >
            {property.status}
          </span>
          {property.highAppreciation && (
            <span className="text-[10px] font-body bg-brand-orange text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={8} />
            </span>
          )}
        </div>
        <span
          className="absolute top-1.5 right-1.5 text-[10px] font-body font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: TYPE_COLORS[property.type] }}
        >
          {property.type}
        </span>
      </div>

      <div className="p-2.5">
        <h3 className="font-body text-xs font-bold text-brand-navy leading-tight mb-0.5 group-hover:text-brand-orange transition-colors">
          {property.name}
        </h3>
        <p className="text-[10px] text-brand-muted font-body mb-1.5">{property.builder}</p>
        <div className="text-xs font-mono font-bold text-brand-orange mb-1.5">
          {formatPrice(property.priceFrom)} – {formatPrice(property.priceTo)}
        </div>
        {property.bedrooms && (
          <div className="flex items-center gap-1 text-[10px] text-brand-muted font-body mb-2">
            <BedDouble size={9} /> {property.bedrooms}&nbsp;·&nbsp;<Square size={9} /> {property.area}
          </div>
        )}
        <div className="flex gap-1">
          <a
            href={`tel:${property.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-orange text-white text-[10px] font-body font-semibold hover:bg-orange-600 transition-colors"
          >
            <Phone size={9} /> Call
          </a>
          <Link
            href={`/property/${property.id}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-brand-navy text-brand-navy text-[10px] font-body font-semibold hover:bg-brand-navy hover:text-white transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>

      {selected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-orange" />}
    </div>
  );
}
