"use client";

import { useEffect, useState } from "react";
import { FolderOpen, FileText, Loader2, Download } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { format } from "date-fns";

interface Document {
  id: string;
  doc_type: string;
  file_name: string;
  storage_path: string;
  created_at: string | null;
  excerpt: string | null;
}

export default function DocumentsPage() {
  const { checked } = useRequireAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Document[]>("/documents")
      .then((data) => {
        if (!cancelled) {
          setDocuments(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <FolderOpen size={24} className="text-brand-500" />
          Document Center
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage your uploaded resumes, transcripts, and generated artifacts.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-ink-100 shadow-sm">
          <FolderOpen className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink-900">No Documents Found</h3>
          <p className="text-ink-500 mt-1">Upload files from your profile or generate applications to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-ink-100 flex items-start gap-4 flex-grow">
                <div className="bg-brand-50 p-3 rounded-lg text-brand-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-ink-900 truncate" title={doc.file_name}>
                    {doc.file_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-ink-100 text-ink-700 rounded-full font-medium uppercase tracking-wider">
                      {doc.doc_type}
                    </span>
                    {doc.created_at && (
                      <span className="text-xs text-ink-400">
                        {format(new Date(doc.created_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {doc.excerpt && (
                <div className="p-5 bg-ink-50/50 flex-grow border-b border-ink-100 text-xs text-ink-600 font-mono overflow-hidden">
                  <p className="line-clamp-3">{doc.excerpt}</p>
                </div>
              )}
              <div className="bg-white p-3 flex justify-end">
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
