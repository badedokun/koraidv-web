/**
 * Convert a Blob to a base64-encoded string (no data URL prefix).
 *
 * Used by the back-side document upload path to build the JSON request
 * body that matches the server's `imageBase64` contract (and the
 * Android/iOS SDK wire formats).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('FileReader returned non-string result'));
        return;
      }
      // Strip the "data:<mime>;base64," prefix.
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
