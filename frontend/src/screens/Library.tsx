/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import {
  type ApiDocument,
  deleteDocument,
  downloadOriginal,
  getDocumentStatuses,
  listDocuments,
  retryDocument,
  uploadDocument,
} from "@/lib/api";

const { Select } = UI;

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "docx", "txt", "md"];
const PAGE_SIZE = 8;
const STATUS_POLL_MS = 1500;

interface PendingUpload {
  clientId: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  progress: number;
}

interface RowDoc {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  status: string;
  failure_reason: string | null;
  uploaded_at: string;
  progress?: number;
}

interface RejectedFile {
  name: string;
  reason: string;
}

interface LibraryNotice {
  tone: "ok" | "error";
  text: string;
}

const SURFACE = "#151A20";
const SURFACE_SOFT = "#11161B";
const BORDER = "#242C36";
const TEXT = "#E6EAF0";
const DANGER = "#FF7B72";

function formatBytes(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return Math.round(n / 1024) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return day + ", " + time;
}

function extOf(name: string) {
  const parts = String(name).split(".");
  return parts.length > 1 ? (parts.pop() as string).toLowerCase() : "";
}

function statusKey(status: string) {
  return status.toLowerCase();
}

export default function Screen() {
  const navigate = useNavigate();
  const {
    Upload,
    Search,
    Download,
    Trash,
    CheckCircle,
    AlertCircle,
    Clock,
    X,
    FileText,
    ChevronLeft,
    ChevronRight,
  } = Icons;

  const STATUS_META: Record<
    string,
    { label: string; Icon: typeof CheckCircle; color: string; tint: string; line: string }
  > = {
    ready: {
      label: "Ready",
      Icon: CheckCircle,
      color: TEXT,
      tint: "rgba(230,234,240,0.08)",
      line: "rgba(230,234,240,0.20)",
    },
    processing: {
      label: "Processing",
      Icon: Clock,
      color: brand.accentColor,
      tint: "rgba(242,181,68,0.12)",
      line: "rgba(242,181,68,0.35)",
    },
    failed: {
      label: "Failed",
      Icon: AlertCircle,
      color: DANGER,
      tint: "rgba(255,123,114,0.12)",
      line: "rgba(255,123,114,0.35)",
    },
    uploading: {
      label: "Uploading",
      Icon: Upload,
      color: brand.primaryColor,
      tint: "rgba(76,141,255,0.12)",
      line: "rgba(76,141,255,0.35)",
    },
  };

  const [docs, setDocs] = React.useState<ApiDocument[]>([]);
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [rejected, setRejected] = React.useState<RejectedFile[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [notice, setNotice] = React.useState<LibraryNotice | null>(null);
  const [confirmDoc, setConfirmDoc] = React.useState<RowDoc | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const chooseBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const confirmBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = React.useRef<HTMLElement | null>(null);

  const refreshDocuments = React.useCallback(async () => {
    try {
      const res = await listDocuments({ limit: 100 });
      setDocs(res.items);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load the document library.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* initial load from the real API */
  React.useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  /* poll real ingestion status for documents still Processing */
  React.useEffect(() => {
    const processingIds = docs
      .filter((d) => statusKey(d.status) === "processing")
      .map((d) => d.id);
    if (processingIds.length === 0) return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await getDocumentStatuses(processingIds);
        const byId = new Map(res.statuses.map((s) => [s.id, s]));
        setDocs((prev) =>
          prev.map((d) => {
            const s = byId.get(d.id);
            if (!s) return d;
            return { ...d, status: s.status, failure_reason: s.failure_reason };
          }),
        );
      } catch {
        // transient poll failure: try again next tick
      }
    }, STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [docs]);

  /* dialog: escape to close, focus the confirm action, restore focus after */
  React.useEffect(() => {
    if (!confirmDoc) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
    };
    document.addEventListener("keydown", onKey);
    if (confirmBtnRef.current) confirmBtnRef.current.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmDoc]);

  const rows: RowDoc[] = React.useMemo(() => {
    const pendingRows: RowDoc[] = pending.map((p) => ({
      id: p.clientId,
      filename: p.filename,
      file_type: p.file_type,
      size_bytes: p.size_bytes,
      status: "Uploading",
      failure_reason: null,
      uploaded_at: new Date().toISOString(),
      progress: p.progress,
    }));
    return pendingRows.concat(docs);
  }, [pending, docs]);

  const counts = React.useMemo(() => {
    const c = { all: rows.length, ready: 0, processing: 0, failed: 0 };
    rows.forEach((d) => {
      const key = statusKey(d.status);
      if (key === "ready") c.ready += 1;
      else if (key === "failed") c.failed += 1;
      else c.processing += 1;
    });
    return c;
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((d) => {
        const key = statusKey(d.status);
        const bucket = key === "uploading" ? "processing" : key;
        if (statusFilter !== "all" && bucket !== statusFilter) return false;
        if (!q) return true;
        return d.filename.toLowerCase().includes(q) || d.file_type.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function uploadOne(file: File) {
    const clientId =
      "pending_" + Math.random().toString(16).slice(2) + Date.now().toString(16).slice(-4);
    setPending((prev) => [
      { clientId, filename: file.name, file_type: extOf(file.name), size_bytes: file.size, progress: 0 },
      ...prev,
    ]);
    uploadDocument(file, (pct) => {
      setPending((prev) =>
        prev.map((p) => (p.clientId === clientId ? { ...p, progress: pct } : p)),
      );
    })
      .then((result) => {
        setPending((prev) => prev.filter((p) => p.clientId !== clientId));
        setDocs((prev) => [
          {
            id: result.id,
            filename: result.filename,
            file_type: result.file_type,
            size_bytes: result.size_bytes,
            status: result.status,
            failure_reason: null,
            uploaded_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNotice({ tone: "ok", text: file.name + " uploaded and queued for indexing." });
      })
      .catch((err) => {
        setPending((prev) => prev.filter((p) => p.clientId !== clientId));
        const message = err instanceof Error ? err.message : "Upload failed.";
        setRejected((prev) => [...prev, { name: file.name, reason: message + " It can be tried again." }]);
        setNotice({
          tone: "error",
          text: file.name + " was not uploaded. It can be tried again.",
        });
      });
  }

  function acceptFiles(fileList: FileList | null | undefined) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const bad: RejectedFile[] = [];
    const good: File[] = [];
    files.forEach((f) => {
      const ext = extOf(f.name);
      if (!ALLOWED_EXT.includes(ext)) {
        bad.push({
          name: f.name,
          reason: "Unsupported format. Accepted: PDF, DOCX, TXT and Markdown.",
        });
      } else if (f.size > MAX_BYTES) {
        bad.push({
          name: f.name,
          reason: "Too large (" + formatBytes(f.size) + "). Maximum file size is 25 MB.",
        });
      } else {
        good.push(f);
      }
    });
    setRejected(bad);
    if (bad.length && !good.length) {
      setNotice({
        tone: "error",
        text: "No files were uploaded. " + bad.length + " rejected before upload.",
      });
    }
    if (good.length) {
      setStatusFilter("all");
      setQuery("");
      setPage(1);
    }
    good.forEach(uploadOne);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    acceptFiles(e.dataTransfer && e.dataTransfer.files);
  }

  async function retry(doc: RowDoc) {
    try {
      const res = await retryDocument(doc.id);
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: res.status, failure_reason: null } : d)),
      );
      setNotice({ tone: "ok", text: "Retrying ingestion for " + doc.filename + "." });
    } catch (e) {
      setNotice({
        tone: "error",
        text: "Could not retry " + doc.filename + ". " + (e instanceof Error ? e.message : ""),
      });
    }
  }

  async function openOriginal(doc: RowDoc) {
    try {
      await downloadOriginal(doc.id, doc.filename);
    } catch (e) {
      setNotice({
        tone: "error",
        text: "Could not download " + doc.filename + ". " + (e instanceof Error ? e.message : ""),
      });
    }
  }

  function openConfirm(doc: RowDoc) {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setConfirmDoc(doc);
  }

  function closeConfirm() {
    setConfirmDoc(null);
    if (lastFocusRef.current && lastFocusRef.current.focus) lastFocusRef.current.focus();
  }

  async function confirmDelete() {
    const doc = confirmDoc;
    if (!doc) return;
    try {
      await deleteDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      setNotice({
        tone: "ok",
        text:
          doc.filename +
          " deleted for the whole workspace. Its chunks and embeddings are no longer retrievable.",
      });
    } catch (e) {
      setNotice({
        tone: "error",
        text: "Could not delete " + doc.filename + ". " + (e instanceof Error ? e.message : ""),
      });
    }
    closeConfirm();
  }

  const filters = [
    { key: "all", label: "All", count: counts.all },
    { key: "ready", label: "Ready", count: counts.ready },
    { key: "processing", label: "Processing", count: counts.processing },
    { key: "failed", label: "Failed", count: counts.failed },
  ];

  const cardStyle = { backgroundColor: SURFACE, borderColor: BORDER, borderRadius: brand.radius };

  return (
    <div
      className="min-h-full px-6 py-7 lg:px-10"
      style={{ backgroundColor: brand.backgroundColor, color: TEXT, fontFamily: brand.fontBody }}
    >
      <style>{`
        .nd-focus:focus-visible { outline: 2px solid ${brand.primaryColor}; outline-offset: 2px; border-radius: ${brand.radius}; }
        .nd-input::placeholder { color: #6E7889; }
        .nd-row:hover { background-color: rgba(255,255,255,0.03); }
      `}</style>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: brand.fontHeading }}
            >
              Document library
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
              One shared library for the whole team. Uploads are the only knowledge source — the
              chatbot answers from Ready documents and nothing else.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("chat")}
            className="nd-focus inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium"
            style={{
              backgroundColor: brand.primaryColor,
              color: "#0B0E12",
              borderRadius: brand.radius,
            }}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Ask a question
          </button>
        </header>

        {/* Overview */}
        <section className="mt-6" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">
            Library overview
          </h2>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Documents", value: counts.all, hint: "in shared workspace" },
              { label: "Ready", value: counts.ready, hint: "indexed for retrieval" },
              { label: "Processing", value: counts.processing, hint: "extract, chunk, embed" },
              { label: "Failed", value: counts.failed, hint: "retryable" },
            ].map((s) => (
              <div key={s.label} className="border px-4 py-3" style={cardStyle}>
                <dt
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: brand.neutralColor }}
                >
                  {s.label}
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tabular-nums">{s.value}</dd>
                <dd className="mt-0.5 text-xs" style={{ color: brand.neutralColor }}>
                  {s.hint}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Upload */}
        <section className="mt-6" aria-labelledby="upload-heading">
          <div className="border p-5" style={cardStyle}>
            <h2 id="upload-heading" className="text-sm font-semibold">
              Add documents
            </h2>
            <p className="mt-1 text-xs" style={{ color: brand.neutralColor }}>
              PDF, Word (.docx), plain text and Markdown. Up to 25 MB per file, several at a time.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className="mt-4 flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-8 text-center transition-colors"
              style={{
                borderColor: dragging ? brand.primaryColor : BORDER,
                backgroundColor: dragging ? "rgba(76,141,255,0.07)" : SURFACE_SOFT,
                borderRadius: brand.radius,
              }}
            >
              <Upload
                className="h-5 w-5"
                style={{ color: brand.neutralColor }}
                aria-hidden="true"
              />
              <p className="text-sm" style={{ color: TEXT }}>
                Drag files here, or choose them from your computer.
              </p>
              <label htmlFor="file-input" className="sr-only">
                Select documents to upload
              </label>
              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md"
                className="sr-only"
                onChange={(e) => {
                  acceptFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                ref={chooseBtnRef}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="nd-focus mt-1 inline-flex items-center gap-2 border px-3.5 py-2 text-sm font-medium"
                style={{
                  borderColor: BORDER,
                  backgroundColor: SURFACE,
                  color: TEXT,
                  borderRadius: brand.radius,
                }}
              >
                Choose files
              </button>
              <p className="text-xs" style={{ color: brand.neutralColor }}>
                No sign-in: anyone with this link can upload, chat and delete.
              </p>
            </div>

            {rejected.length > 0 && (
              <div
                className="mt-4 border p-4"
                style={{
                  borderColor: "rgba(255,123,114,0.35)",
                  backgroundColor: "rgba(255,123,114,0.08)",
                  borderRadius: brand.radius,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: DANGER }}
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {rejected.length} file{rejected.length === 1 ? "" : "s"} rejected before upload
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRejected([])}
                    aria-label="Dismiss rejected file list"
                    className="nd-focus p-1"
                    style={{ color: brand.neutralColor }}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {rejected.map((r, i) => (
                    <li key={r.name + i} className="text-sm">
                      <span className="font-medium">{r.name}</span>
                      <span className="block text-xs" style={{ color: brand.neutralColor }}>
                        {r.reason}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs" style={{ color: brand.neutralColor }}>
                  No library entries were created for these. Other files in the batch were
                  unaffected.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Live activity notice */}
        <div role="status" aria-live="polite" className="mt-4">
          {notice && (
            <div
              className="flex items-start justify-between gap-4 border px-4 py-2.5"
              style={{
                borderColor: notice.tone === "error" ? "rgba(255,123,114,0.35)" : BORDER,
                backgroundColor: SURFACE,
                borderRadius: brand.radius,
              }}
            >
              <p className="flex items-start gap-2 text-sm">
                {notice.tone === "error" ? (
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: DANGER }}
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: brand.primaryColor }}
                    aria-hidden="true"
                  />
                )}
                <span>{notice.text}</span>
              </p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss message"
                className="nd-focus p-1"
                style={{ color: brand.neutralColor }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
          {loadError && (
            <div
              className="mt-2 flex items-start gap-2 border px-4 py-2.5 text-sm"
              style={{
                borderColor: "rgba(255,123,114,0.35)",
                backgroundColor: SURFACE,
                borderRadius: brand.radius,
                color: DANGER,
              }}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Could not load the document library. {loadError}</span>
            </div>
          )}
        </div>

        {/* Documents */}
        <section className="mt-6" aria-labelledby="documents-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="documents-heading" className="text-sm font-semibold">
              Documents
              <span className="ml-2 font-normal" style={{ color: brand.neutralColor }}>
                {filtered.length} of {rows.length}
              </span>
            </h2>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="doc-search"
                  className="mb-1 block text-xs font-medium"
                  style={{ color: brand.neutralColor }}
                >
                  Search filenames
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: brand.neutralColor }}
                    aria-hidden="true"
                  />
                  <input
                    id="doc-search"
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="policy, runbook, .pdf"
                    className="nd-focus nd-input w-64 border py-2 pl-9 pr-3 text-sm"
                    style={{
                      backgroundColor: SURFACE_SOFT,
                      borderColor: BORDER,
                      color: TEXT,
                      borderRadius: brand.radius,
                    }}
                  />
                </div>
              </div>

              <div
                role="group"
                aria-label="Filter documents by indexing status"
                className="flex gap-1.5"
              >
                {filters.map((f) => {
                  const active = statusFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setStatusFilter(f.key);
                        setPage(1);
                      }}
                      className="nd-focus border px-3 py-2 text-xs font-medium"
                      style={{
                        borderColor: active ? brand.primaryColor : BORDER,
                        backgroundColor: active ? "rgba(76,141,255,0.14)" : SURFACE_SOFT,
                        color: active ? "#A8C8FF" : brand.neutralColor,
                        borderRadius: brand.radius,
                      }}
                    >
                      {f.label}
                      <span className="ml-1.5 tabular-nums">{f.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 overflow-hidden border" style={cardStyle}>
            {loading ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm" style={{ color: brand.neutralColor }}>
                  Loading the document library…
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <h3 className="text-sm font-semibold">The library is empty</h3>
                <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: brand.neutralColor }}>
                  Uploaded documents are the only knowledge source. Until something is uploaded and
                  Ready, the chatbot will say it has nothing to answer from.
                </p>
                <button
                  type="button"
                  onClick={() => chooseBtnRef.current && chooseBtnRef.current.focus()}
                  className="nd-focus mt-5 inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: brand.primaryColor,
                    color: "#0B0E12",
                    borderRadius: brand.radius,
                  }}
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload documents
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <h3 className="text-sm font-semibold">No documents match this view</h3>
                <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: brand.neutralColor }}>
                  Nothing matches {query ? '"' + query + '"' : "the selected status"}. Clear the
                  filters to see all {rows.length} documents.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="nd-focus mt-5 inline-flex items-center gap-2 border px-3.5 py-2 text-sm font-medium"
                  style={{
                    borderColor: BORDER,
                    backgroundColor: SURFACE_SOFT,
                    color: TEXT,
                    borderRadius: brand.radius,
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Shared documents with file type, size, upload time and indexing status.
                </caption>
                <thead>
                  <tr style={{ backgroundColor: SURFACE_SOFT }}>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Document
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Uploaded
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide"
                      style={{ color: brand.neutralColor, borderBottom: "1px solid " + BORDER }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((d) => {
                    const key = statusKey(d.status);
                    const meta = STATUS_META[key] || STATUS_META.processing;
                    const StatusIcon = meta.Icon;
                    return (
                      <tr
                        key={d.id}
                        className="nd-row align-top"
                        style={{ borderBottom: "1px solid " + BORDER }}
                      >
                        <th scope="row" className="max-w-sm px-4 py-3 text-left font-normal">
                          <span className="flex items-start gap-2.5">
                            <FileText
                              className="mt-0.5 h-4 w-4 shrink-0"
                              style={{ color: brand.neutralColor }}
                              aria-hidden="true"
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{d.filename}</span>
                              {key === "failed" ? (
                                <span className="mt-1 block text-xs" style={{ color: DANGER }}>
                                  {d.failure_reason}
                                </span>
                              ) : key === "ready" ? (
                                <span
                                  className="mt-1 block text-xs"
                                  style={{ color: brand.neutralColor }}
                                >
                                  Indexed for retrieval
                                </span>
                              ) : (
                                <span
                                  className="mt-1 block text-xs"
                                  style={{ color: brand.neutralColor }}
                                >
                                  Extract, chunk, embed
                                </span>
                              )}
                            </span>
                          </span>
                        </th>
                        <td className="px-4 py-3 uppercase" style={{ color: brand.neutralColor }}>
                          {d.file_type}
                        </td>
                        <td
                          className="px-4 py-3 text-right tabular-nums"
                          style={{ color: brand.neutralColor }}
                        >
                          {formatBytes(d.size_bytes)}
                        </td>
                        <td
                          className="whitespace-nowrap px-4 py-3 tabular-nums"
                          style={{ color: brand.neutralColor }}
                        >
                          {formatWhen(d.uploaded_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium"
                            style={{
                              color: meta.color,
                              backgroundColor: meta.tint,
                              borderColor: meta.line,
                              borderRadius: brand.radius,
                            }}
                          >
                            <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {meta.label}
                          </span>
                          {key === "uploading" && (
                            <span className="mt-2 flex items-center gap-2">
                              <span
                                className="block h-1 w-24 overflow-hidden"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.12)",
                                  borderRadius: 999,
                                }}
                                role="progressbar"
                                aria-valuenow={d.progress || 0}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={"Upload progress for " + d.filename}
                              >
                                <span
                                  className="block h-1"
                                  style={{
                                    width: (d.progress || 0) + "%",
                                    backgroundColor: brand.primaryColor,
                                    borderRadius: 999,
                                  }}
                                />
                              </span>
                              <span
                                className="text-xs tabular-nums"
                                style={{ color: brand.neutralColor }}
                              >
                                {d.progress || 0}%
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {key === "failed" && (
                              <button
                                type="button"
                                onClick={() => retry(d)}
                                className="nd-focus border px-2.5 py-1.5 text-xs font-medium"
                                style={{
                                  borderColor: BORDER,
                                  backgroundColor: SURFACE_SOFT,
                                  color: TEXT,
                                  borderRadius: brand.radius,
                                }}
                              >
                                Retry<span className="sr-only"> ingestion of {d.filename}</span>
                              </button>
                            )}
                            {key !== "uploading" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openOriginal(d)}
                                  aria-label={"Download original file " + d.filename}
                                  className="nd-focus border p-1.5"
                                  style={{
                                    borderColor: BORDER,
                                    backgroundColor: SURFACE_SOFT,
                                    color: brand.neutralColor,
                                    borderRadius: brand.radius,
                                  }}
                                >
                                  <Download className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openConfirm(d)}
                                  aria-label={"Delete " + d.filename + " from the shared library"}
                                  className="nd-focus border p-1.5"
                                  style={{
                                    borderColor: BORDER,
                                    backgroundColor: SURFACE_SOFT,
                                    color: DANGER,
                                    borderRadius: brand.radius,
                                  }}
                                >
                                  <Trash className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs" style={{ color: brand.neutralColor }}>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} documents
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="nd-focus inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                  style={{
                    borderColor: BORDER,
                    backgroundColor: SURFACE_SOFT,
                    color: TEXT,
                    borderRadius: brand.radius,
                  }}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-xs tabular-nums" style={{ color: brand.neutralColor }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="nd-focus inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                  style={{
                    borderColor: BORDER,
                    backgroundColor: SURFACE_SOFT,
                    color: TEXT,
                    borderRadius: brand.radius,
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Release notes */}
        <section className="mt-8" aria-labelledby="limits-heading">
          <div className="border p-5" style={{ ...cardStyle, backgroundColor: SURFACE_SOFT }}>
            <h2 id="limits-heading" className="text-sm font-semibold">
              What this library does not do yet
            </h2>
            <ul className="mt-3 space-y-2 text-sm" style={{ color: brand.neutralColor }}>
              <li>
                Uploading the same file twice creates two independent entries — no duplicate
                detection or versioning.
              </li>
              <li>Scanned PDFs with no text layer fail: OCR is not part of this release.</li>
              <li>
                Nothing is deleted automatically. Documents and threads stay until someone removes
                them.
              </li>
              <li>
                Deleting a document keeps past answers intact; their citations are marked as
                removed.
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Delete confirmation */}
      {confirmDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(6,8,11,0.72)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            className="w-full max-w-md border p-5"
            style={{ backgroundColor: SURFACE, borderColor: BORDER, borderRadius: brand.radius }}
          >
            <h2 id="delete-title" className="text-sm font-semibold">
              Delete {confirmDoc.filename}?
            </h2>
            <p
              id="delete-desc"
              className="mt-3 text-sm leading-relaxed"
              style={{ color: brand.neutralColor }}
            >
              This removes the document, its extracted chunks and embeddings, and the original file
              from object storage. It disappears for the whole shared workspace, for everyone with
              the link. This cannot be undone.
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: brand.neutralColor }}>
              Past answers keep their text, and citations to this document will be marked as
              referring to a removed document.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="nd-focus border px-3.5 py-2 text-sm font-medium"
                style={{
                  borderColor: BORDER,
                  backgroundColor: SURFACE_SOFT,
                  color: TEXT,
                  borderRadius: brand.radius,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={confirmBtnRef}
                onClick={confirmDelete}
                className="nd-focus inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold"
                style={{ backgroundColor: DANGER, color: "#1A0B0A", borderRadius: brand.radius }}
              >
                <Trash className="h-4 w-4" aria-hidden="true" />
                Delete for everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
