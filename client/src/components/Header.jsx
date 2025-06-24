import { Link } from "react-router-dom";

export default function Header() {
	return (
		<header className="bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center">
							<img src="/logo.png" alt="PrepEdge AI Logo" className="w-9 h-9" />
							<span className="text-xl font-semibold text-gray-900">
								PrepEdge AI
							</span>
						</Link>
					</div>

					{/* Navigation */}
					<nav className="hidden md:flex space-x-8">
						<Link
							to="/"
							className="text-gray-700 hover:text-gray-900 transition-colors"
						>
							Home
						</Link>
						<Link
							to="#"
							className="text-gray-700 hover:text-gray-900 transition-colors"
						>
							Practice
						</Link>
						<Link
							to="#"
							className="text-gray-700 hover:text-gray-900 transition-colors"
						>
							Resources
						</Link>
						<Link
							to="#"
							className="text-gray-700 hover:text-gray-900 transition-colors"
						>
							Community
						</Link>
					</nav>

					{/* Auth Buttons */}
					<div className="flex items-center space-x-4">
						<Link
							to="/login"
							className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
						>
							Log in
						</Link>
						<Link
							to="/signup"
							className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
						>
							Sign up
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
