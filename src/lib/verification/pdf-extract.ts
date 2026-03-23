/**
 * PDF metadata embedding and extraction.
 *
 * During generation: embed the Base58 payload as custom metadata in the PDF.
 * During verification: extract the payload from an uploaded PDF.
 *
 * Uses pdf-lib which can read/write PDF metadata without server-side rendering.
 */

import { PDFDocument } from "pdf-lib";

const METADATA_KEY = "fundslipPayload";

/**
 * Embed the verification payload into a PDF's custom metadata.
 * Takes the raw PDF bytes, embeds the payload, returns new PDF bytes.
 */
export async function embedPayloadInPdf(
  pdfBytes: Uint8Array,
  payload: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Set custom metadata field
  pdfDoc.setTitle(pdfDoc.getTitle() || "Fundslip Statement");
  pdfDoc.setProducer("Fundslip");

  // pdf-lib doesn't have setCustomMetadata — use the Info dict directly
  const infoDict = pdfDoc.context.trailerInfo.Info;
  if (infoDict) {
    const infoRef = pdfDoc.context.lookup(infoDict);
    if (infoRef && "set" in infoRef) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (infoRef as any).set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (PDFDocument as any).PDFName?.of?.(METADATA_KEY) ??
          pdfDoc.context.obj(METADATA_KEY),
        pdfDoc.context.obj(payload)
      );
    }
  }

  // Fallback: also embed as Subject field (universally readable)
  pdfDoc.setSubject(`fundslip:${payload}`);

  return pdfDoc.save();
}

/**
 * Extract the verification payload from an uploaded PDF.
 * Tries multiple extraction methods in order of reliability.
 */
export async function extractPayloadFromPdf(pdfBytes: Uint8Array): Promise<string | null> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Method 1: Check Subject field (our primary embedding method)
    const subject = pdfDoc.getSubject();
    if (subject && subject.startsWith("fundslip:")) {
      return subject.slice("fundslip:".length);
    }

    // Method 2: Search the raw PDF text for a Base58-like payload
    // Base58 chars are [123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]
    const textDecoder = new TextDecoder("latin1");
    const rawText = textDecoder.decode(pdfBytes);

    // Look for "fundslip:" prefix in raw text
    const prefixIdx = rawText.indexOf("fundslip:");
    if (prefixIdx !== -1) {
      const afterPrefix = rawText.slice(prefixIdx + 9);
      const match = afterPrefix.match(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/);
      if (match && match[0].length >= 150 && match[0].length <= 200) {
        // Validate it decodes to exactly PAYLOAD_SIZE bytes
        try {
          const bs58 = (await import("bs58")).default;
          const decoded = bs58.decode(match[0]);
          if (decoded.length === 123) return match[0];
        } catch { /* not valid Base58 */ }
      }
    }

    return null;
  } catch {
    return null;
  }
}
