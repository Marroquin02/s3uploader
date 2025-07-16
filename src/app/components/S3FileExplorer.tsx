"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBasePath } from "../hooks/useBasePath";
import {
  S3Item,
  S3Config,
  FileExplorerState,
  UploadProgress,
} from "../../types/s3-explorer";

interface S3FileExplorerProps {
  s3Config: S3Config;
  isConfigValid: boolean;
}

export default function S3FileExplorer({
  s3Config,
  isConfigValid,
}: S3FileExplorerProps) {
  const { buildApiPath, isLoaded } = useBasePath();

  const memoizedS3Config = useMemo(
    () => s3Config,
    [
      s3Config.endpoint,
      s3Config.accessKeyId,
      s3Config.secretAccessKey,
      s3Config.bucket,
      s3Config.region,
    ]
  );

  const [state, setState] = useState<FileExplorerState>({
    items: [],
    currentPath: "",
    loading: false,
    error: null,
    selectedItems: new Set(),
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const loadFiles = useCallback(
    async (path: string = "") => {
      if (!isConfigValid || !isLoaded) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(buildApiPath("/api/s3/list"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...memoizedS3Config, prefix: path }),
        });

        const result = await response.json();

        if (result.success) {
          setState((prev) => ({
            ...prev,
            items: result.items,
            currentPath: result.currentPath,
            loading: false,
            selectedItems: new Set(),
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error,
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Error al cargar archivos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
          loading: false,
        }));
      }
    },
    [memoizedS3Config, isConfigValid, buildApiPath, isLoaded]
  );

  useEffect(() => {
    setHasLoadedInitially(false);
    setState({
      items: [],
      currentPath: "",
      loading: false,
      error: null,
      selectedItems: new Set(),
    });
  }, [
    memoizedS3Config.endpoint,
    memoizedS3Config.accessKeyId,
    memoizedS3Config.secretAccessKey,
    memoizedS3Config.bucket,
  ]);

  useEffect(() => {
    const loadInitialFiles = async () => {
      if (
        !isConfigValid ||
        !isLoaded ||
        !memoizedS3Config.endpoint ||
        !memoizedS3Config.accessKeyId ||
        !memoizedS3Config.secretAccessKey ||
        !memoizedS3Config.bucket ||
        hasLoadedInitially
      ) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(buildApiPath("/api/s3/list"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...memoizedS3Config, prefix: "" }),
        });

        const result = await response.json();

        if (result.success) {
          setState((prev) => ({
            ...prev,
            items: result.items,
            currentPath: result.currentPath,
            loading: false,
            selectedItems: new Set(),
          }));
          setHasLoadedInitially(true);
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error,
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Error al cargar archivos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
          loading: false,
        }));
      }
    };

    loadInitialFiles();
  }, [
    s3Config,
    isConfigValid,
    isLoaded,
    memoizedS3Config.endpoint,
    memoizedS3Config.accessKeyId,
    memoizedS3Config.secretAccessKey,
    memoizedS3Config.bucket,
    memoizedS3Config.region,
    hasLoadedInitially,
    buildApiPath,
  ]);

  const navigateToFolder = (folderPath: string) => {
    loadFiles(folderPath);
  };

  const navigateBack = () => {
    const pathParts = state.currentPath.split("/").filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length > 0 ? pathParts.join("/") + "/" : "";
    loadFiles(parentPath);
  };

  const deleteFile = async (item: S3Item) => {
    if (!isLoaded) {
      console.log("BasePath not loaded yet, cannot delete file");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`))
      return;

    try {
      const response = await fetch(buildApiPath("/api/s3/delete"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memoizedS3Config, key: item.fullPath }),
      });

      const result = await response.json();

      if (result.success) {
        loadFiles(state.currentPath);
      } else {
        setState((prev) => ({ ...prev, error: result.error }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Error al eliminar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      }));
    }
  };

  const createFolder = async () => {
    if (!isLoaded) {
      console.log("BasePath not loaded yet, cannot create folder");
      return;
    }

    if (!newFolderName.trim()) return;

    const folderPath = state.currentPath + newFolderName;

    try {
      const response = await fetch(buildApiPath("/api/s3/create-folder"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memoizedS3Config, folderPath }),
      });

      const result = await response.json();

      if (result.success) {
        setNewFolderName("");
        setShowCreateFolder(false);
        loadFiles(state.currentPath);
      } else {
        setState((prev) => ({ ...prev, error: result.error }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Error al crear carpeta: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      }));
    }
  };

  const uploadFiles = async (files: FileList) => {
    if (!isLoaded) {
      console.log("BasePath not loaded yet, cannot upload files");
      return;
    }

    const fileArray = Array.from(files);

    const initialProgress: UploadProgress[] = fileArray.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: "uploading",
    }));

    setUploadProgress(initialProgress);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      try {
        const formData = new FormData();
        formData.append("endpoint", memoizedS3Config.endpoint);
        formData.append("region", memoizedS3Config.region);
        formData.append("accessKeyId", memoizedS3Config.accessKeyId);
        formData.append("secretAccessKey", memoizedS3Config.secretAccessKey);
        formData.append("bucket", memoizedS3Config.bucket);
        formData.append("folderName", state.currentPath);
        formData.append("fileName", file.name);
        formData.append("file", file);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev.map((item, index) =>
              index === i && item.progress < 90
                ? { ...item, progress: item.progress + 10 }
                : item
            )
          );
        }, 200);

        const response = await fetch(buildApiPath("/api/s3/upload"), {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        clearInterval(progressInterval);

        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  progress: 100,
                  status: result.success ? "completed" : "error",
                  error: result.success ? undefined : result.error,
                }
              : item
          )
        );
      } catch (error) {
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  progress: 100,
                  status: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : "Error desconocido",
                }
              : item
          )
        );
      }
    }

    setTimeout(() => {
      loadFiles(state.currentPath);
      setUploadProgress([]);
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    e.target.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-ES");
  };

  if (!isConfigValid) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>
            Configura y valida la conexión S3 para usar el explorador de
            archivos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Explorador de Archivos S3
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            📁 Nueva Carpeta
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
            📤 Subir Archivos
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <button
            onClick={() => loadFiles(state.currentPath)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <button
          onClick={() => loadFiles("")}
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          🏠 Inicio
        </button>
        {state.currentPath && (
          <>
            <span>/</span>
            {state.currentPath
              .split("/")
              .filter(Boolean)
              .map((part, index, array) => (
                <span key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const pathToIndex =
                        array.slice(0, index + 1).join("/") + "/";
                      loadFiles(pathToIndex);
                    }}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {part}
                  </button>
                  {index < array.length - 1 && <span>/</span>}
                </span>
              ))}
          </>
        )}
        {state.currentPath && (
          <button
            onClick={navigateBack}
            className="ml-4 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Atrás
          </button>
        )}
      </div>

      {/* Área de drag and drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">
            📁 Arrastra archivos aquí para subirlos
          </p>
          <p className="text-sm">o usa el botón &quot;Subir Archivos&quot;</p>
        </div>
      </div>

      {/* Progreso de subida */}
      {uploadProgress.length > 0 && (
        <div className="mb-4 space-y-2">
          <h3 className="font-medium text-gray-800 dark:text-white">
            Subiendo archivos:
          </h3>
          {uploadProgress.map((upload, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{upload.fileName}</span>
                <span className="text-sm">
                  {upload.status === "completed" && "✅"}
                  {upload.status === "error" && "❌"}
                  {upload.status === "uploading" && `${upload.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    upload.status === "completed"
                      ? "bg-green-500"
                      : upload.status === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              {upload.error && (
                <p className="text-red-500 text-xs mt-1">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal crear carpeta */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Carpeta</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              onKeyPress={(e) => e.key === "Enter" && createFolder()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
          <p className="text-red-700 dark:text-red-400">{state.error}</p>
        </div>
      )}

      {/* Loading */}
      {state.loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      )}

      {/* Lista de archivos */}
      {!state.loading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Tamaño
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Modificado
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {state.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No hay archivos en esta carpeta
                  </td>
                </tr>
              ) : (
                state.items.map((item) => (
                  <tr
                    key={item.fullPath}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {item.type === "folder" ? "📁" : "📄"}
                        </span>
                        {item.type === "folder" ? (
                          <button
                            onClick={() => navigateToFolder(item.fullPath)}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {item.name}
                          </button>
                        ) : (
                          <span className="text-gray-800 dark:text-gray-200">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {item.type === "folder" ? "-" : formatFileSize(item.size)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(item.lastModified)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteFile(item)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
