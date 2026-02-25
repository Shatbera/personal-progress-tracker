import Sidebar from './_components/sidebar';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
