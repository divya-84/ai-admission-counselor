import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  ShieldCheck,
  Camera,
  ArrowRight,
} from 'lucide-react';

interface DocumentModel {
  id: string;
  name: string;
  type: string;
  url: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  ocrMetadata?: Record<string, string | number>;
}

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [uploadType, setUploadType] = useState<string>('AADHAAR');
  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isListing, setIsListing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents/list');
      const result = await response.json();
      if (response.ok) {
        setDocuments(result.data.documents);
      }
    } catch {
      setError('Could not retrieve documents from vault.');
    } finally {
      setIsListing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', uploadType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess(`${uploadType} uploaded and OCR analyzed successfully!`);
        setFile(null);
        // Reset file input element
        const fileInput = document.getElementById('document-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchDocuments();
      } else {
        setError(result.message || 'File upload failed');
      }
    } catch {
      setError('An error occurred during document upload.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Developer Quick Verify (allows direct status changes to test flow)
  const handleQuickVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/documents/verify/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSuccess(`Document status updated to ${status}`);
        fetchDocuments();
      } else {
        const result = await response.json();
        setError(result.message || 'Verification update failed');
      }
    } catch {
      setError('Error updating verification status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <UploadCloud className="w-8 h-8 text-indigo-500" />
            Student Document Vault (OCR)
          </h1>
          <p className="text-slate-400 text-sm">
            Upload required credentials for verification. The OCR engine will auto-extract
            registration details and verify parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Upload Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Upload Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Document Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Document Category
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="AADHAAR">Aadhaar Card (Identity)</option>
                  <option value="MARKSHEET">Academic Marksheet (Marks)</option>
                  <option value="TC">Transfer Certificate (TC)</option>
                  <option value="MIGRATION">Migration Certificate</option>
                  <option value="PASSPORT_PHOTO">Passport Size Photo</option>
                </select>
              </div>

              {/* File Input Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Select File (PDF or Image)
                </label>
                <div className="border-2 border-dashed border-slate-850 hover:border-slate-800 rounded-xl p-4 bg-slate-950/20 text-center cursor-pointer relative transition-all">
                  <input
                    id="document-file-input"
                    type="file"
                    accept=".pdf, image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-xs text-slate-400 block font-medium">
                    {file ? file.name : 'Drag & drop or browse'}
                  </span>
                </div>
              </div>

              {/* Action Upload Trigger */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Extracting Text (OCR)...' : 'Upload and Verify'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Column 2 & 3: Vault Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {isListing ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3 text-slate-400 text-sm h-64">
                <div className="w-7 h-7 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-medium">Loading document vault...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3 h-64 flex flex-col items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-slate-700" />
                <p className="text-sm">
                  Vault is empty. Upload your documents to initiate OCR credentials verification.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Your Uploaded Credentials ({documents.length})
                </h3>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4"
                    >
                      {/* Document Meta Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                            {doc.type === 'PASSPORT_PHOTO' ? (
                              <Camera className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-base leading-snug">
                              {doc.name}
                            </h4>
                            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                              {doc.type}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border items-center gap-1 ${
                              doc.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : doc.verificationStatus === 'REJECTED'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {doc.verificationStatus === 'VERIFIED' ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : doc.verificationStatus === 'REJECTED' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                            )}
                            {doc.verificationStatus}
                          </span>
                        </div>
                      </div>

                      {/* OCR Extracted Data Panel */}
                      {doc.ocrMetadata && Object.keys(doc.ocrMetadata).length > 0 && (
                        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            OCR Auto-Extracted Parameters:
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(doc.ocrMetadata).map(([key, val]) => (
                              <div
                                key={key}
                                className="flex justify-between border-b border-slate-900/80 pb-1"
                              >
                                <span className="text-slate-500 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}:
                                </span>
                                <span className="text-slate-200 font-semibold">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mock Developer Tool controls */}
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center gap-2">
                        <span className="text-slate-500 text-[10px] italic">
                          Developer Mock Tool Actions:
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickVerify(doc.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold cursor-pointer"
                          >
                            Quick Verify
                          </button>
                          <button
                            onClick={() => handleQuickVerify(doc.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer"
                          >
                            Reject File
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
