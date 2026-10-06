import './style.css';
export const metadata = { title: 'Trợ lý giáo viên AI', description: 'Soạn kế hoạch bài dạy, slide và sáng kiến kinh nghiệm' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="vi"><body>{children}</body></html>; }
