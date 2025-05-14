import { useState } from 'react';
import NextImage from 'next/image';

interface ImageData {
  image_url: string;
  caption: string;
  score?: number;
}

// Helper to extract Google Drive ID (optional, safe fallback)
function extractImageId(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (match) return match[1];
  const alt = url.match(/id=([a-zA-Z0-9_-]{10,})/);
  if (alt) return alt[1];
  return url;
}

export default function ImageWithLoader({ img }: { img: ImageData }) {
  const [loaded, setLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const backendImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/image/${extractImageId(img.image_url)}`;

  return (
    <div className="bg-white border rounded-xl p-2 shadow-sm">
      <div className="relative w-full h-[300px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
        {!loaded && <div className="absolute w-full h-full bg-gray-200 animate-pulse" />}
        <div
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomed ? 1.5 : 1})`,
            transition: 'transform 0.3s ease',
          }}
          className="max-h-full max-w-full object-contain cursor-zoom-in"
          onClick={() => setZoomed(!zoomed)}
        >
          <NextImage
            src={backendImageUrl}
            alt={img.caption}
            width={400}
            height={300}
            className="rounded"
            onLoad={() => setLoaded(true)}
            style={{ objectFit: 'contain' }}
            unoptimized // ✅ prevent Next.js from trying to proxy/optimize
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
        <span>{img.caption}</span>
        <button
          onClick={() => setRotation((prev) => (prev + 90) % 360)}
          className="text-blue-500 hover:underline"
        >
          ↻ Rotate
        </button>
      </div>

      {img.score !== undefined && (
        <p className="text-[10px] text-gray-400 italic">
          Score: {img.score.toFixed(2)}
        </p>
      )}
    </div>
  );
}
