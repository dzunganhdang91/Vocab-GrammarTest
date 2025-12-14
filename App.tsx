import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { QUESTIONS } from './constants';
import { Question, Section, GrammarArea, TestState } from './types';

// The confirmed external image URL (Stable)
const NAGUMO_IMAGE_URL = "https://i.postimg.cc/g0z5TD8p/YOICHI.png"; 

// --- Helper Functions ---

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Function to convert time in seconds to mm:ss format
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// FIX for 'undefined' label (TENSES_FUTURE)
const getGrammarAreaLabel = (area: GrammarArea | undefined): string => {
    if (!area) return 'Unknown Area';
    if (area === GrammarArea.TENSES_FUTURE) return 'Verb Tenses'; // Renamed
    return area;
};

// --- Sub-components (IntroScreen, TestScreen, ResultScreen) ---

const IntroScreen: React.FC<{
  onStart: (withTimer: boolean, name: string) => void;
}> = ({ onStart }) => {
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [name, setName] = useState('');

  const handleStart = () => {
    if (!name.trim()) {
      alert("Please enter your name to begin.");
      return;
    }
    onStart(timerEnabled, name);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100">
        <div className="flex justify-center mb-8">
           <div className="w-24 h-24 bg-nagumo-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
             <span className="text-2xl">🎲</span>
           </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4 tracking-tight uppercase">
          Vocab and Grammar Assessment
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Determine your English skills with this comprehensive entry-level test covering 
          <span className="font-semibold text-nagumo-600"> Vocabulary</span> and 
          <span className="font-semibold text-nagumo-600"> Grammar</span>.
        </p>

        <div className="mb-8">
          <label htmlFor="student-name" className="block text-gray-700 text-sm font-bold mb-2">
            Enter your name to begin
          </label>
          <input
            type="text"
            id="student-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nagumo-500 focus:border-transparent transition text-lg"
          />
        </div>

        <div className="bg-nagumo-50 rounded-xl p-6 mb-8 border border-nagumo-100">
          <h3 className="font-bold text-nagumo-900 mb-3 text-lg">Test Details</h3>
          <ul className="space-y-2 text-nagumo-800">
            <li className="flex items-center"><span className="mr-2">📚</span> 50 Vocabulary Questions</li>
            <li className="flex items-center"><span className="mr-2">✍️</span> 50 Grammar Questions</li>
            <li className="flex items-center"><span className="mr-2">⏱️</span> Optional 50-minute timer</li>
          </ul>
        </div>

        <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label htmlFor="timer-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                id="timer-toggle" 
                className="sr-only" 
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${timerEnabled ? 'bg-nagumo-600' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${timerEnabled ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 font-medium text-gray-700">Enable 50-minute Timer</span>
          </label>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-nagumo-600 hover:bg-nagumo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 focus:ring-4 focus:ring-nagumo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name.trim()}
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
};

const TestScreen: React.FC<{
  testState: TestState;
  setTestState: React.Dispatch<React.SetStateAction<TestState>>;
  onSubmit: () => void;
}> = ({ testState, setTestState, onSubmit }) => {
  const [activeSection, setActiveSection] = useState<Section>(Section.VOCABULARY);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const shuffledOptionsMap = useMemo(() => {
    const map: { [key: string]: [string, string][] } = {};
    if (Array.isArray(QUESTIONS)) {
        QUESTIONS.forEach(q => {
             // Null check added for safety during development
            if (typeof q.options === 'object' && q.options !== null) {
                const entries = Object.entries(q.options);
                map[q.id] = shuffleArray(entries);
            } else {
                map[q.id] = [];
            }
        });
    }
    return map;
  }, []);

  useEffect(() => {
    if (!testState.timerEnabled || testState.status !== 'active') return;

    const timer = setInterval(() => {
      setTestState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          return prev; 
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState.timerEnabled, testState.status, setTestState]);

  const handleAnswer = (questionId: string, option: string) => {
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option }
    }));
  };

  const extendTime = () => {
    if (testState.extensionsUsed >= 3) return;
    setTestState(prev => ({
      ...prev,
      timeRemaining: prev.timeRemaining + 600, // +10 mins
      extensionsUsed: prev.extensionsUsed + 1
    }));
  };

  const currentQuestions = QUESTIONS.filter(q => q.section === activeSection);
  const progress = (Object.keys(testState.answers).length / QUESTIONS.length) * 100;
  const isTimeCritical = testState.timerEnabled && testState.timeRemaining < 300; // < 5 mins
  const answeredCount = Object.keys(testState.answers).length;
  const totalQuestions = QUESTIONS.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-800 hidden sm:block uppercase tracking-tight">Vocab & Grammar</div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setActiveSection(Section.VOCABULARY)}
                className={`px-4 py-1 rounded-md text-sm font-medium transition ${activeSection === Section.VOCABULARY ? 'bg-white shadow text-nagumo-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Vocabulary
              </button>
              <button 
                onClick={() => setActiveSection(Section.GRAMMAR)}
                className={`px-4 py-1 rounded-md text-sm font-medium transition ${activeSection === Section.GRAMMAR ? 'bg-white shadow text-nagumo-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Grammar
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             {testState.timerEnabled && (
               <div className={`font-mono text-xl font-bold ${isTimeCritical ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                 {formatTime(testState.timeRemaining)}
               </div>
             )}
             <button 
               onClick={() => setShowSubmitModal(true)}
               className="bg-nagumo-600 hover:bg-nagumo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition"
             >
               Submit
             </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div className="bg-nagumo-500 h-1 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Timer Extension Button (Floating/Contextual) */}
      {testState.timerEnabled && testState.extensionsUsed < 3 && (
        <div className="fixed bottom-6 right-6 z-30">
           <button 
             onClick={extendTime}
             className="flex items-center bg-white border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-bold py-3 px-5 rounded-full shadow-lg transition transform hover:scale-105"
           >
             <span className="mr-2 text-xl">+</span> 10 Mins ({3 - testState.extensionsUsed} left)
           </button>
        </div>
      )}

      {/* Questions List */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
          {activeSection} Section
        </h2>
        {currentQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-nagumo-200 transition">
             <div className="flex items-start mb-4">
               <span className="flex-shrink-0 bg-nagumo-100 text-nagumo-800 text-xs font-bold px-2 py-1 rounded mt-1 mr-3">
                 {q.id}
               </span>
               <p className="text-lg text-gray-800 font-medium leading-relaxed">{q.text}</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-10">
               {shuffledOptionsMap[q.id]?.map(([key, value]) => (
                 <label 
                   key={key} 
                   className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                     testState.answers[q.id] === key 
                       ? 'bg-nagumo-50 border-nagumo-500 ring-1 ring-nagumo-500' 
                       : 'border-gray-200 hover:bg-gray-50'
                   }`}
                 >
                   <input 
                     type="radio" 
                     name={q.id} 
                     value={key} 
                     checked={testState.answers[q.id] === key}
                     onChange={() => handleAnswer(q.id, key)}
                     className="w-4 h-4 text-nagumo-600 border-gray-300 focus:ring-nagumo-500"
                   />
                   <span className="ml-3 text-gray-700">
                     {value}
                   </span>
                 </label>
               ))}
             </div>
          </div>
        ))}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
             <div className="text-center mb-6">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-nagumo-100 mb-4">
                 <span className="text-2xl">📝</span>
               </div>
               <h3 className="text-lg leading-6 font-medium text-gray-900">Finish Assessment?</h3>
               <div className="mt-2">
                 <p className="text-sm text-gray-500">
                   {testState.studentName}, you have answered <span className="font-bold text-nagumo-600">{answeredCount}</span> out of <span className="font-bold text-gray-900">{totalQuestions}</span> questions.
                 </p>
                 {answeredCount < totalQuestions && (
                   <p className="text-sm text-red-500 mt-2 font-medium">
                     You still have {totalQuestions - answeredCount} unanswered questions!
                   </p>
                 )}
               </div>
             </div>
             <div className="flex justify-end space-x-3">
               <button
                 onClick={() => setShowSubmitModal(false)}
                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
               >
                 Continue Testing
               </button>
               <button
                 onClick={onSubmit}
                 className="px-4 py-2 bg-nagumo-600 text-white rounded-lg hover:bg-nagumo-700 font-medium shadow-lg transition"
               >
                 Submit Now
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultScreen: React.FC<{
  answers: { [id: string]: string };
  onRetry: () => void;
  studentName: string;
  // NOTE: timeTaken is required for the full printing feature
  timeTaken: number; 
}> = ({ answers, onRetry, studentName, timeTaken = 0 }) => {
    
  const reportRef = useRef(null); // Ref for the printable area

  // --- Calculation Logic ---
  
  const calculateScore = (section: Section) => {
    const sectionQuestions = QUESTIONS.filter(q => q.section === section);
    let correct = 0;
    sectionQuestions.forEach(q => {
      if (answers[q.id] === q.correctOption) correct++;
    });
    return { correct, total: sectionQuestions.length };
  };

  const vocabScore = calculateScore(Section.VOCABULARY);
  const grammarScore = calculateScore(Section.GRAMMAR);
  
  // Approximate Cambridge Levels
  const getLevel = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage < 20) return 'A1';
    if (percentage < 40) return 'A2';
    if (percentage < 60) return 'B1';
    if (percentage < 80) return 'B2';
    if (percentage < 90) return 'C1';
    return 'C2';
  };

  const vocabLevel = getLevel(vocabScore.correct, vocabScore.total);
  const grammarLevel = getLevel(grammarScore.correct, grammarScore.total);

  const getIeltsScore = (level: string) => {
    switch(level) {
      case 'A1': return '2.0 - 2.5';
      case 'A2': return '3.0 - 3.5';
      case 'B1': return '4.0 - 5.0';
      case 'B2': return '5.5 - 6.5';
      case 'C1': return '7.0 - 8.0';
      case 'C2': return '8.5 - 9.0';
      default: return '0';
    }
  };

  // Grammar Areas Analysis (Updated to use the fixed label)
  const grammarAnalysis = useMemo(() => {
    const areas: { [key: string]: { correct: number, total: number } } = {};
    const grammarQuestions = QUESTIONS.filter(q => q.section === Section.GRAMMAR);
    
    grammarQuestions.forEach(q => {
      const areaKey = getGrammarAreaLabel(q.grammarArea); // Use the fixed label here
      if (!areas[areaKey]) areas[areaKey] = { correct: 0, total: 0 };
      areas[areaKey]!.total++;
      if (answers[q.id] === q.correctOption) areas[areaKey]!.correct++;
    });

    return Object.entries(areas).map(([area, stats]) => ({
      area,
      percentage: (stats.correct / stats.total) * 100
    })).sort((a, b) => a.percentage - b.percentage); // Lowest first
  }, [answers]);

  // Nagumo Comments Generation (Updated to use the fixed label)
  const getNagumoComment = () => {
    const totalPercentage = ((vocabScore.correct + grammarScore.correct) / 100) * 100;
    // Use the processed analysis list for weak areas
    const weakGrammarAreas = grammarAnalysis.filter(a => a.percentage < 60).map(a => a.area);
    
    // Personalize with Name
    let comment = `Listen up, ${studentName || 'student'}. Here is your evaluation. `;
    
    // Intro
    if (totalPercentage > 90) comment += "Excellent work. You've demonstrated a command of the language that rivals native speakers. ";
    else if (totalPercentage > 75) comment += "Very impressive. You have a solid grasp of complex structures, though minor refinements are possible. ";
    else if (totalPercentage > 50) comment += "A solid effort. You have the foundations, but there are specific gaps we need to address to reach the next level. ";
    else comment += "We have work to do. The foundation is shaky, but with consistent practice, improvement is inevitable. ";

    // Vocab Specific
    comment += `\n\nRegarding Vocabulary (${vocabLevel}): `;
    if (vocabLevel === 'C2' || vocabLevel === 'C1') comment += "Your lexical resource is sophisticated. You handled abstract concepts and nuance effectively.";
    else if (vocabLevel === 'B2' || vocabLevel === 'B1') comment += "You manage standard communication well, but struggle slightly with lower-frequency academic terms.";
    else comment += "We need to build your core lexicon. Focus on high-frequency academic word lists first.";

    // Grammar Specific
    comment += `\n\nRegarding Grammar (${grammarLevel}): `;
    if (weakGrammarAreas.length === 0) {
      comment += "I can find no significant structural weaknesses. Your accuracy is commendable.";
    } else {
      comment += "Pay close attention to these areas: " + weakGrammarAreas.slice(0, 3).join(", ") + ". " + (weakGrammarAreas.length > 3 ? "Among others. " : "") + "Reviewing the rules governing these structures is your next homework.";
    }

    return comment;
  };

  // PDF Generation function (re-implemented)
  const handlePrintToPDF = () => {
    const input = reportRef.current;
    if (!input) return;

    if (input instanceof HTMLElement) {
        input.classList.add('report-print-mode');
    }
    
    // @ts-ignore
    window.html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      // @ts-ignore
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Assessment_Report_${studentName.replace(/\s+/g, '_')}.pdf`);
      
      if (input instanceof HTMLElement) {
        input.classList.remove('report-print-mode'); // Clean up class
      }
    });
  };

  // NEW Component: Printable Report for Print Formatting (Question Breakdown)
  const PrintableReport: React.FC = () => (
    <div ref={reportRef} className="printable-report-container p-6 bg-white max-w-4xl mx-auto shadow-none">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">English Assessment Report</h1>
        <p className="text-lg text-gray-600 mb-6 border-b pb-4">
            Student: <span className="font-semibold">{studentName}</span> | 
            Time Taken: <span className="font-semibold">{formatTime(timeTaken)}</span> | 
            Date: {new Date().toLocaleDateString()}
        </p>

        {/* 1. Summary of Results (Keep original design for the summary) */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-6">1. Summary of Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 border rounded-lg bg-blue-50">
                <p className="font-bold text-lg text-blue-700">Vocabulary Score: {vocabScore.correct}/{vocabScore.total}</p>
                <p className="text-sm">Cambridge Level: <span className="font-bold">{vocabLevel}</span></p>
                <p className="text-sm">IELTS Equivalent: <span className="font-bold">{getIeltsScore(vocabLevel)}</span></p>
            </div>
            <div className="p-4 border rounded-lg bg-indigo-50">
                <p className="font-bold text-lg text-indigo-700">Grammar Score: {grammarScore.correct}/{grammarScore.total}</p>
                <p className="text-sm">Cambridge Level: <span className="font-bold">{grammarLevel}</span></p>
                <p className="text-sm">IELTS Equivalent: <span className="font-bold">{getIeltsScore(grammarLevel)}</span></p>
            </div>
        </div>

        {/* 2. Nagumo Comments */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">2. Nagumo Yoichi's Evaluation</h2>
        {/* ... (Omitted Nagumo image/comment block for brevity, assuming it remains the same) ... */}
        <div className="flex flex-col md:flex-row mb-8 border border-nagumo-200 rounded-lg overflow-hidden">
             <div className="w-full md:w-2/5 relative min-h-[250px] overflow-hidden">
                <img src={NAGUMO_IMAGE_URL} alt="Nagumo Yoichi" className="w-full h-full object-cover object-top" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h4 className="font-bold text-xl text-white">Nagumo Yoichi</h4>
                    <p className="text-sm text-gray-300 uppercase tracking-wider font-semibold">Student Council</p>
                </div>
            </div>
            <div className="w-full md:w-3/5 p-6 bg-gray-50 italic text-gray-700 whitespace-pre-wrap">
                {getNagumoComment()}
            </div>
        </div>

        {/* 3. FULL QUESTION BREAKDOWN (New Requirement) */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 break-before-page">3. Full Question Breakdown</h2>
        
        {QUESTIONS.map((q) => {
            const isCorrect = answers[q.id] === q.correctOption;
            const userSelection = answers[q.id] ? q.options[answers[q.id]] : "No Answer";
            const correctSelection = q.options[q.correctOption];
            
            // New Tag Logic: Grammar Area or Vocab Level
            const educationalTag = q.section === Section.GRAMMAR 
                ? getGrammarAreaLabel(q.grammarArea) 
                : `Vocab Level ${vocabLevel}`; // Uses the overall calculated level for VQs

            return (
                <div key={q.id} className={`break-inside-avoid border-l-4 p-4 mb-4 rounded-r-lg shadow-sm print:shadow-none ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                    
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-base text-gray-900">{q.id}. {q.text}</p>
                        {/* The new educational tag */}
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ml-3 uppercase tracking-wider ${
                            q.section === Section.GRAMMAR ? 'bg-indigo-200 text-indigo-800' : 'bg-blue-200 text-blue-800'
                        }`}>
                            {educationalTag}
                        </span>
                    </div>
                    
                    <div className="text-sm border-t pt-2 mt-2">
                        {/* Student Answer */}
                        <p className="mb-1">
                            <span className="font-bold mr-1">Your Answer:</span>
                            <span className={`px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {userSelection}
                            </span>
                        </p>
                        
                        {/* Correct Answer (Key Highlighted) */}
                        <p className="mb-1">
                            <span className="font-bold mr-1">Correct Answer:</span>
                            <span className="px-2 py-0.5 rounded font-bold bg-green-200 text-green-800">
                                {correctSelection}
                            </span>
                        </p>
                    </div>

                    {q.explanation && (
                        <p className="text-xs text-gray-600 italic mt-3 border-t pt-2">
                            <span className="font-bold not-italic text-nagumo-700">Explanation: </span>
                            {q.explanation}
                        </p>
                    )}
                </div>
            );
        })}
    </div>
  );

  // Main Result Screen rendering (Visible to User)
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Results */}
        {/* ... (Omitted Header Results for brevity, assuming it remains the same) ... */}
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-800 text-white p-6 text-center">
             <h2 className="text-3xl font-bold">Assessment Results for {studentName}</h2>
             <p className="opacity-80">Here is the breakdown of your performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
             <div className="p-8 flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Vocabulary</h3>
                <div className="text-5xl font-extrabold text-blue-600 mb-2">{vocabScore.correct}/50</div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">Level {vocabLevel}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">IELTS ~{getIeltsScore(vocabLevel)}</span>
                </div>
             </div>
             <div className="p-8 flex flex-col items-center">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Grammar</h3>
                <div className="text-5xl font-extrabold text-indigo-600 mb-2">{grammarScore.correct}/50</div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold text-sm">Level {grammarLevel}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">IELTS ~{getIeltsScore(grammarLevel)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* PDF BUTTON */}
        <div className="text-center">
            <button 
               onClick={handlePrintToPDF}
               className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 focus:ring-4 focus:ring-red-300 flex items-center mx-auto"
            >
               <span className="mr-2">🖨️</span> Export Full Report (PDF)
            </button>
        </div>

        {/* Nagumo Yoichi Feedback Card */}
        {/* ... (Omitted Nagumo Feedback Card for brevity, keeping only the new breakdown) ... */}

        {/* Detailed Analysis (Grammar Focus Areas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
             <h3 className="text-xl font-bold text-gray-800 mb-6">Grammar Focus Areas</h3>
             <div className="space-y-4">
               {grammarAnalysis.map((item) => (
                 <div key={item.area}>
                   <div className="flex justify-between text-sm font-medium mb-1">
                     <span className={item.percentage < 60 ? "text-red-600" : "text-gray-700"}>{item.area}</span>
                     <span className="text-gray-500">{Math.round(item.percentage)}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2.5">
                     <div 
                       className={`h-2.5 rounded-full ${item.percentage < 60 ? 'bg-red-500' : 'bg-green-500'}`} 
                       style={{ width: `${item.percentage}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
        
        {/* Render the full breakdown directly on the screen */}
        <PrintableReport />

        <div className="text-center pb-8">
          <button 
            onClick={onRetry}
            className="text-nagumo-600 hover:text-nagumo-800 font-semibold text-lg hover:underline"
          >
            Restart Assessment
          </button>
        </div>

      </div>
      
      {/* Hidden container is no longer needed since PrintableReport is rendered directly for print/PDF */}
      
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [testState, setTestState] = useState<TestState>({
    status: 'intro',
    timerEnabled: false,
    timeRemaining: 3000, // 50 mins default
    answers: {},
    extensionsUsed: 0,
    studentName: ''
  });
  
  // Track time taken specifically for the result screen
  const [timeTaken, setTimeTaken] = useState(0); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (testState.status === 'active') {
      // Start a timer that increments timeTaken every second
      timerRef.current = setInterval(() => {
        setTimeTaken(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      // Clear the timer when the test is submitted or restarted
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testState.status]);

  const startTest = (withTimer: boolean, name: string) => {
    // Reset timeTaken to 0 when starting a new test
    setTimeTaken(0); 
    setTestState({
      status: 'active',
      timerEnabled: withTimer,
      timeRemaining: 3000, // 50 mins = 3000 seconds
      answers: {},
      extensionsUsed: 0,
      studentName: name
    });
  };

  const submitTest = () => {
    setTestState(prev => ({ ...prev, status: 'finished' }));
    window.scrollTo(0, 0);
  };

  const restartTest = () => {
    setTestState({
      status: 'intro',
      timerEnabled: false,
      timeRemaining: 3000,
      answers: {},
      extensionsUsed: 0,
      studentName: ''
    });
  };

  return (
    // FIX: Re-implementing the CSS fix that prevents horizontal overflow
    <div className="max-w-full overflow-x-hidden">
      {testState.status === 'intro' && <IntroScreen onStart={startTest} />}
      {testState.status === 'active' && (
        <TestScreen 
          testState={testState} 
          setTestState={setTestState} 
          onSubmit={submitTest} 
        />
      )}
      {testState.status === 'finished' && (
        <ResultScreen 
          answers={testState.answers} 
          onRetry={restartTest} 
          studentName={testState.studentName}
          timeTaken={timeTaken} // Pass time taken for the report
        />
      )}
    </div>
  );
};

export default App;