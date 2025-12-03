import React, { useCallback, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '@ivrhotel/ui';
import { cn } from '@ivrhotel/ui';

interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    onUpload: (files: File[]) => Promise<void>;
    uploadedFiles?: string[];
    onDelete?: (url: string) => void;
    category?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    accept = 'image/*,.pdf',
    multiple = false,
    maxSize = 10,
    onUpload,
    uploadedFiles = [],
    onDelete,
    category
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            setError('');

            const files = Array.from(e.dataTransfer.files);
            await processFiles(files);
        },
        [maxSize, onUpload]
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await processFiles(files);
    };

    const processFiles = async (files: File[]) => {
        // Validate file sizes
        const oversized = files.filter(f => f.size > maxSize * 1024 * 1024);
        if (oversized.length > 0) {
            setError(`Some files exceed ${maxSize}MB limit`);
            return;
        }

        setUploading(true);
        try {
            await onUpload(files);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
                    uploading && 'opacity-50 pointer-events-none'
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`file-upload-${category}`}
                />
                <label
                    htmlFor={`file-upload-${category}`}
                    className="cursor-pointer"
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                        Drag & drop files here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Max size: {maxSize}MB
                    </p>
                </label>
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                </div>
            )}

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((url, idx) => (
                        <div key={idx} className="relative group">
                            {url.endsWith('.pdf') ? (
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileIcon className="h-12 w-12 text-gray-400" />
                                </div>
                            ) : (
                                <img
                                    src={url}
                                    alt={`Upload ${idx + 1}`}
                                    className="aspect-square object-cover rounded-lg"
                                />
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(url)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {uploading && (
                <div className="text-center text-sm text-gray-600">
                    Uploading...
                </div>
            )}
        </div>
    );
};

export default FileUpload;
