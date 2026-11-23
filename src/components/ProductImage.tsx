import React, { useState } from 'react';
import { ImagePlus, Package } from 'lucide-react';

export const MANUAL_UPLOAD_FLAG = 'MANUAL_UPLOAD_REQUIRED';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (src === MANUAL_UPLOAD_FLAG) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 border border-dashed border-slate-300 text-slate-500 p-3 text-center ${className}`}
      >
        <ImagePlus className="w-6 h-6 mb-1.5 text-[#0B2D71]/60" />
        <span className="text-[11px] font-semibold text-slate-700 leading-tight">
          Photo Pending Upload
        </span>
        <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{alt}</span>
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-3 text-center ${className}`}
      >
        <Package className="w-6 h-6 mb-1.5 text-[#0B2D71]/40" />
        <span className="text-[11px] font-medium text-slate-500 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
