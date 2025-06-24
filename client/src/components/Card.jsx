export default function Card({ icon, title, description, className = "" }) {
  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex flex-col items-start space-y-4">
        <div className="text-gray-600 text-2xl">{icon}</div>

        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>

        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}