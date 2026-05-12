interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "raw" | "auto"; // raw = PDF
  onProgress?: (percent: number) => void;
}

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = "cee/general", resourceType = "auto", onProgress } = options;

  // 1. Get signature from your server (lightweight GET, no file involved)
  const signRes = await fetch(
    `/api/upload/sign?folder=${encodeURIComponent(folder)}`
  );
  if (!signRes.ok) throw new Error("Failed to get upload signature");

  const { signature, timestamp, cloudName, apiKey } = await signRes.json();

  // 2. Build multipart form for Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("api_key", apiKey);

  // 3. Upload directly from browser to Cloudinary — never touches your server
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Use XHR if progress tracking is needed
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
          });
        } else {
          reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  }

  // Simple fetch when no progress tracking needed
  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}