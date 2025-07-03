import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaMicrophone, FaArrowRight } from "react-icons/fa";

export default function Interview() {
  const { interviewId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [totalTime, setTotalTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/interview/${interviewId}`
        );
        setQuestions(res.data.questions);
        if (res.data.questions.length > 0) {
          speakQuestion(res.data.questions[0].question);
        }
      } catch (err) {
        showToast( err.message || "Failed to load questions.", "error");
      }
    };
    fetchQuestions();
  }, [interviewId]);

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(totalTimer);
  }, []);


  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: remainingSeconds.toString().padStart(2, "0"),
    };
  };

  const startRecording = () => {
    const recognition =
      new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e) => {
      setAnswer(e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  };

  const submitAnswer = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/${interviewId}/answer`,
        {
          questionId: currentQuestionIndex,
          answer,
        }
      );

      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setAnswer("");
        speakQuestion(questions[nextIndex].question);
      } else {
        showToast("Interview Completed!", "success");
        navigate(`/interview/report/${interviewId}`);
      }
    } catch (err) {
      showToast(err.message || "Failed to submit answer.", "error");
    }
  };

  const totalTimeFormatted = formatTotalTime(totalTime);
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview</h1>
          <p className="text-gray-600">
            Practice answering common interview questions in a simulated environment
          </p>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="mb-6">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={isRecording ? null : startRecording}
                className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaMicrophone
                  className={`w-4 h-4 ${
                    isRecording ? "text-red-500" : "text-gray-400"
                  }`}
                />
                <span>{isRecording ? "Recording..." : "Record Answer"}</span>
              </button>

              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {currentQuestionIndex >= questions.length - 1
                    ? "Finish"
                    : "Next Question"}
                </span>
                <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalTimeFormatted.hours}
            </div>
            <div className="text-sm text-gray-600">Hours</div>
          </div>
          <div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalTimeFormatted.minutes}
            </div>
            <div className="text-sm text-gray-600">Minutes</div>
          </div>
          <div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalTimeFormatted.seconds}
            </div>
            <div className="text-sm text-gray-600">Seconds</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
