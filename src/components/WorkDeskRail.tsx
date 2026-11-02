import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Sparkles,
  Settings,
  Library,
  Trash2,
  Edit3,
  CheckCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { ExamPaper, Question, QuestionType, CQSubQuestion, MCQOption } from '../types';
import { toBengaliDigits, defaultInstructions } from '../utils/bengaliUtils';
import { presetTemplates } from '../data/presetTemplates';

interface WorkDeskRailProps {
  paper: ExamPaper;
  setPaper: React.Dispatch<React.SetStateAction<ExamPaper>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
}

export const WorkDeskRail: React.FC<WorkDeskRailProps> = ({
  paper,
  setPaper,
  activeTab,
  setActiveTab,
  editingQuestionId,
  setEditingQuestionId,
}) => {
  // New Question Form State
  const [qType, setQType] = useState<QuestionType>('cq');
  const [qTitle, setQTitle] = useState('');
  const [qStimulus, setQStimulus] = useState('');
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState<number>(10);
  const [qMarksBn, setQMarksBn] = useState('১০');
  const [qAnswerHint, setQAnswerHint] = useState('');

  // Sub-questions for CQ
  const [subQuestions, setSubQuestions] = useState<CQSubQuestion[]>([
    { key: 'ক', text: '', marks: 1, marksBn: '১', cognitiveLevel: 'জ্ঞানমূলক' },
    { key: 'খ', text: '', marks: 2, marksBn: '২', cognitiveLevel: 'অনুধাবনমূলক' },
    { key: 'গ', text: '', marks: 3, marksBn: '৩', cognitiveLevel: 'প্রয়োগমূলক' },
    { key: 'ঘ', text: '', marks: 4, marksBn: '৪', cognitiveLevel: 'উচ্চতর দক্ষতা' },
  ]);

  // Options for MCQ
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>([
    { label: 'ক', text: '', isCorrect: true },
    { label: 'খ', text: '', isCorrect: false },
    { label: 'গ', text: '', isCorrect: false },
    { label: 'ঘ', text: '', isCorrect: false },
  ]);

  // Matching pairs
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
  ]);

  // AI Generator State
  const [aiSubject, setAiSubject] = useState(paper.header.subject || 'বাংলা প্রথম পত্র');
  const [aiClass, setAiClass] = useState(paper.header.gradeClass || 'দশম শ্রেণি');
  const [aiChapter, setAiChapter] = useState('যেকোনো গুরুত্বপূর্ণ অধ্যায়');
  const [aiQType, setAiQType] = useState<QuestionType>('cq');
  const [aiCount, setAiCount] = useState<number>(2);
  const [aiDifficulty, setAiDifficulty] = useState('মধ্যম');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedAiQuestions, setGeneratedAiQuestions] = useState<Question[]>([]);

  // Switch form to edit mode if editingQuestionId is set
  React.useEffect(() => {
    if (editingQuestionId) {
      const q = paper.questions.find((item) => item.id === editingQuestionId);
      if (q) {
        setQType(q.type);
        setQTitle(q.title || '');
        setQStimulus(q.stimulus || '');
        setQText(q.text || '');
        setQMarks(q.marks || (q.type === 'cq' ? 10 : 1));
        setQMarksBn(q.marksBn || toBengaliDigits(q.marks));
        setQAnswerHint(q.answerHint || '');
        if (q.subQuestions && q.subQuestions.length > 0) {
          setSubQuestions(q.subQuestions);
        }
        if (q.options && q.options.length > 0) {
          setMcqOptions(q.options);
        }
        if (q.matchingPairs && q.matchingPairs.length > 0) {
          setMatchingPairs(q.matchingPairs);
        }
        setActiveTab('add');
      }
    }
  }, [editingQuestionId, paper.questions, setActiveTab]);

  // Save Question (Add new or Update existing)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    let newQuestion: Question;
    const currentNumber = editingQuestionId
      ? paper.questions.find((q) => q.id === editingQuestionId)?.numberBn ||
        toBengaliDigits(paper.questions.length)
      : toBengaliDigits(paper.questions.length + 1);

    if (qType === 'cq') {
      const totalCQMarks = subQuestions.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
      newQuestion = {
        id: editingQuestionId || 'q-' + Date.now(),
        type: 'cq',
        numberBn: currentNumber,
        title: qTitle,
        stimulus: qStimulus,
        text: qText || 'উদ্দীপকের আলোকে নিচের প্রশ্নগুলোর উত্তর দাও:',
        marks: totalCQMarks || 10,
        marksBn: toBengaliDigits(totalCQMarks || 10),
        subQuestions: subQuestions.filter((s) => s.text.trim() !== ''),
        answerHint: qAnswerHint,
      };
    } else if (qType === 'mcq') {
      newQuestion = {
        id: editingQuestionId || 'q-' + Date.now(),
        type: 'mcq',
        numberBn: currentNumber,
        text: qText,
        stimulus: qStimulus,
        marks: qMarks || 1,
        marksBn: qMarksBn || '১',
        options: mcqOptions,
        answerHint: qAnswerHint,
      };
    } else if (qType === 'matching') {
      newQuestion = {
        id: editingQuestionId || 'q-' + Date.now(),
        type: 'matching',
        numberBn: currentNumber,
        text: qText || 'ক-স্তম্ভের বাক্যাংশের সাথে খ-স্তম্ভের বাক্যাংশ মিল কর:',
        marks: qMarks || 4,
        marksBn: qMarksBn || '৪',
        matchingPairs: matchingPairs.filter((p) => p.left.trim() || p.right.trim()),
        answerHint: qAnswerHint,
      };
    } else {
      // Short or fill in the blanks
      newQuestion = {
        id: editingQuestionId || 'q-' + Date.now(),
        type: qType,
        numberBn: currentNumber,
        text: qText,
        marks: qMarks || 2,
        marksBn: qMarksBn || '২',
        answerHint: qAnswerHint,
      };
    }

    if (editingQuestionId) {
      setPaper((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === editingQuestionId ? newQuestion : q)),
      }));
      setEditingQuestionId(null);
    } else {
      setPaper((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
      }));
    }

    // Reset form
    setQTitle('');
    setQStimulus('');
    setQText('');
    setQAnswerHint('');
  };

  // AI Question Generation via Server Endpoint
  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject || paper.header.subject,
          gradeClass: aiClass || paper.header.gradeClass,
          chapter: aiChapter,
          questionType: aiQType,
          count: aiCount,
          difficulty: aiDifficulty,
          customPrompt: aiCustomPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'প্রশ্ন তৈরিতে সমস্যা হয়েছে।');
      }

      const generated: Question[] = (data.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: 'ai-q-' + Date.now() + '-' + idx,
        numberBn: toBengaliDigits(paper.questions.length + idx + 1),
      }));

      setGeneratedAiQuestions(generated);
    } catch (err: any) {
      console.error('AI Error:', err);
      setAiError(err.message || 'প্রশ্ন তৈরিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Add an individual AI generated question to the paper
  const handleAddAiQuestionToPaper = (q: Question) => {
    setPaper((prev) => {
      const updated = {
        ...q,
        id: 'q-' + Date.now(),
        numberBn: toBengaliDigits(prev.questions.length + 1),
      };
      return {
        ...prev,
        questions: [...prev.questions, updated],
      };
    });
    setGeneratedAiQuestions((prev) => prev.filter((item) => item.id !== q.id));
  };

  // Add all AI questions to paper
  const handleAddAllAiQuestions = () => {
    setPaper((prev) => {
      const startIdx = prev.questions.length;
      const formatted = generatedAiQuestions.map((q, idx) => ({
        ...q,
        id: 'q-' + Date.now() + '-' + idx,
        numberBn: toBengaliDigits(startIdx + idx + 1),
      }));
      return {
        ...prev,
        questions: [...prev.questions, ...formatted],
      };
    });
    setGeneratedAiQuestions([]);
  };

  return (
    <aside className="no-print w-full lg:w-[380px] xl:w-[420px] bg-[#fbfdfc] border-r border-[#cfd9d3] flex flex-col shrink-0 h-auto lg:h-[calc(100vh-53px)] overflow-hidden">
      {/* Tab Switcher Rail */}
      <div className="grid grid-cols-5 border-b border-[#cfd9d3] bg-[#f0f5f2] p-1 gap-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'header'
              ? 'bg-[#fbfdfc] text-[#006a4e] shadow-2xs font-semibold'
              : 'text-[#55675e] hover:text-[#12231b]'
          }`}
          title="শিরোনাম ও পরিচিতি"
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>হেডার</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('add');
            setEditingQuestionId(null);
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'add'
              ? 'bg-[#fbfdfc] text-[#006a4e] shadow-2xs font-semibold'
              : 'text-[#55675e] hover:text-[#12231b]'
          }`}
          title="প্রশ্ন যোগ / সম্পাদনা"
        >
          <PlusCircle className="w-4 h-4 mb-0.5" />
          <span>প্রশ্ন যোগ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-[#fbfdfc] text-[#006a4e] shadow-2xs font-semibold'
              : 'text-[#55675e] hover:text-[#12231b]'
          }`}
          title="Gemini AI প্রশ্ন প্রণেতা"
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-[#006a4e]" />
          <span>AI প্রণেতা</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-[#fbfdfc] text-[#006a4e] shadow-2xs font-semibold'
              : 'text-[#55675e] hover:text-[#12231b]'
          }`}
          title="প্রশ্নব্যাংক ও রেডি টেমপ্লেট"
        >
          <Library className="w-4 h-4 mb-0.5" />
          <span>প্রশ্নব্যাংক</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#fbfdfc] text-[#006a4e] shadow-2xs font-semibold'
              : 'text-[#55675e] hover:text-[#12231b]'
          }`}
          title="লেআউট ও পৃষ্ঠা সেটিংস"
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>সেটিংস</span>
        </button>
      </div>

      {/* Tab Panels Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#12231b]">
        {/* ================= TAB 1: HEADER & INFO ================= */}
        {activeTab === 'header' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#cfd9d3]">
              <h3 className="font-bold text-sm text-[#12231b]">পরীক্ষার শিরোনাম ও বিবরণ</h3>
              <span className="text-[11px] text-[#55675e]">কাগজের শীর্ষে দৃশ্যমান</span>
            </div>

            <div>
              <label className="block font-semibold mb-1">শিক্ষা প্রতিষ্ঠানের নাম:</label>
              <input
                type="text"
                value={paper.header.instituteName}
                onChange={(e) =>
                  setPaper((prev) => ({
                    ...prev,
                    header: { ...prev.header, instituteName: e.target.value },
                  }))
                }
                className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                placeholder="যেমন: মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">উপ-শিরোনাম / ঠিকানা / কোড:</label>
              <input
                type="text"
                value={paper.header.instituteSubTitle || ''}
                onChange={(e) =>
                  setPaper((prev) => ({
                    ...prev,
                    header: { ...prev.header, instituteSubTitle: e.target.value },
                  }))
                }
                className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                placeholder="যেমন: ঢাকা | কেন্দ্র কোড: ১১৪"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">পরীক্ষার নাম:</label>
              <input
                type="text"
                value={paper.header.examTitle}
                onChange={(e) =>
                  setPaper((prev) => ({
                    ...prev,
                    header: { ...prev.header, examTitle: e.target.value },
                  }))
                }
                className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                placeholder="যেমন: নির্বাচনী পরীক্ষা - ২০২৬"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">শ্রেণি:</label>
                <input
                  type="text"
                  value={paper.header.gradeClass}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, gradeClass: e.target.value },
                    }))
                  }
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                  placeholder="যেমন: দশম শ্রেণি"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">শাখা / সেকশন:</label>
                <input
                  type="text"
                  value={paper.header.sectionName || ''}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, sectionName: e.target.value },
                    }))
                  }
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                  placeholder="যেমন: শাখা: ক ও খ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">বিষয়:</label>
                <input
                  type="text"
                  value={paper.header.subject}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, subject: e.target.value },
                    }))
                  }
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                  placeholder="যেমন: বাংলা প্রথম পত্র"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">বিষয় কোড:</label>
                <input
                  type="text"
                  value={paper.header.subjectCode}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, subjectCode: e.target.value },
                    }))
                  }
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                  placeholder="যেমন: ১০১"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">পরীক্ষার সময়:</label>
                <input
                  type="text"
                  value={paper.header.duration}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, duration: e.target.value },
                    }))
                  }
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                  placeholder="যেমন: ২ ঘণ্টা ৩০ মিনিট"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">পূর্ণমান (নম্বর):</label>
                <input
                  type="number"
                  value={paper.header.fullMarks}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setPaper((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        fullMarks: val,
                        fullMarksBn: toBengaliDigits(val),
                      },
                    }));
                  }}
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">বিশেষ নির্দেশাবলী:</label>
                <button
                  type="button"
                  onClick={() =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, instructions: defaultInstructions },
                    }))
                  }
                  className="text-[10px] text-[#006a4e] hover:underline"
                >
                  স্ট্যান্ডার্ড বাক্য দিন
                </button>
              </div>
              <textarea
                rows={3}
                value={paper.header.instructions}
                onChange={(e) =>
                  setPaper((prev) => ({
                    ...prev,
                    header: { ...prev.header, instructions: e.target.value },
                  }))
                }
                className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:bg-white focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Logo, Watermark & Signatures Toggles */}
            <div className="pt-2 border-t border-[#cfd9d3] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paper.header.showMonogram}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, showMonogram: e.target.checked },
                    }))
                  }
                  className="rounded text-[#006a4e] focus:ring-[#006a4e]"
                />
                <span className="font-medium">মনোগ্রাম / লোগো প্রদর্শন</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paper.header.showWatermark}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, showWatermark: e.target.checked },
                    }))
                  }
                  className="rounded text-[#006a4e] focus:ring-[#006a4e]"
                />
                <span className="font-medium">ওয়াটারমার্ক প্রদর্শন (কাগজের মাঝে)</span>
              </label>

              {paper.header.showWatermark && (
                <input
                  type="text"
                  value={paper.header.watermarkText}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, watermarkText: e.target.value },
                    }))
                  }
                  placeholder="যেমন: গোপনীয় / মডেল টেস্ট"
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs"
                />
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paper.header.showSignatures}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      header: { ...prev.header, showSignatures: e.target.checked },
                    }))
                  }
                  className="rounded text-[#006a4e] focus:ring-[#006a4e]"
                />
                <span className="font-medium">শিক্ষক ও অধ্যক্ষের স্বাক্ষর ব্লক প্রদর্শন</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ADD / EDIT QUESTION ================= */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveQuestion} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#cfd9d3]">
              <h3 className="font-bold text-sm text-[#12231b]">
                {editingQuestionId ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন যোগ করুন'}
              </h3>
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={() => setEditingQuestionId(null)}
                  className="text-[11px] text-[#8a4b00] hover:underline"
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            {/* Question Type Selector */}
            <div>
              <label className="block font-semibold mb-1">প্রশ্নের ধরন:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cq', label: 'সৃজনশীল (CQ)' },
                  { id: 'mcq', label: 'বহুনির্বাচনী (MCQ)' },
                  { id: 'short', label: 'সংক্ষিপ্ত' },
                  { id: 'matching', label: 'স্তম্ভ মিলকরণ' },
                  { id: 'fill_in_the_blanks', label: 'শূন্যস্থান' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQType(t.id as QuestionType)}
                    className={`py-1.5 px-2 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                      qType === t.id
                        ? 'bg-[#d6ece3] text-[#006a4e] border-[#006a4e] font-semibold'
                        : 'bg-[#f0f5f2] border-[#cfd9d3] text-[#55675e] hover:bg-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- CREATIVE QUESTION (CQ) FORM --- */}
            {qType === 'cq' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">শিরোনাম বা বিষয়বস্তু (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                    placeholder="যেমন: শিক্ষা ও মনুষ্যত্ব / বল ও গতি"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    উদ্দীপক (Stimulus / অনুচ্ছেদ / দৃশ্যপট):
                  </label>
                  <textarea
                    rows={4}
                    value={qStimulus}
                    onChange={(e) => setQStimulus(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:bg-white focus:outline-hidden leading-relaxed"
                    placeholder="উদ্দীপকের মূল অনুচ্ছেদ বা তথ্য লিখুন..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs">উপ-প্রশ্নসমূহ (ক, খ, গ, ঘ):</label>
                    <span className="text-[10px] text-[#006a4e] font-semibold">মোট মান: ১০</span>
                  </div>

                  {subQuestions.map((sub, idx) => (
                    <div key={sub.key} className="p-2 rounded bg-[#f0f5f2] border border-[#cfd9d3] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#006a4e]">
                          ({sub.key}) স্তর: {sub.cognitiveLevel}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-[#55675e]">নম্বর:</span>
                          <input
                            type="number"
                            value={sub.marks}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setSubQuestions((prev) =>
                                prev.map((s, i) =>
                                  i === idx ? { ...s, marks: val, marksBn: toBengaliDigits(val) } : s
                                )
                              );
                            }}
                            className="w-12 bg-white border border-[#cfd9d3] rounded px-1.5 py-0.5 text-center text-xs"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={sub.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubQuestions((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, text: val } : s))
                          );
                        }}
                        className="w-full bg-white border border-[#cfd9d3] rounded px-2 py-1 text-xs focus:border-[#006a4e] focus:outline-hidden"
                        placeholder={`(${sub.key}) প্রশ্নের বিবরণ লিখুন...`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- MCQ FORM --- */}
            {qType === 'mcq' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">মূল প্রশ্নবাক্য:</label>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                    placeholder="যেমন: ছয় দফা দাবি কত সালে উত্থাপিত হয়?"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">উদ্দীপক (যদি থাকে - ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={qStimulus}
                    onChange={(e) => setQStimulus(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1 text-xs"
                    placeholder="নিচের উদ্দীপকটি পড়ে ৫ ও ৬ নং প্রশ্নের উত্তর দাও..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold mb-0.5">৪টি বিকল্প ও সঠিক উত্তর নির্বাচন:</label>
                  {mcqOptions.map((opt, oIdx) => (
                    <div key={opt.label} className="flex items-center gap-2">
                      <span className="font-bold w-6 text-center text-[#006a4e]">({opt.label})</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMcqOptions((prev) =>
                            prev.map((o, i) => (i === oIdx ? { ...o, text: val } : o))
                          );
                        }}
                        className="flex-1 bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                        placeholder={`বিকল্প ${opt.label} এর বিষয়বস্তু...`}
                        required
                      />
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer" title="সঠিক উত্তর হিসেবে চিহ্নিত করুন">
                        <input
                          type="radio"
                          name="correctMcq"
                          checked={opt.isCorrect}
                          onChange={() => {
                            setMcqOptions((prev) =>
                              prev.map((o, i) => ({ ...o, isCorrect: i === oIdx }))
                            );
                          }}
                          className="text-[#006a4e]"
                        />
                        <span className="text-[10px]">সঠিক</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SHORT / FILL IN BLANKS FORM --- */}
            {(qType === 'short' || qType === 'fill_in_the_blanks') && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {qType === 'fill_in_the_blanks' ? 'শূন্যস্থানযুক্ত বাক্য:' : 'প্রশ্নবাক্য:'}
                  </label>
                  <textarea
                    rows={3}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:bg-white focus:outline-hidden"
                    placeholder={
                      qType === 'fill_in_the_blanks'
                        ? 'যেমন: বাংলাদেশ ________ সালে স্বাধীনতা অর্জন করে।'
                        : 'যেমন: নিউটনের দ্বিতীয় গতিসূত্রটি বিবৃত কর।'
                    }
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-semibold">বরাদ্দকৃত নম্বর:</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setQMarks(val);
                      setQMarksBn(toBengaliDigits(val));
                    }}
                    className="w-16 bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-center text-xs"
                  />
                </div>
              </div>
            )}

            {/* --- MATCHING FORM --- */}
            {qType === 'matching' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">নির্দেশনা বাক্য:</label>
                  <input
                    type="text"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs"
                    placeholder="ক-স্তম্ভের সাথে খ-স্তম্ভ মিল কর:"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 text-[11px] font-bold text-[#55675e] px-1">
                    <span>ক-স্তম্ভ (বাম)</span>
                    <span>খ-স্তম্ভ (ডান)</span>
                  </div>
                  {matchingPairs.map((pair, pIdx) => (
                    <div key={pIdx} className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMatchingPairs((prev) =>
                            prev.map((p, i) => (i === pIdx ? { ...p, left: val } : p))
                          );
                        }}
                        className="bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs"
                        placeholder={`তথ্য (${toBengaliDigits(pIdx + 1)})`}
                      />
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMatchingPairs((prev) =>
                            prev.map((p, i) => (i === pIdx ? { ...p, right: val } : p))
                          );
                        }}
                        className="bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs"
                        placeholder={`তথ্য (${String.fromCharCode(65 + pIdx)})`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solution Hint / Answer Key notes */}
            <div>
              <label className="block font-semibold mb-1">
                উত্তরমালা বা মূল্যায়নের সূত্র (শিক্ষকের জন্য - ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={qAnswerHint}
                onChange={(e) => setQAnswerHint(e.target.value)}
                className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs"
                placeholder="যেমন: সঠিক উত্তর ক / জ্ঞানমূলক প্রশ্নের মূল উত্তর..."
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-[#006a4e] hover:bg-[#085a43] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingQuestionId ? 'পরিবর্তন সংরক্ষণ করুন' : 'কাগজে প্রশ্ন যোগ করুন'}</span>
              </button>
            </div>

            {/* Existing Questions Accordion/List */}
            <div className="pt-4 border-t border-[#cfd9d3]">
              <h4 className="font-bold text-xs text-[#55675e] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>কাগজে বর্তমান প্রশ্নাবলি</span>
                <span className="text-[#006a4e]">{toBengaliDigits(paper.questions.length)} টি</span>
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {paper.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-2 rounded bg-[#f0f5f2] border border-[#cfd9d3] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-[#006a4e]">{toBengaliDigits(idx + 1)}.</span>
                      <span className="font-medium truncate max-w-[170px]">
                        {q.type === 'cq' ? q.title || 'সৃজনশীল প্রশ্ন' : q.text}
                      </span>
                      <span className="text-[10px] bg-[#d6ece3] text-[#006a4e] px-1 py-0.2 rounded shrink-0">
                        {q.marksBn || toBengaliDigits(q.marks)} নম্বর
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(q.id)}
                        className="p-1 hover:text-[#006a4e] cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('প্রশ্নটি মুছে ফেলবেন?')) {
                            setPaper((prev) => ({
                              ...prev,
                              questions: prev.questions
                                .filter((item) => item.id !== q.id)
                                .map((item, i) => ({
                                  ...item,
                                  numberBn: toBengaliDigits(i + 1),
                                })),
                            }));
                          }
                        }}
                        className="p-1 hover:text-red-600 cursor-pointer"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* ================= TAB 3: GEMINI AI ASSISTANT ================= */}
        {activeTab === 'ai' && (
          <div className="space-y-3.5">
            <div className="pb-1 border-b border-[#cfd9d3]">
              <div className="flex items-center gap-1.5 text-[#006a4e] font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <h3>এআই প্রশ্ন প্রণেতা (Gemini 3.8 Flash)</h3>
              </div>
              <p className="text-[11px] text-[#55675e] mt-0.5">
                NCTB কারিকুলাম ও বোর্ড পরীক্ষা অনুযায়ী স্বয়ংক্রিয় সৃজনশীল ও বহুনির্বাচনী প্রশ্ন তৈরি
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">শ্রেণি:</label>
                  <select
                    value={aiClass}
                    onChange={(e) => setAiClass(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1.5 text-xs focus:border-[#006a4e] focus:outline-hidden"
                  >
                    <option value="৬ষ্ঠ শ্রেণি">৬ষ্ঠ শ্রেণি</option>
                    <option value="৭ম শ্রেণি">৭ম শ্রেণি</option>
                    <option value="৮ম শ্রেণি">৮ম শ্রেণি (জেএসসি)</option>
                    <option value="৯ম শ্রেণি">৯ম শ্রেণি</option>
                    <option value="১০ম শ্রেণি (এসএসসি)">১০ম শ্রেণি (এসএসসি)</option>
                    <option value="একাদশ-দ্বাদশ (এইচএসসি)">একাদশ-দ্বাদশ (এইচএসসি)</option>
                    <option value="দাখিল / আলিম মাদ্রাসা">দাখিল / আলিম মাদ্রাসা</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">প্রশ্নের ধরন:</label>
                  <select
                    value={aiQType}
                    onChange={(e) => setAiQType(e.target.value as QuestionType)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1.5 text-xs focus:border-[#006a4e] focus:outline-hidden font-medium"
                  >
                    <option value="cq">সৃজনশীল (CQ - উদ্দীপকসহ)</option>
                    <option value="mcq">বহুনির্বাচনী (MCQ - ৪ অপশন)</option>
                    <option value="short">সংক্ষিপ্ত প্রশ্ন</option>
                    <option value="fill_in_the_blanks">শূন্যস্থান পূরণ</option>
                    <option value="matching">স্তম্ভ মিলকরণ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিষয়:</label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:outline-hidden"
                  placeholder="যেমন: বাংলা প্রথম পত্র / পদার্থবিজ্ঞান / গণিত"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">অধ্যায় বা নির্দিষ্ট বিষয়বস্তু:</label>
                <input
                  type="text"
                  value={aiChapter}
                  onChange={(e) => setAiChapter(e.target.value)}
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs focus:border-[#006a4e] focus:outline-hidden"
                  placeholder="যেমন: গতি ও ত্বরণ / শিক্ষা ও মনুষ্যত্ব / প্যাটার্ন"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">প্রশ্নের সংখ্যা:</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1.5 text-xs"
                  >
                    <option value={1}>১ টি</option>
                    <option value={2}>২ টি</option>
                    <option value={3}>৩ টি</option>
                    <option value={5}>৫ টি</option>
                    <option value={10}>১০ টি (MCQ উপযোগী)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">কাঠিন্যের মান:</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1.5 text-xs"
                  >
                    <option value="সহজ (মৌলিক ধারণা)">সহজ</option>
                    <option value="মধ্যম (বোর্ড স্ট্যান্ডার্ড)">মধ্যম (বোর্ড মান)</option>
                    <option value="কঠিন (উচ্চতর দক্ষতা ও বিশ্লেষণমূলক)">উচ্চতর দক্ষতা</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">অতিরিক্ত নির্দেশনা (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  className="w-full bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2.5 py-1.5 text-xs"
                  placeholder="যেমন: ঢাকা বোর্ডের বিগত সালের আদলে তৈরি করুন"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isAiLoading}
                className="w-full py-2.5 rounded bg-[#006a4e] hover:bg-[#085a43] disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>প্রশ্ন তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>এআই দিয়ে প্রশ্ন তৈরি করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="space-y-1">
                  <p className="font-semibold">ত্রুটি ঘটেছে:</p>
                  <p className="text-[11px] leading-relaxed">{aiError}</p>
                </div>
              </div>
            )}

            {/* Generated Questions List Preview */}
            {generatedAiQuestions.length > 0 && (
              <div className="pt-3 border-t border-[#cfd9d3] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#006a4e] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    তৈরি হয়েছে {toBengaliDigits(generatedAiQuestions.length)} টি প্রশ্ন
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAllAiQuestions}
                    className="text-[11px] font-semibold text-[#006a4e] hover:underline cursor-pointer"
                  >
                    সবগুলো যোগ করুন (+All)
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {generatedAiQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded bg-white border border-[#006a4e]/30 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#12231b]">
                          {toBengaliDigits(idx + 1)}. {q.title || (q.type === 'cq' ? 'সৃজনশীল প্রশ্ন' : q.text)}
                        </span>
                        <span className="text-[10px] bg-[#d6ece3] text-[#006a4e] px-1.5 py-0.5 rounded font-semibold">
                          {q.marksBn || toBengaliDigits(q.marks)} নম্বর
                        </span>
                      </div>

                      {q.stimulus && (
                        <p className="text-[11px] italic text-[#55675e] line-clamp-2 bg-[#f0f5f2] p-1.5 rounded">
                          উদ্দীপক: {q.stimulus}
                        </p>
                      )}

                      {q.type === 'cq' && q.subQuestions && (
                        <div className="text-[10.5px] space-y-0.5 text-[#55675e]">
                          {q.subQuestions.map((sub) => (
                            <div key={sub.key} className="flex justify-between">
                              <span>({sub.key}) {sub.text}</span>
                              <span className="font-mono">[{sub.marksBn}]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-[#55675e]">
                          {q.options.map((opt) => (
                            <span key={opt.label} className={opt.isCorrect ? 'font-bold text-[#006a4e]' : ''}>
                              ({opt.label}) {opt.text}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddAiQuestionToPaper(q)}
                          className="px-2.5 py-1 bg-[#d6ece3] hover:bg-[#006a4e] hover:text-white text-[#006a4e] rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          কাগজে যুক্ত করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PRESETS & QUESTION BANK ================= */}
        {activeTab === 'bank' && (
          <div className="space-y-3.5">
            <div className="pb-1 border-b border-[#cfd9d3]">
              <h3 className="font-bold text-sm text-[#12231b]">রেডিমেড প্রশ্নব্যাংক ও টেমপ্লেট</h3>
              <p className="text-[11px] text-[#55675e]">
                এক ক্লিকে পূর্ণাঙ্গ বোর্ড স্ট্যান্ডার্ড প্রশ্নপত্র লোড করুন
              </p>
            </div>

            <div className="space-y-2.5">
              {presetTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 rounded-lg border border-[#cfd9d3] bg-[#fbfdfc] hover:border-[#006a4e] transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-[#12231b]">
                        {template.header.subject}
                      </h4>
                      <p className="text-[11px] text-[#55675e]">
                        {template.header.gradeClass} • {template.header.examTitle}
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#d6ece3] text-[#006a4e] px-1.5 py-0.5 rounded font-semibold shrink-0">
                      মান: {template.header.fullMarksBn}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#55675e] line-clamp-2">
                    {template.header.instituteName}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#cfd9d3]/60">
                    <span className="text-[10px] text-[#55675e]">
                      মোট প্রশ্ন: {toBengaliDigits(template.questions.length)} টি
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('বর্তমান পরিবর্তনের পরিবর্তে এই টেমপ্লেটটি লোড করবেন?')) {
                          setPaper(JSON.parse(JSON.stringify(template)));
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-[#006a4e] hover:bg-[#085a43] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      টেমপ্লেট লোড করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PAGE & PRINT SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="pb-1 border-b border-[#cfd9d3]">
              <h3 className="font-bold text-sm text-[#12231b]">লেআউট ও প্রিন্ট সেটিংস</h3>
              <p className="text-[11px] text-[#55675e]">কাগজের আকার, ফন্ট ও প্রিন্ট নিয়ন্ত্রণ</p>
            </div>

            {/* Layout Columns */}
            <div>
              <label className="block font-semibold mb-1.5">কাগজের কলাম বিন্যাস:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaper((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, layoutColumns: 1 },
                    }))
                  }
                  className={`py-2 px-3 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                    paper.settings.layoutColumns === 1
                      ? 'bg-[#d6ece3] text-[#006a4e] border-[#006a4e] font-bold'
                      : 'bg-[#f0f5f2] border-[#cfd9d3] text-[#55675e]'
                  }`}
                >
                  ১ কলাম (সাধারণ লেআউট)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaper((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, layoutColumns: 2 },
                    }))
                  }
                  className={`py-2 px-3 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                    paper.settings.layoutColumns === 2
                      ? 'bg-[#d6ece3] text-[#006a4e] border-[#006a4e] font-bold'
                      : 'bg-[#f0f5f2] border-[#cfd9d3] text-[#55675e]'
                  }`}
                >
                  ২ কলাম (বোর্ড স্ট্যান্ডার্ড)
                </button>
              </div>
            </div>

            {/* Font Size Selection */}
            <div>
              <label className="block font-semibold mb-1.5">ফন্ট সাইজ (অক্ষরের আকার):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'sm', label: 'ছোট (13px)', desc: 'বেশি প্রশ্ন আঁটবে' },
                  { id: 'base', label: 'মাঝারি (14.5px)', desc: 'স্ট্যান্ডার্ড' },
                  { id: 'lg', label: 'বড় (16px)', desc: 'সুস্পষ্ট পাঠ্য' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setPaper((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, fontSize: s.id as any },
                      }))
                    }
                    className={`py-1.5 px-2 rounded border text-[11px] text-center transition-colors cursor-pointer ${
                      paper.settings.fontSize === s.id
                        ? 'bg-[#d6ece3] text-[#006a4e] border-[#006a4e] font-bold'
                        : 'bg-[#f0f5f2] border-[#cfd9d3] text-[#55675e]'
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number Format Options */}
            <div className="space-y-2 pt-2 border-t border-[#cfd9d3]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paper.settings.showMarksInBrackets}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, showMarksInBrackets: e.target.checked },
                    }))
                  }
                  className="rounded text-[#006a4e] focus:ring-[#006a4e]"
                />
                <span className="font-medium">নম্বরের পাশে ব্র্যাকেট প্রদর্শন [১০]</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paper.settings.bengaliNumerals}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, bengaliNumerals: e.target.checked },
                    }))
                  }
                  className="rounded text-[#006a4e] focus:ring-[#006a4e]"
                />
                <span className="font-medium">বাংলা সংখ্যায় ক্রমিক সংখ্যা প্রদর্শন (১, ২, ৩)</span>
              </label>
            </div>

            {/* Print Help Box */}
            <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-[#006a4e]">
                <HelpCircle className="w-4 h-4" />
                নিখুঁত প্রিন্ট বা PDF সেভ করার টিপস:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-900 leading-relaxed">
                <li>প্রিন্ট ডায়ালগে <strong>Destination</strong> হিসেবে 'Save as PDF' নির্বাচন করুন।</li>
                <li><strong>Paper size:</strong> A4 রাখুন।</li>
                <li><strong>Margins:</strong> 'Default' বা 'None' নির্বাচন করুন।</li>
                <li><strong>Background graphics:</strong> অন রাখুন যাতে বর্ডার ও শ্যাডো সুস্পষ্ট থাকে।</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
