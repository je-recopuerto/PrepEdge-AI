import { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

export default function ContactForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		category: "general",
		message: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const categories = [
		{ value: "general", label: "General Inquiry" },
		{ value: "feature", label: "Feature Request" },
		{ value: "bug", label: "Bug Report" },
		{ value: "collaboration", label: "Collaboration" },
	];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/contact`,
				formData,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			setIsSubmitted(true);
			setTimeout(() => {
				setIsSubmitted(false);
				setFormData({
					name: "",
					email: "",
					subject: "",
					category: "general",
					message: "",
				});
			}, 5000);
		} catch (error) {
			console.error("Error submitting contact form:", error);
			alert(
				"There was an error submitting your message. Please try again later."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
				<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<FaPaperPlane className="w-8 h-8 text-blue-600" />
				</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">
					Message Sent!
				</h3>
				<p className="text-gray-600">
					Thank you for reaching out. We'll get back to you within 24
					hours.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Send us a Message
			</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Full Name <span className="text-red-600">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							placeholder="Your full name"
						/>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Email Address{" "}
							<span className="text-red-600">*</span>
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							placeholder="your.email@example.com"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Category
						</label>
						<select
							id="category"
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						>
							{categories.map((category) => (
								<option
									key={category.value}
									value={category.value}
								>
									{category.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor="subject"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Subject <span className="text-red-600">*</span>
						</label>
						<input
							type="text"
							id="subject"
							name="subject"
							value={formData.subject}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							placeholder="Brief description of your inquiry"
						/>
					</div>
				</div>
				<div>
					<label
						htmlFor="message"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Message <span className="text-red-600">*</span>
					</label>
					<textarea
						id="message"
						name="message"
						value={formData.message}
						onChange={handleChange}
						required
						rows={6}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
						placeholder="Please provide details about your inquiry..."
					/>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
				>
					{isSubmitting ? (
						<>
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>Sending...</span>
						</>
					) : (
						<>
							<FaPaperPlane className="w-4 h-4" />
							<span>Send Message</span>
						</>
					)}
				</button>
			</form>
		</div>
	);
}
