import {
	LineChart,
	Line,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
				<p className="font-semibold text-gray-900">
					{data.interviewName}
				</p>
				<p className="text-sm text-gray-600">{data.date}</p>
				<p className="text-sm font-medium text-blue-600">
					Score: {data.score}
				</p>
			</div>
		);
	}
	return null;
};

export default function ScoreTrendChart({
	chartData
}) {

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Score Trend
				</h3>

				{/* <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
					{periods.map((period) => (
						<button
							key={period}
							onClick={() => setSelectedPeriod(period)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								selectedPeriod === period
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{period}
						</button>
					))}
				</div> */}
			</div>

			{/* <div className="mb-6">
				<div className="text-3xl font-bold text-gray-900 mb-1">
					{currentScore}
				</div>
				<div className="text-sm text-gray-600">
					{timeframe}{" "}
					<span
						className={`font-medium ${
							percentageChange >= 0
								? "text-green-600"
								: "text-red-600"
						}`}
					>
						{percentageChange >= 0 ? "+" : ""}
						{percentageChange}%
					</span>
				</div>
			</div> */}

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
						<YAxis
							domain={["dataMin - 5", "dataMax + 7"]}
							axisLine={false}
							tickLine={false}
							tick={{ fontSize: 12, fill: "#6b7280" }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey="score"
							stroke="#6366f1"
							strokeWidth={3}
							dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
							activeDot={{
								r: 6,
								stroke: "#6366f1",
								strokeWidth: 2,
								fill: "#ffffff",
							}}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
