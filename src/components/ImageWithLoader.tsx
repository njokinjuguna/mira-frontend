import { useState } from 'react';
import NextImage from 'next/image';

interface ImageData {
  image_url: string;
  caption: string;
  score?: number;
}

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
    <div className="bg-white border rounded-xl p-2 shadow-sm w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
        {!loaded && <div className="absolute w-full h-full bg-gray-200 animate-pulse" />}
        <div
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomed ? 1.5 : 1})`,
            transition: 'transform 0.3s ease',
          }}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setZoomed(!zoomed)}
        >
          <NextImage
            src={backendImageUrl}
            alt={img.caption}
            width={400}
            height={300}
            onLoad={() => setLoaded(true)}
            className="rounded w-full h-full object-contain"
            style={{ objectFit: 'contain' }}
            unoptimized
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
        <span className="truncate max-w-[80%]">{img.caption}</span>
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
