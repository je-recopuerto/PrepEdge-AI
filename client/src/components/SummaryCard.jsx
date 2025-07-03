export default function SummaryCard({ title, value, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}