export const Input = ({ label, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className="input-field"
    />
  </div>
)
