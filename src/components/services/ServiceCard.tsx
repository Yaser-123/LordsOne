import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import { Service } from '@/types/database';
import { CATEGORY_META, formatCurrency, cn } from '@/lib/utils/utils';

interface ServiceCardProps {
  service: Service;
  hrefPrefix?: string;
}

export function ServiceCard({
  service,
  hrefPrefix = '/services',
}: ServiceCardProps) {
  const meta = CATEGORY_META[service.category] || {
    label: service.category,
    badgeClass: 'bg-slate-100 text-slate-700',
  };

  const detailUrl = `${hrefPrefix}/${service.slug}`;

  return (
    <div className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-card hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            No image
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs',
              meta.badgeClass
            )}
          >
            {meta.label}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-navy-900/90 text-white backdrop-blur shadow-sm">
            {formatCurrency(Number(service.price))}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-navy-900 text-base line-clamp-1 group-hover:text-brand-600 transition-colors">
            {service.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Cap: {service.capacity}</span>
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
