import { config } from "../config";

export class StorageService {
  async uploadScreenshot(domain: string, timestamp: string, imageBuffer?: Buffer): Promise<string> {
    const cloudName = config.CLOUDINARY_CLOUD_NAME;
    const apiKey = config.CLOUDINARY_API_KEY;
    const apiSecret = config.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary configuration missing. Returning fallback screenshot URL.");
      // Return a nice fallback screenshot from dynamic screenshot generator/placeholder
      return `https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop`;
    }

    try {
      // Create Base64 data URI if buffer is present
      const base64Data = imageBuffer
        ? `data:image/png;base64,${imageBuffer.toString("base64")}`
        : `https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop`;

      const formData = new FormData();
      formData.append("file", base64Data);
      formData.append("upload_preset", "chronos_ai_presets");
      formData.append("public_id", `snapshot_${domain}_${timestamp}`);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed, using fallback URL:", err);
      return `https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop`;
    }
  }
}

export const storageService = new StorageService();
