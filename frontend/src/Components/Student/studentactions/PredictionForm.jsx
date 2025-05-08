import React, { useState } from "react";

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    Attendance: "",
    AssignmentScores: "",
    ExamScores: "",
    Participation: "",
    ExtraCurricular: "",
    StudyHoursPerWeek: "",
    TeacherRatings: "",
    SleepHoursPerNight: "",
    TechnologyUsageHours: "",
    MotivationalLevel: "",
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generatePrediction = (data) => {
    const {
      Attendance,
      AssignmentScores,
      ExamScores,
      Participation,
      ExtraCurricular,
      StudyHoursPerWeek,
      TeacherRatings,
      SleepHoursPerNight,
      TechnologyUsageHours,
      MotivationalLevel,
    } = data;

    const totalScore =
      parseFloat(Attendance) * 0.1 +
      parseFloat(AssignmentScores) * 0.15 +
      parseFloat(ExamScores) * 0.2 +
      parseFloat(Participation) * 0.1 +
      parseFloat(ExtraCurricular) * 0.05 +
      parseFloat(StudyHoursPerWeek) * 0.1 +
      parseFloat(TeacherRatings) * 0.1 +
      parseFloat(SleepHoursPerNight) * 0.05 +
      parseFloat(TechnologyUsageHours) * 0.05 +
      parseFloat(MotivationalLevel) * 0.1;

    if (totalScore >= 80) return "Outstanding";
    if (totalScore >= 60) return "Good";
    if (totalScore >= 40) return "Average";
    return "Below Average";
  };

  const generateFeedback = (predictedPerformance) => {
    switch (predictedPerformance) {
      case "Outstanding":
        return [
          "Keep up the excellent work!",
          "Maintain consistent attendance.",
          "Continue excelling in assignments and exams.",
        ];
      case "Good":
        return [
          "Keep up the good work!",
          "Improve participation in extracurricular activities.",
          "Focus more on exam preparation.",
        ];
      case "Average":
        return [
          "Try to improve attendance and study hours.",
          "Spend more time on assignments and exams.",
          "Consider increasing participation in extracurricular activities.",
        ];
      case "Below Average":
        return [
          "Improve attendance to stay consistent.",
          "Spend more time preparing for exams.",
          "Consider participating in extracurricular activities.",
          "Work on improving behavior and effort based on teacher feedback.",
          "Reduce non-educational technology usage.",
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Validate the input before processing
    if (Object.values(formData).some((val) => val === "" || isNaN(val) || parseFloat(val) < 0)) {
      alert("Please enter valid data for all fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate loading with timeout
    setTimeout(() => {
      // Generate prediction based on the input data
      const predictedPerformance = generatePrediction(formData);
      const feedback = generateFeedback(predictedPerformance);

      const resultData = {
        actualPerformance: "Pending",
        predictedPerformance,
        feedback,
      };

      // Store data in local storage
      try {
        localStorage.setItem("studentInput", JSON.stringify(formData));
        localStorage.setItem("predictionResult", JSON.stringify(resultData));
      } catch (error) {
        console.error("Error saving to local storage:", error);
      }

      setPredictionResult(resultData);
      setIsSubmitting(false);
      setShowResult(true);
    }, 1500); // 1.5 second delay for animation effect
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "Outstanding":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Average":
        return "text-yellow-600";
      case "Below Average":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6">
      {/* Form Container */}
      <div
        className={`bg-white rounded-lg shadow-lg p-8 w-full transition-all duration-500 ease-in-out transform ${
          showResult ? "scale-95 opacity-95" : "scale-100"
        }`}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Student Performance Prediction
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
              <div key={key} className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  placeholder={`Enter ${key}`}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </span>
            ) : (
              "Predict Performance"
            )}
          </button>
        </div>
      </div>

      {/* Results Container */}
      {showResult && predictionResult && (
        <div 
          className="w-full mt-8 bg-white rounded-lg shadow-lg p-8 animate-fadeIn transition-all duration-500 ease-in-out transform translate-y-0"
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Prediction Results
          </h3>
          
          <div className="mb-6 text-center">
            <p className="text-lg font-medium mb-2">Predicted Performance:</p>
            <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(predictionResult.predictedPerformance)}`}>
              {predictionResult.predictedPerformance}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-lg font-medium mb-4">Feedback & Recommendations:</p>
            <ul className="space-y-2">
              {predictionResult.feedback.map((item, index) => (
                <li 
                  key={index} 
                  className="flex items-start animate-slideIn"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <span className="inline-flex items-center justify-center bg-green-100 text-green-800 h-6 w-6 rounded-full mr-3 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setShowResult(false);
                setPredictionResult(null);
                setFormData({
                  Attendance: "",
                  AssignmentScores: "",
                  ExamScores: "",
                  Participation: "",
                  ExtraCurricular: "",
                  StudyHoursPerWeek: "",
                  TeacherRatings: "",
                  SleepHoursPerNight: "",
                  TechnologyUsageHours: "",
                  MotivationalLevel: "",
                });
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-all duration-300 transform hover:scale-105"
            >
              Start New Prediction
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideIn {
          opacity: 0;
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PredictionForm;