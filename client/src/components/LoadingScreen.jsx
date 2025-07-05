export default function LoadingScreen({
  message = "Loading..."
}) {

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center animate-pulse">
              <img src="/logo.png" alt="logo" className="rounded-full w-9 h-9" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PrepEdge AI</span>
          </div>
          <p className="text-gray-600">Preparing your personalized experience</p>
        </div>

        <div className="mb-8">
          <div className="relative w-10 h-10 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>

            <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>

            <div className="absolute inset-6 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
        </div>
      </div>
    </div>
  )
}
