import { useState } from 'react';
import NextImage from 'next/image';

interface ImageData {
  image_url: string;
  caption: string;
  score?: number;
}

// Helper to extract image ID from Google Drive URL
function extractImageId(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (match) return match[1];
  const alt = url.match(/id=([a-zA-Z0-9_-]{10,})/);
  if (alt) return alt[1];
  return url;
}

export default function ImageWithLoader({ img }: { img: ImageData }) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomed, setZoomed] = useState<boolean>(false);

  const backendImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/image/${extractImageId(img.image_url)}`;

  return (
    <div className="bg-white border rounded-xl p-2 shadow-sm">
      {/* Image container */}
      <div className="relative w-full h-[300px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
        {/* Loader animation */}
        {!loaded && (
          <div className="absolute w-full h-full bg-gray-200 animate-pulse" />
        )}
        {/* Interactive image */}
        <div
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomed ? 1.5 : 1})`,
            transition: 'transform 0.3s ease',
          }}
          className="max-h-full max-w-full object-contain cursor-zoom-in"
          onClick={() => setZoomed(!zoomed)} // Toggle zoom on click
        >
          <NextImage
            src={backendImageUrl}
            alt={img.caption}
            width={400}
            height={300}
            className="rounded"
            onLoad={() => setLoaded(true)} // Set loader to false when image loads
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Caption and Rotate button */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
        <span>{img.caption}</span>
        <button
          onClick={() => setRotation((prev) => (prev + 90) % 360)} // Rotate image
          className="text-blue-500 hover:underline"
        >
          ↻ Rotate
        </button>
      </div>

      {/* Image score */}
      {img.score !== undefined && (
        <p className="text-[10px] text-gray-400 italic">
          Score: {img.score.toFixed(2)}
        </p>
      )}
    </div>
  );
}