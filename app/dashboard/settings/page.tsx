"use client"; // Ensure this file is a Client Component in Next.js 13+

import React, { useState, FormEvent } from "react";

export default function UploadImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("No file selected!");
      return;
    }

    try {
      // 1) Build FormData
      const formData = new FormData();
      formData.append("image", selectedFile);

      // 2) Send to your Next.js API route
      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed:", res.status, res.statusText);
        return;
      }

      // 3) Get the JSON response
      const data = await res.json();
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (error) {
      console.error("An error occurred while uploading:", error);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Upload Image</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit">Upload</button>
      </form>

      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <p>Upload Successful!</p>
          <p>Image URL:</p>
          <a href={imageUrl} target="_blank" rel="noreferrer">
            {imageUrl}
          </a>
        </div>
      )}
    </div>
  );
}
