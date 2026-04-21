"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  logoBase64: string | null;
  onLogoChange: (base64: string | null) => void;
};

export function LogoUpload({ logoBase64, onLogoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="flyerforge-logo-input"
        className={cn(
          "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-card/50 transition-colors hover:border-primary/50",
        )}
      >
        {logoBase64 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoBase64}
              alt="Logo"
              className="h-full w-full object-contain p-1"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onLogoChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-background"
              aria-label="Remove logo"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
        <input
          id="flyerforge-logo-input"
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
      <div className="flex flex-col">
        <div className="text-sm font-medium">
          {logoBase64 ? "Logo added" : "Add a logo (optional)"}
        </div>
        <div className="text-xs text-muted-foreground">
          PNG with transparency works best.
        </div>
      </div>
    </div>
  );
}
