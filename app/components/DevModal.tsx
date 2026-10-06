'use client';

import { useEffect, useRef } from 'react';

export default function DevModal({
  open,
  onClose,
  title = 'Tính năng đang phát triển',
  message = 'Thư viện sách đang được hoàn thiện. Vui lòng quay lại sau.',
  actionLabel = 'Đã hiểu',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      const prevOverflow = document.body.style.overflow;
      try {
        if (!element.open) {
          element.showModal();
        }
        document.body.style.overflow = 'hidden';
      } catch {
        // Fallback for environments where showModal is not supported
      }
      return () => {
        try {
          element.close();
        } catch {
          // ignore
        }
        document.body.style.overflow = prevOverflow;
      };
    } else {
      try {
        if (element.open) {
          element.close();
        }
      } catch {
        // ignore
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialog}
      className="waitingScreen"
      aria-labelledby="dev-modal-title"
      aria-describedby="dev-modal-desc"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="waitingContent">
        <h2 id="dev-modal-title">{title}</h2>
        <p id="dev-modal-desc">{message}</p>
        <button
          type="button"
          className="primary"
          autoFocus
          onClick={onClose}
        >
          {actionLabel}
        </button>
      </div>
    </dialog>
  );
}
