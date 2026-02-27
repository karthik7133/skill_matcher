import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

interface ResumeUploadProps {
    onUploadSuccess: (data: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setIsUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await apiClient.post('/students/upload-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(true);
            onUploadSuccess(response.data);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err?.response?.data?.message || 'Failed to upload and parse resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: false,
        disabled: isUploading,
    });

    return (
        <div className="resume-upload-container" style={{ marginBottom: '2rem' }}>
            <div
                {...getRootProps()}
                style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '1rem',
                    padding: '2.5rem',
                    textAlign: 'center',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    backgroundColor: isDragActive ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--card-bg)',
                    transition: 'all 0.2s ease',
                    borderColor: isDragActive ? 'var(--primary)' : 'var(--border)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <input {...getInputProps()} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {isUploading ? (
                        <>
                            <Loader2 className="spinner" size={40} color="var(--primary)" />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Analyzing Resume...</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>We're extracting your skills and experience.</p>
                            </div>
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle size={40} color="var(--success)" />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '0.25rem' }}>Successfully Parsed!</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Review the pre-filled fields below.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <Upload size={32} color="var(--primary)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                    {isDragActive ? 'Drop your resume here' : 'Quickly build your profile'}
                                </p>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                                    Drag and drop your PDF resume here to auto-fill your skills, education, and projects.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1.5rem' }}
                            >
                                Browse Files
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(var(--error-rgb), 0.1)',
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        justifyContent: 'center'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUpload;
