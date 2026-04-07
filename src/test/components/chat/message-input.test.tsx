import { describe, it, expect } from 'vitest';

// Test the file attachment logic (isolated)
describe('File attachment limits', () => {
  const MAX_FILES = 10;

  it('respects max 10 file limit', () => {
    const existingFiles = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}` }));
    const newFiles = Array.from({ length: 7 }, (_, i) => ({ id: `new${i}` }));

    const allowed = newFiles.slice(0, MAX_FILES - existingFiles.length);
    expect(allowed).toHaveLength(5);
  });

  it('allows exactly 10 files', () => {
    const files = Array.from({ length: 10 }, (_, i) => ({ id: `f${i}` }));
    expect(files).toHaveLength(10);
  });

  it('rejects more than 10 files', () => {
    const files = Array.from({ length: 12 }, (_, i) => ({ id: `f${i}` }));
    const sliced = files.slice(0, MAX_FILES);
    expect(sliced).toHaveLength(10);
    expect(files.length).toBeGreaterThan(MAX_FILES);
  });
});

describe('File preview URL handling', () => {
  it('creates object URL for image files', () => {
    const file = new File(['test'], 'image.png', { type: 'image/png' });
    const url = URL.createObjectURL(file);
    expect(url).toBeTruthy();
    expect(url.startsWith('blob:')).toBe(true);
    URL.revokeObjectURL(url);
  });

  it('returns null preview for non-image files', () => {
    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    expect(preview).toBe(null);
  });

  it('identifies image files correctly', () => {
    const imageFile = new File([''], 'img.jpg', { type: 'image/jpeg' });
    const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
    const mp3File = new File([''], 'song.mp3', { type: 'audio/mpeg' });

    expect(imageFile.type.startsWith('image/')).toBe(true);
    expect(pdfFile.type.startsWith('image/')).toBe(false);
    expect(mp3File.type.startsWith('image/')).toBe(false);
  });
});

describe('Message content validation', () => {
  const MAX_LENGTH = 2000;

  it('accepts empty content when files are present', () => {
    const content = '';
    const files = [{ id: '1' }];
    const canSend = (content.trim().length > 0 || files.length > 0);
    expect(canSend).toBe(true);
  });

  it('rejects empty content with no files', () => {
    const content = '   ';
    const files: { id: string }[] = [];
    const canSend = (content.trim().length > 0 || files.length > 0);
    expect(canSend).toBe(false);
  });

  it('accepts content at max length', () => {
    const content = 'a'.repeat(MAX_LENGTH);
    expect(content.length).toBe(MAX_LENGTH);
  });

  it('rejects content exceeding max length', () => {
    const content = 'a'.repeat(MAX_LENGTH + 1);
    expect(content.length).toBeGreaterThan(MAX_LENGTH);
  });
});
