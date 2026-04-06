"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Send, Paperclip, AtSign } from "lucide-react";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/discord/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord-messages", channelId] });
      setContent("");
      textareaRef.current?.focus();
    },
  });

  const handleSubmit = useCallback(() => {
    if (!content.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(content.trim());
  }, [content, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const canSend = content.trim().length > 0 && !sendMessageMutation.isPending;

  return (
    <div className="px-4 pb-4">
      <div className="rounded-lg bg-dark-bl">
        <div className="flex items-end gap-2 p-2">
          {/* Attach Button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 transition-colors hover:text-white"
            title="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Enviar mensagem...`}
            className="min-h-[40px] max-h-[200px] flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            rows={1}
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded transition-colors",
              canSend
                ? "text-blurple hover:bg-blurple hover:text-white"
                : "cursor-not-allowed text-neutral-500"
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
              "px-2 pb-1 text-right text-xs",
              content.length > 2000 ? "text-red-500" : "text-neutral-500"
            )}
          >
            {content.length}/2000
          </div>
        )}
      </div>
    </div>
  );
}
