'use client';

import { useEffect, useId, useRef } from 'react';

export default function LoadingScreen({ active, label = 'AI đang xử lý…' }: { active: boolean; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!active) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  return <dialog ref={dialog} className="waitingScreen" aria-labelledby={titleId} onCancel={event => event.preventDefault()}>
    <div className="waitingContent" role="status" aria-live="polite">
      <span className="loadingSpinner" aria-hidden="true"/>
      <h2 id={titleId}>{label}</h2>
      <p>Vui lòng giữ trang mở. Tài liệu dài có thể cần vài phút.</p>
    </div>
  </dialog>;
}
