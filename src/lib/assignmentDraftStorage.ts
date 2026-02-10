const PREFIX = 'assignment-draft:';

export type DraftPhoto = {
  id: string;
  name: string;
  dataUrl: string;
};

export type AssignmentDraft = {
  memo: string;
  photos: DraftPhoto[];
  savedAt: string;
};

function key(assignmentId: string) {
  return `${PREFIX}${assignmentId}`;
}

export function saveDraft(assignmentId: string, draft: AssignmentDraft): boolean {
  try {
    localStorage.setItem(key(assignmentId), JSON.stringify(draft));
    return true;
  } catch {
    // localStorage 용량 초과 시 사진 없이 재시도
    try {
      localStorage.setItem(
        key(assignmentId),
        JSON.stringify({ ...draft, photos: [] }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

export function loadDraft(assignmentId: string): AssignmentDraft | null {
  try {
    const raw = localStorage.getItem(key(assignmentId));
    if (!raw) return null;
    return JSON.parse(raw) as AssignmentDraft;
  } catch {
    return null;
  }
}

export function removeDraft(assignmentId: string) {
  localStorage.removeItem(key(assignmentId));
}

export function hasDraft(assignmentId: string): boolean {
  return localStorage.getItem(key(assignmentId)) !== null;
}

/** File → 압축된 base64 data URL (미리보기용) */
export function compressImageToDataUrl(
  file: File,
  maxWidth = 800,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = blobUrl;
  });
}
