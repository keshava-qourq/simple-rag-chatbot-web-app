import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Screen from "./Library";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => "/",
}));

const api = vi.hoisted(() => ({
  listDocuments: vi.fn(),
  getDocumentStatuses: vi.fn(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  downloadOriginal: vi.fn(),
  retryDocument: vi.fn(),
}));

vi.mock("@/lib/api", () => api);

function makeFile(name: string, sizeBytes: number, type = "application/pdf"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

// Bypasses user-event's own `accept`-attribute filtering so files with
// unsupported extensions actually reach the component's own validation --
// which is exactly what the acceptance criteria exercise.
function selectFiles(files: File[]) {
  const input = document.getElementById("file-input") as HTMLInputElement;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.change(input);
}

beforeEach(() => {
  api.listDocuments.mockReset().mockResolvedValue({ items: [], next_cursor: null });
  api.getDocumentStatuses.mockReset().mockResolvedValue({ statuses: [] });
  api.uploadDocument.mockReset();
  api.deleteDocument.mockReset().mockResolvedValue(undefined);
  api.downloadOriginal.mockReset().mockResolvedValue(undefined);
  api.retryDocument.mockReset();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("Library screen", () => {
  it("shows the empty state once the real library loads with no documents", async () => {
    render(<Screen />);
    expect(await screen.findByText(/the library is empty/i)).toBeInTheDocument();
    expect(api.listDocuments).toHaveBeenCalledWith({ limit: 100 });
  });

  it("renders documents returned by GET /documents, not seeded data", async () => {
    api.listDocuments.mockResolvedValue({
      items: [
        {
          id: "doc_1",
          filename: "Handbook.pdf",
          file_type: "pdf",
          size_bytes: 1024,
          status: "Ready",
          failure_reason: null,
          uploaded_at: "2026-10-07T09:12:00",
        },
        {
          id: "doc_2",
          filename: "Broken.docx",
          file_type: "docx",
          size_bytes: 2048,
          status: "Failed",
          failure_reason: "Could not extract text",
          uploaded_at: "2026-10-06T09:12:00",
        },
      ],
      next_cursor: null,
    });
    render(<Screen />);
    expect(await screen.findByText("Handbook.pdf")).toBeInTheDocument();
    expect(screen.getByText("Broken.docx")).toBeInTheDocument();
    expect(screen.getByText("Could not extract text")).toBeInTheDocument();
    expect(screen.queryByText(/Engineering_Onboarding_Handbook/i)).not.toBeInTheDocument();
  });

  it("uploads each selected supported file and shows it Processing with its own progress", async () => {
    let resolveUpload: ((value: unknown) => void) | undefined;
    api.uploadDocument.mockImplementation((_file: File, onProgress: (pct: number) => void) => {
      return new Promise((resolve) => {
        onProgress(40);
        resolveUpload = resolve;
      });
    });
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    selectFiles([makeFile("notes.txt", 10, "text/plain")]);

    expect(api.uploadDocument).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("notes.txt")).toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.getByRole("progressbar", { name: /upload progress for notes.txt/i }),
      ).toBeInTheDocument(),
    );

    resolveUpload?.({
      id: "doc_new",
      filename: "notes.txt",
      file_type: "txt",
      size_bytes: 10,
      status: "Processing",
    });

    await waitFor(() =>
      expect(
        screen.queryByRole("progressbar", { name: /upload progress for notes.txt/i }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText("Processing").length).toBeGreaterThanOrEqual(1);
  });

  it("behaves the same for drag-and-drop as for the file picker", async () => {
    api.uploadDocument.mockResolvedValue({
      id: "doc_dropped",
      filename: "dropped.md",
      file_type: "md",
      size_bytes: 5,
      status: "Processing",
    });
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    const dropTarget = screen.getByText(/drag files here/i).closest("div") as HTMLElement;
    const file = makeFile("dropped.md", 5, "text/markdown");
    fireEvent.drop(dropTarget, { dataTransfer: { files: [file] } });

    expect(api.uploadDocument).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("dropped.md")).toBeInTheDocument());
  });

  it("reports a failed upload with a retry message while the rest of the batch succeeds", async () => {
    api.uploadDocument.mockImplementation((file: File) => {
      if (file.name === "fails.pdf") {
        return Promise.reject(new Error("Upload failed before the file was fully received."));
      }
      return Promise.resolve({
        id: "doc_ok",
        filename: file.name,
        file_type: "pdf",
        size_bytes: file.size,
        status: "Processing",
      });
    });
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    selectFiles([makeFile("ok.pdf", 100), makeFile("fails.pdf", 100)]);

    expect(api.uploadDocument).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByText("ok.pdf")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("fails.pdf")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getAllByText(/can be tried again/i).length).toBeGreaterThanOrEqual(1),
    );
  });

  it("rejects an unsupported extension before any request, naming the supported formats", async () => {
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    selectFiles([makeFile("malware.exe", 100, "application/octet-stream")]);

    expect(api.uploadDocument).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByText(/accepted: pdf, docx, txt and markdown/i)).toBeInTheDocument(),
    );
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("rejects a file over 25 MB before any request, stating the maximum", async () => {
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    selectFiles([makeFile("huge.pdf", 26 * 1024 * 1024)]);

    expect(api.uploadDocument).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByText(/maximum file size is 25 mb/i)).toBeInTheDocument(),
    );
  });

  it("in a mixed batch, uploads valid files and lists each invalid file with its own reason", async () => {
    api.uploadDocument.mockResolvedValue({
      id: "doc_good",
      filename: "good.pdf",
      file_type: "pdf",
      size_bytes: 100,
      status: "Processing",
    });
    render(<Screen />);
    await screen.findByText(/the library is empty/i);

    selectFiles([
      makeFile("good.pdf", 100),
      makeFile("bad.exe", 100, "application/octet-stream"),
      makeFile("huge.pdf", 26 * 1024 * 1024),
    ]);

    expect(api.uploadDocument).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("good.pdf")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("bad.exe")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("huge.pdf")).toBeInTheDocument());
    expect(screen.getByText(/accepted: pdf, docx, txt and markdown/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum file size is 25 mb/i)).toBeInTheDocument();
  });

  it("deletes a document through DELETE /documents/{id}", async () => {
    api.listDocuments.mockResolvedValue({
      items: [
        {
          id: "doc_1",
          filename: "Handbook.pdf",
          file_type: "pdf",
          size_bytes: 1024,
          status: "Ready",
          failure_reason: null,
          uploaded_at: "2026-10-07T09:12:00",
        },
      ],
      next_cursor: null,
    });
    render(<Screen />);
    await screen.findByText("Handbook.pdf");

    await userEvent.click(screen.getByRole("button", { name: /delete handbook\.pdf/i }));
    await userEvent.click(screen.getByRole("button", { name: /delete for everyone/i }));

    await waitFor(() => expect(api.deleteDocument).toHaveBeenCalledWith("doc_1"));
    await waitFor(() => expect(screen.queryByText("Handbook.pdf")).not.toBeInTheDocument());
  });

  it("downloads the original via GET /documents/{id}/original", async () => {
    api.listDocuments.mockResolvedValue({
      items: [
        {
          id: "doc_1",
          filename: "Handbook.pdf",
          file_type: "pdf",
          size_bytes: 1024,
          status: "Ready",
          failure_reason: null,
          uploaded_at: "2026-10-07T09:12:00",
        },
      ],
      next_cursor: null,
    });
    render(<Screen />);
    await screen.findByText("Handbook.pdf");

    await userEvent.click(
      screen.getByRole("button", { name: /download original file handbook\.pdf/i }),
    );
    await waitFor(() => expect(api.downloadOriginal).toHaveBeenCalledWith("doc_1", "Handbook.pdf"));
  });
});
