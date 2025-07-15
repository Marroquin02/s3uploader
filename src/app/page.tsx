"use client";

import S3Uploader from "./components/S3Uploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            S3 File Uploader
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sube archivos a Amazon S3 de forma segura y sencilla
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <S3Uploader />
        </div>
      </div>
    </div>
  );
}
