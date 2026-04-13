"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Send, Paperclip, AtSign, X, ImageIcon, FileText } from "lucide-react";

interface MessageInputProps {
  channelId: string;
}

interface FilePreview {
  id: string;
  file: File;
  preview: string | null;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { content: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("content", payload.content);
      if (payload.files) {
        for (const file of payload.files) {
          formData.append("files", file);
        }
      }
      const res = await fetch(`/api/discord/channels/${channelId}/messages`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord-messages", channelId] });
      setContent("");
      setFiles([]);
      textareaRef.current?.focus();
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newFiles: FilePreview[] = selected.slice(0, 10 - files.length).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [files.length]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if ((!content.trim() && files.length === 0) || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({ content: content.trim(), files: files.map((f) => f.file) });
  }, [content, files, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const canSend = (content.trim().length > 0 || files.length > 0) && !sendMessageMutation.isPending;

  return (
    <div className="px-4 pb-3">
      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative">
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="h-20 w-20 rounded object-cover"
                />
              ) : (
                <div className="flex h-20 w-36 items-center gap-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3">
                  <FileText className="h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]" />
                  <span className="truncate text-xs font-mono text-[var(--color-text-secondary)]">{f.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeFile(f.id)}
                className="absolute -top-1.5 -right-1.5 flex min-w-[32px] min-h-[32px] items-center justify-center rounded-full bg-[var(--color-error)] text-black shadow hover:shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-glass)] p-1 transition-all duration-300 focus-within:border-[var(--color-brand)] focus-within:shadow-[0_0_20px_rgba(62,207,142,0.2)]">
        <div className="flex items-end gap-2 p-2">
          {/* Attach Button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <button
              className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-brand)] hover:shadow-[0_0_10px_rgba(62,207,142,0.2)] p-2"
              title="Anexar arquivo"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem...`}
            className="min-h-[36px] max-h-[200px] flex-1 resize-none bg-transparent py-2 text-base md:text-sm font-mono text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            rows={1}
          />

          {/* Image preview shortcut */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-brand)] hover:shadow-[0_0_10px_rgba(62,207,142,0.2)] p-2"
            title="Enviar imagem"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              "flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg transition-all duration-200 p-2",
              canSend
                ? "text-[var(--color-brand)] hover:shadow-[0_0_15px_rgba(62,207,142,0.3)]"
                : "cursor-not-allowed text-[var(--color-text-muted)]"
            )}
            title="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Character Counter */}
        {content.length > 1800 && (
          <div
            className={cn(
              "px-2 pb-1 text-right text-xs font-mono",
              content.length > 2000 ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"
            )}
          >
            {content.length}/2000
          </div>
        )}
      </div>
    </div>
  );
}
