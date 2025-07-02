"use client"

import { useState } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"

export default function QuestionReview({
  questionNumber,
  question,
  userAnswer,
  preferredAnswer,
  score,
  feedback,
  defaultExpanded = false,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={toggleExpanded}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">
          Question {questionNumber}: {question}
        </span>
        {isExpanded ? (
          <FaChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          {userAnswer && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
              <p className="text-sm text-gray-600 leading-relaxed">{userAnswer}</p>
            </div>
          )}

          {preferredAnswer && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Preferred Answer:</h5>
              <p className="text-sm text-gray-600 leading-relaxed">{preferredAnswer}</p>
            </div>
          )}

          {score && (
              <div>
                <span className="font-medium text-gray-900">Score: </span>
                <span className="text-sm font-bold text-green-600">{score}</span>
              </div>
          )}

          {feedback && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Feedback:</h5>
              <p className="text-sm text-gray-600 leading-relaxed">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
