"use client";

import { DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Github,
  LoaderCircle,
  Moon,
  Sun,
  UploadCloud,
  X,
} from "lucide-react";
import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { MarkdownPanel } from "@/components/markdown-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ApiError, ConversionResponse } from "@/types/conversion";

const DEFAULT_MARKDOWN = "# Ready\n\nConvert a file or URL to see Markdown here.\n";

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function ConverterShell() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [filename, setFilename] = useState("converted.md");
  const [status, setStatus] = useState("Ready.");
  const [error, setError] = useState("");
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("markitdown-theme");
    const nextTheme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("markitdown-theme", theme);
  }, [theme]);

  const getMessage = (err: unknown) => {
    const axiosError = err as AxiosError<ApiError>;
    return (
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Something went wrong."
    );
  };

  const applyResult = (result: ConversionResponse) => {
    setMarkdown(result.markdown);
    setFilename(result.filename || "converted.md");
    setError("");
    setStatus("Conversion complete.");
  };

  const handleFileSelect = (selected: File | null) => {
    setFile(selected);
    setError("");
    setStatus(selected ? `${selected.name} selected.` : "Ready.");
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0] ?? null);
  };

  const onFileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      setStatus("Choose a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setIsFileLoading(true);
      setError("");
      setStatus(`Uploading ${file.name}…`);
      const response = await api.post<ConversionResponse>("/convert/file", formData);
      applyResult(response.data);
    } catch (err) {
      const message = getMessage(err);
      setError(message);
      setStatus(message);
    } finally {
      setIsFileLoading(false);
    }
  };

  const onUrlSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      setError("Paste a URL first.");
      setStatus("Paste a URL first.");
      return;
    }
    try {
      setIsUrlLoading(true);
      setError("");
      setStatus("Fetching webpage…");
      const response = await api.post<ConversionResponse>("/convert/url", { url: url.trim() });
      applyResult(response.data);
    } catch (err) {
      const message = getMessage(err);
      setError(message);
      setStatus(message);
    } finally {
      setIsUrlLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setError("Copy failed.");
      setStatus("Copy failed.");
    }
  };

  const onDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="mb-8">
        {/* Attribution strip */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Built with MarkItDown */}
          <a
            href="https://github.com/microsoft/markitdown"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
          >
            <MicrosoftLogo className="h-3 w-3" />
            Built with MarkItDown
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/moghalsaif"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
          >
            <Github className="h-3 w-3" />
            moghalsaif
          </a>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
              MarkItDown
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Convert files and URLs to clean Markdown instantly.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? "Dark" : "Light"}
          </Button>
        </div>
      </header>

      {/* ── Main grid ───────────────────────────────────────── */}
      <main className="flex-1 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left column */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>File Upload</CardTitle>
              <CardDescription>Drag & drop or click to choose a file.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onFileSubmit}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.html,.htm,.txt,.md,.csv"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="File upload area"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-7 text-center transition-all duration-200 cursor-pointer select-none",
                    isDragging
                      ? "border-zinc-500 bg-zinc-100 scale-[1.01] dark:border-zinc-400 dark:bg-zinc-800"
                      : file
                        ? "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60"
                        : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
                  )}
                >
                  {file ? (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <FileText className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="max-w-full">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileSelect(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <UploadCloud className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {isDragging ? "Drop it here" : "Click or drag a file"}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          PDF · Word · Excel · PPT · HTML · CSV · TXT
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isFileLoading}>
                  {isFileLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Convert file
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* URL Conversion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>URL Conversion</CardTitle>
              <CardDescription>Paste a URL and click convert.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onUrlSubmit}>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
                <Button type="submit" className="w-full" disabled={isUrlLoading}>
                  {isUrlLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Convert URL
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm",
                  error
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                )}
              >
                {error || status}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — single preview panel */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
            <div>
              <CardTitle>Preview</CardTitle>
              <CardDescription className="mt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                {filename}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onCopy()}
                className={cn(
                  "relative overflow-hidden transition-all duration-200",
                  isCopied && "border-green-300 dark:border-green-700"
                )}
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 transition-all duration-200",
                    isCopied ? "opacity-0 scale-75" : "opacity-100 scale-100"
                  )}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center gap-1.5 text-green-600 dark:text-green-400 transition-all duration-200",
                    isCopied ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </span>
              </Button>
              <Button type="button" size="sm" onClick={onDownload}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="min-h-[480px] rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <MarkdownPanel markdown={markdown} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
