import type { ChangeEvent } from 'react';

interface PhotoUploadBlockProps {
  photos: File[];
  onSelectPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

export default function PhotoUploadBlock({
  photos,
  onSelectPhoto,
  onRemovePhoto,
}: PhotoUploadBlockProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <input
        id="camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onSelectPhoto}
      />
      <input
        id="album-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onSelectPhoto}
      />

      <div className="flex w-full items-start gap-2">
        <label
          htmlFor="camera-input"
          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-subtle bg-surface-raised py-7 transition-colors hover:bg-surface-elevated"
        >
          <span className="typo-label text-center text-text-secondary">촬영</span>
        </label>

        <label
          htmlFor="album-input"
          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-subtle bg-surface-raised py-7 transition-colors hover:bg-surface-elevated"
        >
          <span className="typo-label text-center text-text-secondary">앨범에서 선택</span>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="mt-1 grid grid-cols-3 gap-2">
          {photos.map((file, idx) => (
            <div
              key={idx}
              className="relative h-20 w-full overflow-hidden rounded-md bg-surface-raised"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`선택 사진 ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(idx)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-overlay text-text-primary-on typo-caption"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}