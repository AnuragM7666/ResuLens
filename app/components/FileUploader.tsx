import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;

    return (
        <div
            className={`w-full border-2 border-dashed rounded-xl p-6 transition-all duration-200 
                ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-gray-100'}
            `}
            {...getRootProps()}
        >
            <input {...getInputProps()} />

            {/* If file is selected */}
            {file ? (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <img src="/images/pdf.png" alt="pdf" className="size-10" />
                        <div>
                            <p className="font-semibold text-gray-800 truncate max-w-xs">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-red-100 rounded-full transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            onFileSelect?.(null);
                        }}
                    >
                        <img src="/icons/cross.svg" alt="remove" className="size-5" />
                    </button>
                </div>
            ) : (
                // If no file is selected
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mb-3">
                        <img src="/icons/info.svg" alt="upload" className="size-10" />
                    </div>
                    <p className="text-gray-700 text-lg">
                        <span className="font-semibold text-blue-500">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        PDF only (Max {formatSize(maxFileSize)})
                    </p>
                </div>
            )}
        </div>
    );
}

export default FileUploader;
