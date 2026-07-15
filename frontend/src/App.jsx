export default function App() {
  return (
    <div className="flex flex-col h-screen bg-white text-slate-800">
      <header className="flex items-center px-6 h-14 border-b border-slate-200">
        <div className="leading-tight">
          <span className="block text-sm font-medium tracking-tight">Lexicon</span>
          <span className="block text-[10px] uppercase tracking-widest text-slate-400">
            System Toolset V3.0
          </span>
        </div>
      </header>

      <main className="flex flex-1 min-h-0">
        <aside className="w-64 shrink-0 border-r border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Tool Matrix</p>
        </aside>

        <section className="flex-1 min-w-0 border-r border-slate-200 p-6">
          <p className="text-xs uppercase tracking-wider text-slate-400">Source Document</p>
        </section>

        <aside className="w-80 shrink-0 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Review Panel</p>
        </aside>
      </main>
    </div>
  );
}
