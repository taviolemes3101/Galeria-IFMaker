import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadProjectFile(
  projectId: string,
  file: File,
  isImage: boolean,
  onProgress?: (progress: number) => void
): Promise<string> {
  const folder = isImage ? 'images' : 'files';
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `projects/${projectId}/${folder}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.warn('Firebase Storage upload failed, falling back to Data URL:', error);
          // Fallback to Data URL if storage fails or rules deny
          readFileAsDataURL(file).then(resolve).catch(reject);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            console.warn('Failed to get download URL, falling back to Data URL:', err);
            const dataUrl = await readFileAsDataURL(file);
            resolve(dataUrl);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Storage upload exception, converting to Data URL:', err);
    return await readFileAsDataURL(file);
  }
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
