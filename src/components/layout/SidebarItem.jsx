export const SidebarItem = ({ icon, label, active, onClick, hidden }) => {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      style={active ? { backgroundColor: '#F26522', boxShadow: '0 20px 25px -5px rgba(242, 101, 34, 0.2)' } : {}}
      className={`w-full flex items-center gap-4 px-8 py-4 cursor-pointer relative transition-colors ${active ? 'rounded-r-full mr-4' : 'hover:bg-orange-50'}`}
    >
      <span
        style={active ? { color: '#ffffff' } : { color: '#64748b' }}
        className="text-xl flex-shrink-0"
      >
        {icon}
      </span>
      <span
        style={active ? { color: '#ffffff', opacity: 1, visibility: 'visible' } : { color: '#64748b' }}
        className={`font-bold text-sm whitespace-nowrap ${active ? 'text-white' : ''}`}
      >
        {label}
      </span>
      {active && <div className="ml-auto w-1.5 h-6 bg-white rounded-full flex-shrink-0"></div>}
    </button>
  )
}
