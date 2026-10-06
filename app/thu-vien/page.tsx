'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TextbookLibraryPage() {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const element = dialog.current;
    const prevOverflow = document.body.style.overflow;
    try {
      element?.showModal();
      document.body.style.overflow = 'hidden';
    } catch {
      // fallback
    }
    return () => {
      try {
        element?.close();
      } catch {
        // ignore
      }
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <main className="shell">
      <header>
        <div className="eyebrow">TRỢ LÝ GIÁO VIÊN AI</div>
        <h1>Thư viện sách</h1>
      </header>

      <div className="card" style={{ maxWidth: 560, margin: '48px auto', textAlign: 'center', padding: '40px 24px' }}>
        <h2 style={{ marginBottom: 12 }}>Tính năng đang phát triển</h2>
        <p style={{ color: '#617780', marginBottom: 24, lineHeight: 1.6 }}>
          Thư viện sách đang được hoàn thiện để phục vụ giáo viên tốt hơn. Vui lòng quay lại sau.
        </p>
        <Link href="/" className="primary" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 9, textDecoration: 'none', color: '#fff', fontWeight: 700 }}>
          ← Về trang chính
        </Link>
      </div>

      <dialog
        ref={dialog}
        className="waitingScreen"
        aria-labelledby="library-development-title"
        aria-describedby="library-development-description"
        onCancel={(event) => event.preventDefault()}
      >
        <div className="waitingContent">
          <h2 id="library-development-title">Tính năng đang phát triển</h2>
          <p id="library-development-description">Thư viện sách đang được hoàn thiện. Vui lòng quay lại sau.</p>
          <button
            type="button"
            className="primary"
            autoFocus
            onClick={() => router.push('/')}
          >
            Về trang chính
          </button>
        </div>
      </dialog>
    </main>
  );
}
