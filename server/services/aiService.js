import { InferenceClient } from "@huggingface/inference";

if (!process.env.HUGGING_FACE_API_KEY) {
  throw new Error("Missing Hugging Face API Key in environment");
}
const hf = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

const generateQuestions = async ({
  num_of_questions,
  interview_type,
  role,
  experience_level,
  company_name,
  company_description,
  job_description,
  focus_area,
}) => {
  const prompt = `You are an expert technical interviewer and HR professional.

Generate ${num_of_questions} well-structured, high-quality ${
    interview_type === "mixed" ? "technical and behavioral" : interview_type
  } interview questions for a ${experience_level} ${role} role at ${
    company_name || "PrepEdge AI"
  }.

Company Description:
${company_description || "No company description provided."}

Job Description:
${job_description || "No job description provided."}

Focus Areas:
${focus_area || "No specific focus areas provided."}

Instructions:
- Ensure each question is relevant to the role and job description.
- Tailor questions to a ${experience_level} level candidate.
- Base questions on the specified focus areas where applicable.
- Design questions for a ${
      interview_type === "mixed" ? "technical and behavioral" : interview_type
    } interview round.
- Keep questions clear, concise, and numbered (e.g., 1., 2., 3.).
- For each question, provide a brief, ideal preferred answer (1-2 sentences) immediately following the question, prefixed with "Preferred Answer:" on a new line.
- Output the questions and answers as a numbered list with each question and its preferred answer on separate lines, ensuring the preferred answer is complete before moving to the next question.

Example:
1. What is a linked list?
   Preferred Answer: A linked list is a linear data structure where each element is a node containing data and a reference to the next node, allowing dynamic size adjustments.

2. How do you handle exceptions in Python?
   Preferred Answer: In Python, exceptions are handled using try-except blocks, where code prone to errors is placed in a try block and handled in an except block with specific error types.
`;

  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    const generatedText = response.choices[0].message.content;
    // console.log("---------------\nAI response:", generatedText, "\n---------------");

    const questions = [];
    const lines = generatedText.split("\n");
    let currentQuestion = null;
    let collectingAnswer = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (/^\d+\.\s/.test(line)) {
        if (currentQuestion && currentQuestion.preferred_answer) {
          questions.push(currentQuestion); // Push completed question
        }
        currentQuestion = { question: line.replace(/^\d+\.\s/, "").trim(), preferred_answer: "" };
        collectingAnswer = true;
      } else if (collectingAnswer && line.startsWith("Preferred Answer:")) {
        currentQuestion.preferred_answer = line.replace("Preferred Answer:", "").trim();
        collectingAnswer = false; // Stop collecting after capturing the answer
      } else if (collectingAnswer && currentQuestion && !currentQuestion.preferred_answer && line.trim()) {
        // Append to preferred_answer if it spans multiple lines
        currentQuestion.preferred_answer += (currentQuestion.preferred_answer ? " " : "") + line.trim();
      }

      if (questions.length === num_of_questions - 1 && currentQuestion && currentQuestion.preferred_answer) {
        questions.push(currentQuestion); // Push the last question
        break;
      }
    }

    if (currentQuestion && !questions.includes(currentQuestion) && currentQuestion.preferred_answer) {
      questions.push(currentQuestion); // Ensure the last question is added
    }

    if (questions.length < num_of_questions) {
      throw new Error(`Only ${questions.length} valid questions generated, expected ${num_of_questions}`);
    }

    return questions;
  } catch (error) {
    // console.error("Error Object:", error);
    throw new Error(
      `Error generating questions: ${error?.message || JSON.stringify(error)}`
    );
  }
};

export default generateQuestions;