export default function ContentSection({ title, items, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-6">
        <div className="space-y-2">
            {/* <h4 className="font-medium text-gray-900">{item.title}</h4> */}
            <p className="text-md text-gray-600 leading-relaxed">{items}</p>
          </div>
      </div>
    </div>
  );
}
// http://localhost:5173/interview/report/
