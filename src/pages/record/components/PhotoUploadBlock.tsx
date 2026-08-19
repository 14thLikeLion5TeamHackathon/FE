import { useEffect, useMemo, type ChangeEvent } from 'react';

interface PhotoUploadBlockProps {
  photos: File[];
  onSelectPhoto: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

/**
 * 미리보기 한 장.
 *
 * `URL.createObjectURL`을 렌더 안에서 부르면 렌더할 때마다 새 URL이 생기고 아무도 해제하지
 * 않는다 — 사진 여러 장을 든 채로 화면이 다시 그려지면 그만큼 메모리에 쌓인다.
 * 저사양 안드로이드에서 특히 문제가 된다. 파일당 한 번만 만들고 언마운트 때 해제한다.
 */
function PhotoPreview({ file, index }: { file: File; index: number }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  // 해제만 담당한다 — 만드는 건 useMemo 쪽이라 여기서 상태를 건드릴 일이 없다
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return <img src={url} alt={`선택 사진 ${index + 1}`} className="h-full w-full object-cover" />;
}

export default function PhotoUploadBlock({
  photos,
  onSelectPhoto,
  onRemovePhoto,
}: PhotoUploadBlockProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {/*
        촬영은 `accept`를 좁히지 않는다 — 안드로이드에서 카메라가 아예 안 열리던 원인이다.
        기기·설정마다 카메라가 내놓는 MIME이 다르고(갤럭시는 '고효율 이미지'를 켜면 HEIF),
        목록에 없는 형식이면 브라우저가 카메라 앱 자체를 후보에서 빼버린다.
        받아줄 형식인지는 파일을 받은 뒤 RecordCreatePage에서 판단한다.
      */}
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
        accept="image/jpeg,image/png,image/webp"
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
              <PhotoPreview file={file} index={idx} />
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
