export const SQLBox = ({ query }) => {
  if (!query) return null;
  return (
    <div className="sql-box pt-8 mt-4 border-t border-slate-100/50">
      <div className="mb-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-shabu-orange rounded-full"></div>
        <span className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400">Database Query</span>
      </div>
      <code className="whitespace-pre-wrap break-words leading-relaxed text-slate-500">
        {query}
      </code>
    </div>
  )
}
