import { useState } from 'react';

interface ImageData {
  image_url: string;
  caption: string;
  score?: number;
}

export default function ImageWithLoader({ img }: { img: ImageData }) {
  const [loaded, setLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="bg-white border rounded-xl p-2 shadow-sm">
      <div className="relative w-full h-[300px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
        {!loaded && <div className="absolute w-full h-full bg-gray-200 animate-pulse" />}
        <img
          src={img.image_url}
          alt={img.caption}
          onLoad={() => setLoaded(true)}
          onClick={() => setZoomed(!zoomed)}
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomed ? 1.5 : 1})`,
            transition: "transform 0.3s ease",
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
          }}
          className="cursor-zoom-in"
        />
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

      <p className="text-[10px] text-gray-400 italic">Score: {img.score?.toFixed(2)}</p>
    </div>
  );
}
