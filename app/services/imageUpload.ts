import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase"; // Ensure Firebase is initialized in your project

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * @param file - The file to upload
 * @param folder - The folder in Firebase Storage where the file will be stored (default: "uploads")
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string = "uploads"): Promise<string> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  try {
    // Create a unique file path using the file name and a timestamp
    const filePath = `${folder}/${file.name}-${Date.now()}`;
    const fileRef = ref(storage, filePath);

    // Upload the file to Firebase Storage
    const uploadResult = await uploadBytes(fileRef, file);

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image.");
  }
}
