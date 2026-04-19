"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  photoBase64: string | null;
  onPhotoChange: (base64: string | null) => void;
};

export function UploadZone({ photoBase64, onPhotoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const readFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onPhotoChange(String(reader.result));
      reader.readAsDataURL(file);
    },
    [onPhotoChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  return (
    <label
      htmlFor="flyerforge-upload-input"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-6 text-center transition-colors hover:border-primary/50",
        dragOver && "border-primary bg-accent/30",
      )}
    >
      {photoBase64 ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoBase64}
            alt="Uploaded preview"
            className="max-h-[280px] max-w-full rounded-md object-contain"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPhotoChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImagePlus className="h-10 w-10" />
          <div className="text-sm">
            <span className="font-medium text-foreground">Click to upload</span>
            {" "}or drag and drop
          </div>
          <div className="text-xs">PNG, JPG, WEBP up to ~10MB</div>
        </div>
      )}
      <input
        id="flyerforge-upload-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
        }}
      />
    </label>
  );
}
