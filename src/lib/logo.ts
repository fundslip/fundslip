// Pre-rendered logo as a base64 PNG data URL for PDF embedding.
// Uses a promise cache to prevent race conditions on concurrent calls.

let cachedPromise: Promise<string> | null = null;

export function getLogoDataUrl(): Promise<string> {
  if (cachedPromise) return cachedPromise;

  if (typeof document === "undefined") return Promise.resolve("");

  cachedPromise = new Promise<string>((resolve) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 62" fill="none">
      <rect x="6" y="0" width="46" height="56" rx="5" fill="#0048cc" opacity="0.35"/>
      <rect x="0" y="6" width="46" height="56" rx="5" fill="#003499"/>
      <rect x="9" y="16" width="28" height="2.2" rx="1.1" fill="#ffffff" opacity="0.85"/>
      <rect x="9" y="22.5" width="19" height="2.2" rx="1.1" fill="#ffffff" opacity="0.4"/>
      <rect x="9" y="29" width="23" height="2.2" rx="1.1" fill="#ffffff" opacity="0.4"/>
      <line x1="9" y1="40" x2="27" y2="40" stroke="#85f8c4" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="9" y1="45" x2="20" y2="45" stroke="#85f8c4" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
      <circle cx="36" cy="49" r="7" fill="#85f8c4"/>
      <path d="M32.5,49 L34.8,51.3 L39.5,46.5" stroke="#003499" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 104;
      canvas.height = 124;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 104, 124);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve("");
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      cachedPromise = null; // Allow retry on failure
      resolve("");
    };

    img.src = url;
  });

  return cachedPromise;
}
