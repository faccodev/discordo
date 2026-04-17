"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ApplicationCommand } from "@/lib/discord/types";
import { filterCommands, buildCommandUsage } from "@/lib/commands/search";
import { Search, X } from "lucide-react";

interface CommandPickerProps {
  commands: ApplicationCommand[];
  onSelect: (command: ApplicationCommand) => void;
  onClose: () => void;
}

export function CommandPicker({ commands, onSelect, onClose }: CommandPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = filterCommands(commands, query);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!filtered.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          onSelect(filtered[selectedIndex]);
          break;
      }
    },
    [filtered, selectedIndex, onSelect]
  );

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-sidebar)] shadow-xl"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search commands..."
          className="flex-1 bg-transparent font-mono text-sm text-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
        <button
          onClick={onClose}
          className="flex min-w-[32px] min-h-[32px] items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Command list */}
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center font-mono text-sm text-[var(--color-text-secondary)]">
            No commands found
          </p>
        ) : (
          filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={cn(
                "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors",
                idx === selectedIndex
                  ? "bg-[var(--color-brand)]/10"
                  : "hover:bg-[var(--color-bg-hover)]"
              )}
            >
              <span className="font-mono text-sm font-semibold text-[var(--color-brand)]">
                /{cmd.name}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                {cmd.description}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {buildCommandUsage(cmd)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}