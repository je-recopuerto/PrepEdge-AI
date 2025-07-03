import jsPDF from 'jspdf';
import 'jspdf-autotable';

const downloadPDF = async({report, interview}) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  const pageHeight = 297;
  const footerHeight = 20;
  const usableHeight = pageHeight - footerHeight;
  
  // Colors matching the website theme
  const primaryBlue = [59, 130, 246]; // blue-500
  const primaryGreen = [16, 185, 129]; // green-500
  const darkGray = [31, 41, 55]; // gray-800
  const lightGray = [156, 163, 175]; // gray-400
  const bgGray = [249, 250, 251]; // gray-50

  let y = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace) => {
    if (y + requiredSpace > usableHeight - 30) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // Helper function to add text with proper wrapping and page breaks
  const addWrappedText = (text, x, startY, maxWidth, fontSize = 9, fontStyle = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = startY;
    
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page for this line
      if (currentY + 4 > usableHeight - 30) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(lines[i], x, currentY);
      currentY += 4;
    }
    
    return currentY;
  };

  // Header with branding
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company name and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PrepEdge AI", margin + 12, 15);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Interview Report", pageWidth - margin, 15, { align: "right" });
  
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin, 25, { align: "right" });

  y = 50;

  // Interview Details Section
  doc.setTextColor(...darkGray);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Details:", margin, y);
  
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 40, y + 2);
  
  y += 12;
  
  // Interview details data
  const interviewDetails = [
    { label: "Interview Name:", value: interview.interview_name || "Not Mentioned" },
    { label: "Date:", value: interview.created_at ? new Date(interview.created_at).toLocaleDateString() : "Not Mentioned" },
    { label: "Role & Experience:", value: interview.role || "Senior Frontend Developer" },
    { label: "Company Name:", value: interview.company_name || "Tech Company Inc." },
    { label: "Duration:", value: report.duration || "45 minutes" },
    { label: "Interview Type:", value: interview.interview_type || "Technical & Behavioral" }
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  interviewDetails.forEach((detail, index) => {
    checkPageBreak(8);
    
    if (index % 2 === 0) {
      doc.setFillColor(...bgGray);
      doc.rect(margin, y - 3, contentWidth, 8, 'F');
    }
    
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.text(detail.label, margin + 2, y);
    
    doc.setFont("helvetica", "normal");
    // Wrap long values
    const valueLines = doc.splitTextToSize(detail.value, contentWidth - 50);
    doc.text(valueLines[0], margin + 45, y);
    
    if (valueLines.length > 1) {
      for (let i = 1; i < valueLines.length; i++) {
        y += 4;
        checkPageBreak(4);
        doc.text(valueLines[i], margin + 45, y);
      }
    }
    
    y += 8;
  });

  y += 10;

  // Summary Metrics Section
  checkPageBreak(35);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary Metrics:", margin, y);
  doc.setDrawColor(...primaryBlue);
  doc.line(margin, y + 2, margin + 45, y + 2);
  
  y += 12;
  
  const metrics = [
    { label: "Overall Score", value: report.finalScore || "85%", color: primaryGreen }
  ];

  const boxWidth = (contentWidth - 20) / 3;
  let xPos = margin;

  metrics.forEach((metric) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...lightGray);
    doc.rect(xPos, y, boxWidth, 20, 'FD');
    
    doc.setTextColor(...metric.color);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value.toString(), xPos + boxWidth/2, y + 10, { align: "center" });
    
    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, xPos + boxWidth/2, y + 16, { align: "center" });
    
    xPos += boxWidth + 10;
  });

  y += 35;

  const toArray = (value) =>
  Array.isArray(value) ? value : (typeof value === "string" ? [value] : []);
  // Areas for Improvement & Strengths
  const sections = [
    {
      title: "Summary:",
      items: toArray(report.summary) || [
        "You did a great job in the interview, scoring above average.",
        "Your communication skills were impressive, and you handled technical questions well.",
        "However, there are some areas where you can improve to perform even better in future interviews."
      ]
    },
    {
      title: "Areas for Improvement:",
      items: toArray(report.areaOfImprovement) || [
        "You seemed to be perfectly fine, as our AI did not find any major areas of improvement.",
        "However, you can always improve your problem-solving skills by practicing more coding challenges.",
      ]
    },
    {
      title: "Strengths:",
      items: toArray(report.strengths) || [
        "You must have been really poor, as our AI did not find any major strengths.",
        "However, you can always improve your communication skills by practicing more mock interviews.",
      ]
    }
  ];

  sections.forEach(section => {
    checkPageBreak(15);
    
    doc.setTextColor(...darkGray);
    doc.setDrawColor(...primaryBlue);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    doc.line(margin, y + 2, margin + doc.getTextWidth(section.title), y + 2);
    
    y += 10;
    
    section.items.forEach(item => {
      checkPageBreak(10);
      y = addWrappedText(`• ${item}`, margin + 5, y, contentWidth - 10, 9, "normal");
      y += 4;
    });
    
    y += 8;
  });

  // Answer Analysis Section
  checkPageBreak(20);

  doc.setTextColor(...darkGray);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Answer Analysis:", margin, y);
  doc.line(margin, y + 2, margin + 40, y + 2);
  
  y += 15;

  // Questions and answers
  if (report.answers && report.answers.length > 0) {
    report.answers.forEach((answer, index) => {
      // Estimate space needed for this question block
      const questionLines = doc.splitTextToSize(`Q${index + 1}. ${answer.question}`, contentWidth - 4);
      const answerLines = doc.splitTextToSize(answer.userAnswer || "No answer provided", contentWidth - 10);
      const feedbackLines = answer.feedback ? doc.splitTextToSize(answer.feedback, contentWidth - 10) : [];
      
      const estimatedHeight = (questionLines.length * 4) + (answerLines.length * 4) + (feedbackLines.length * 4) + 30;
      
      checkPageBreak(estimatedHeight);

      // Question with proper text wrapping
      doc.setFillColor(...bgGray);
      doc.rect(margin, y - 3, contentWidth, 8, 'F');
      
      doc.setTextColor(...darkGray);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      
      // Wrap question text properly
      const wrappedQuestion = doc.splitTextToSize(`Q${index + 1}. ${answer.question}`, contentWidth - 4);
      let questionY = y;
      
      wrappedQuestion.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
          questionY += 4;
          checkPageBreak(4);
        }
        doc.text(line, margin + 2, questionY);
      });
      
      y = questionY + 12;

      // User Answer
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Your Answer:", margin + 5, y);
      
      y += 6;
      
      // Add user answer with proper wrapping and page breaks
      y = addWrappedText(answer.userAnswer || "No answer provided", margin + 5, y, contentWidth - 10, 9, "normal");
      y += 8;

      // Score and Feedback on same line - Score on right, Feedback on left
      if (answer.score || answer.feedback) {
        checkPageBreak(8);
        
        // Feedback heading on left
        if (answer.feedback) {
          doc.setTextColor(...darkGray);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("Feedback:", margin + 5, y);
        }
        
        // Score on right
        if (answer.score) {
          doc.setTextColor(...primaryGreen);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(`Score: ${answer.score}`, pageWidth - margin, y, { align: "right" });
        }
        
        y += 8;
        
        // Feedback content
        if (answer.feedback) {
            doc.setTextColor(...darkGray);
          y = addWrappedText(answer.feedback, margin + 5, y, contentWidth - 10, 9, "normal");
        }
      }
      
      y += 15;
    });
  }

  // Footer for all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(...lightGray);
    doc.line(margin, usableHeight, pageWidth - margin, usableHeight);
    
    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("PrepEdge AI", margin, usableHeight + 8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, usableHeight + 8, { align: "right" });
    doc.text(`Report ID: ${report.id || 'RPT-' + Date.now()}`, pageWidth/2, usableHeight + 8, { align: "center" });
  }

  doc.save(`PrepEdge-AI-Interview-Report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export default downloadPDF;