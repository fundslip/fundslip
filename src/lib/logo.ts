// Pre-rendered logo as a base64 PNG data URL for PDF embedding.
// Uses a promise cache to prevent race conditions on concurrent calls.

let cachedPromise: Promise<string> | null = null;

export function getLogoDataUrl(): Promise<string> {
  if (cachedPromise) return cachedPromise;

  if (typeof document === "undefined") return Promise.resolve("");

  cachedPromise = new Promise<string>((resolve) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 58" fill="none">
      <rect x="6" y="0" width="42" height="50" rx="6" fill="#003499" opacity="0.15"/>
      <rect x="0" y="8" width="42" height="50" rx="6" fill="#003499"/>
      <rect x="8" y="18" width="24" height="2" rx="1" fill="#ffffff" opacity="0.8"/>
      <rect x="8" y="24" width="16" height="1.5" rx="0.75" fill="#ffffff" opacity="0.3"/>
      <rect x="8" y="29" width="20" height="1.5" rx="0.75" fill="#ffffff" opacity="0.3"/>
      <line x1="8" y1="38" x2="22" y2="38" stroke="#85f8c4" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="8" y1="43" x2="16" y2="43" stroke="#85f8c4" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>
      <circle cx="33" cy="48" r="7.5" fill="#85f8c4"/>
      <path d="M29.5,48 L31.8,50.3 L36.5,45.5" stroke="#003499" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 116;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 96, 116);
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
