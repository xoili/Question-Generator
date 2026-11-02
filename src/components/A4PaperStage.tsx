import React, { useState } from 'react';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Edit3,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { ExamPaper, Question } from '../types';
import { toBengaliDigits } from '../utils/bengaliUtils';

interface A4PaperStageProps {
  paper: ExamPaper;
  setPaper: React.Dispatch<React.SetStateAction<ExamPaper>>;
  zoom: number;
  onEditQuestionInRail: (questionId: string) => void;
  onAddNewQuestion: () => void;
}

export const A4PaperStage: React.FC<A4PaperStageProps> = ({
  paper,
  setPaper,
  zoom,
  onEditQuestionInRail,
  onAddNewQuestion,
}) => {
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);

  // Reorder question up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPaper((prev) => {
      const q = [...prev.questions];
      const temp = q[index];
      q[index] = q[index - 1];
      q[index - 1] = temp;
      // Re-number questions
      return {
        ...prev,
        questions: q.map((item, idx) => ({
          ...item,
          numberBn: toBengaliDigits(idx + 1),
        })),
      };
    });
  };

  // Reorder question down
  const handleMoveDown = (index: number) => {
    if (index === paper.questions.length - 1) return;
    setPaper((prev) => {
      const q = [...prev.questions];
      const temp = q[index];
      q[index] = q[index + 1];
      q[index + 1] = temp;
      return {
        ...prev,
        questions: q.map((item, idx) => ({
          ...item,
          numberBn: toBengaliDigits(idx + 1),
        })),
      };
    });
  };

  // Duplicate question
  const handleDuplicate = (question: Question, index: number) => {
    setPaper((prev) => {
      const duplicated: Question = {
        ...JSON.parse(JSON.stringify(question)),
        id: 'q-' + Date.now(),
      };
      const q = [...prev.questions];
      q.splice(index + 1, 0, duplicated);
      return {
        ...prev,
        questions: q.map((item, idx) => ({
          ...item,
          numberBn: toBengaliDigits(idx + 1),
        })),
      };
    });
  };

  // Delete question
  const handleDelete = (questionId: string) => {
    if (confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) {
      setPaper((prev) => ({
        ...prev,
        questions: prev.questions
          .filter((q) => q.id !== questionId)
          .map((item, idx) => ({
            ...item,
            numberBn: toBengaliDigits(idx + 1),
          })),
      }));
    }
  };

  // Inline header update helper
  const updateHeaderField = (field: keyof typeof paper.header, value: any) => {
    setPaper((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  // Inline question text update helper
  const updateQuestionText = (questionId: string, newText: string) => {
    setPaper((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, text: newText } : q)),
    }));
  };

  // Inline stimulus update helper
  const updateQuestionStimulus = (questionId: string, newStimulus: string) => {
    setPaper((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, stimulus: newStimulus } : q)),
    }));
  };

  // Font size mapping
  const fontSizeClasses = {
    sm: 'text-[13px] leading-[1.4]',
    base: 'text-[14.5px] leading-[1.55]',
    lg: 'text-[16px] leading-[1.65]',
  }[paper.settings.fontSize || 'base'];

  // Columns styling
  const isTwoCol = paper.settings.layoutColumns === 2;

  // Group questions by section if sections exist
  const sections = paper.sections && paper.sections.length > 0 ? paper.sections : null;

  return (
    <main className="flex-1 bg-[#d9e2dd] p-4 sm:p-8 overflow-auto flex justify-center items-start min-h-[calc(100vh-53px)]">
      {/* Zoom wrapper */}
      <div
        className="transition-transform duration-150 origin-top flex flex-col items-center pb-16"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* A4 True Size Paper Sheet */}
        <article
          className={`exam-paper w-[210mm] max-w-full min-h-[297mm] bg-white p-[14mm] sm:p-[16mm] relative selection:bg-[#006a4e]/20 ${fontSizeClasses}`}
          style={{
            boxShadow: '0 1px 3px rgba(10,30,20,.10), 0 10px 32px rgba(10,30,20,.14)',
          }}
        >
          {/* Watermark overlay if enabled */}
          {paper.header.showWatermark && paper.header.watermarkText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-[0.05]">
              <span className="text-8xl font-bold font-paper transform -rotate-45 text-[#006a4e] whitespace-nowrap">
                {paper.header.watermarkText}
              </span>
            </div>
          )}

          {/* Paper Content Wrapper */}
          <div className="relative z-10">
            {/* Header Section */}
            <header className="text-center pb-3 border-b-2 border-black mb-4">
              {/* Optional Monogram */}
              {paper.header.showMonogram && (
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-black">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                </div>
              )}

              {/* Institution Name */}
              <h2
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateHeaderField('instituteName', e.currentTarget.textContent || '')}
                className="paper-editable text-xl sm:text-2xl font-bold tracking-tight text-black inline-block"
                title="ক্লিক করে স্কুলের নাম পরিবর্তন করুন"
              >
                {paper.header.instituteName}
              </h2>

              {/* Subtitle / Center Code */}
              {paper.header.instituteSubTitle && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateHeaderField('instituteSubTitle', e.currentTarget.textContent || '')}
                  className="paper-editable text-xs text-neutral-700 block mt-0.5"
                >
                  {paper.header.instituteSubTitle}
                </p>
              )}

              {/* Exam Title Badge */}
              <div className="my-1.5">
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateHeaderField('examTitle', e.currentTarget.textContent || '')}
                  className="paper-editable inline-block font-bold text-sm sm:text-base border border-black px-3 py-0.5 rounded-xs"
                >
                  {paper.header.examTitle}
                </span>
              </div>

              {/* Class, Subject, Time, Marks Info Bar */}
              <div className="mt-2 text-xs sm:text-[13.5px] font-medium border-t border-b border-black/40 py-1 px-1 flex flex-wrap items-center justify-between gap-y-1">
                {/* Left side details */}
                <div className="flex flex-wrap items-center gap-x-4 text-left">
                  <span>
                    <strong>শ্রেণি:</strong>{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateHeaderField('gradeClass', e.currentTarget.textContent || '')}
                      className="paper-editable"
                    >
                      {paper.header.gradeClass}
                    </span>
                  </span>

                  {paper.header.sectionName && (
                    <span>
                      <strong>শাখা:</strong>{' '}
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateHeaderField('sectionName', e.currentTarget.textContent || '')}
                        className="paper-editable"
                      >
                        {paper.header.sectionName}
                      </span>
                    </span>
                  )}

                  <span>
                    <strong>বিষয়:</strong>{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateHeaderField('subject', e.currentTarget.textContent || '')}
                      className="paper-editable font-bold"
                    >
                      {paper.header.subject}
                    </span>
                  </span>

                  {paper.header.subjectCode && (
                    <span>
                      <strong>বিষয় কোড:</strong>{' '}
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateHeaderField('subjectCode', e.currentTarget.textContent || '')}
                        className="paper-editable"
                      >
                        {toBengaliDigits(paper.header.subjectCode)}
                      </span>
                    </span>
                  )}
                </div>

                {/* Right side details */}
                <div className="flex items-center gap-x-4 text-right ml-auto">
                  <span>
                    <strong>সময়:</strong>{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateHeaderField('duration', e.currentTarget.textContent || '')}
                      className="paper-editable font-bold"
                    >
                      {paper.header.duration}
                    </span>
                  </span>

                  <span>
                    <strong>পূর্ণমান:</strong>{' '}
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent || '';
                        updateHeaderField('fullMarksBn', val);
                      }}
                      className="paper-editable font-bold"
                    >
                      {paper.header.fullMarksBn || toBengaliDigits(paper.header.fullMarks)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Special Instructions */}
              {paper.header.instructions && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateHeaderField('instructions', e.currentTarget.textContent || '')}
                  className="paper-editable text-[11.5px] italic text-neutral-800 text-left mt-1.5 px-0.5 leading-snug"
                >
                  {paper.header.instructions}
                </p>
              )}
            </header>

            {/* Questions Container: 1 column or 2 column */}
            <div
              className={`questions-flow ${
                isTwoCol
                  ? 'columns-1 md:columns-2 gap-x-7 [column-rule:1px_dashed_#888888]'
                  : 'space-y-4'
              }`}
            >
              {/* If sections exist, render by section */}
              {sections ? (
                sections.map((section) => {
                  const sectionQuestions = paper.questions.filter((q) => q.sectionId === section.id);
                  if (sectionQuestions.length === 0) return null;

                  return (
                    <div key={section.id} className="section-block mb-4 break-inside-avoid">
                      {/* Section Heading */}
                      <div className="text-center py-1 mb-2 border-b border-black/40">
                        <span className="font-bold underline text-sm sm:text-base">
                          {section.name}
                        </span>
                        {section.instruction && (
                          <span className="block text-xs italic text-neutral-700 mt-0.5">
                            {section.instruction}
                          </span>
                        )}
                      </div>

                      {/* Section Questions */}
                      <div className="space-y-4">
                        {sectionQuestions.map((q) => {
                          const globalIndex = paper.questions.findIndex((item) => item.id === q.id);
                          return renderQuestionItem(q, globalIndex);
                        })}
                      </div>
                    </div>
                  );
                })
              ) : null}

              {/* Unsectioned Questions or All Questions when no sections */}
              {(!sections || paper.questions.some((q) => !q.sectionId)) && (
                <div className="space-y-4">
                  {paper.questions
                    .filter((q) => !sections || !q.sectionId)
                    .map((q) => {
                      const globalIndex = paper.questions.findIndex((item) => item.id === q.id);
                      return renderQuestionItem(q, globalIndex);
                    })}
                </div>
              )}
            </div>

            {/* Empty state */}
            {paper.questions.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-[#cfd9d3] rounded-md my-6">
                <p className="text-[#55675e] text-sm mb-3">প্রশ্নপত্রে এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।</p>
                <button
                  type="button"
                  onClick={onAddNewQuestion}
                  className="px-4 py-2 bg-[#006a4e] text-white rounded text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#085a43]"
                >
                  প্রথম প্রশ্ন যোগ করুন
                </button>
              </div>
            )}

            {/* Quick Add Question button at bottom of sheet (Screen only) */}
            <div className="no-print mt-6 text-center pt-3 border-t border-dashed border-[#cfd9d3]">
              <button
                type="button"
                onClick={onAddNewQuestion}
                className="px-3.5 py-1.5 rounded-full border border-[#006a4e] text-[#006a4e] hover:bg-[#006a4e] hover:text-white transition-all text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>কাগজে সরাসরি নতুন প্রশ্ন যোগ করুন</span>
              </button>
            </div>

            {/* Signatures block at bottom */}
            {paper.header.showSignatures && (
              <footer className="mt-12 pt-6 border-t border-black/30 flex items-center justify-between text-xs font-medium text-neutral-800 break-inside-avoid">
                <div className="text-center">
                  <div className="w-24 border-b border-black mb-1 mx-auto"></div>
                  <span>{paper.header.signature1 || 'বিষয় শিক্ষক'}</span>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-black mb-1 mx-auto"></div>
                  <span>{paper.header.signature2 || 'পরীক্ষা নিয়ন্ত্রক'}</span>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-black mb-1 mx-auto"></div>
                  <span>{paper.header.signature3 || 'প্রধান শিক্ষক / অধ্যক্ষ'}</span>
                </div>
              </footer>
            )}
          </div>
        </article>
      </div>
    </main>
  );

  // Helper function to render an individual question item
  function renderQuestionItem(q: Question, index: number) {
    const isHovered = hoveredQuestionId === q.id;

    return (
      <div
        key={q.id}
        onMouseEnter={() => setHoveredQuestionId(q.id)}
        onMouseLeave={() => setHoveredQuestionId(null)}
        className="question-item relative group pb-2 break-inside-avoid rounded transition-colors"
      >
        {/* Floating Action Controls on Hover (no-print) */}
        {isHovered && (
          <div className="no-print absolute -top-3.5 right-0 z-20 flex items-center gap-1 bg-white border border-[#cfd9d3] rounded shadow-md px-1 py-0.5 text-neutral-600">
            <button
              type="button"
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="p-1 hover:text-[#006a4e] disabled:opacity-30 cursor-pointer"
              title="উপরে নিন"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(index)}
              disabled={index === paper.questions.length - 1}
              className="p-1 hover:text-[#006a4e] disabled:opacity-30 cursor-pointer"
              title="নিচে নিন"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDuplicate(q, index)}
              className="p-1 hover:text-[#006a4e] cursor-pointer"
              title="অনুলিপি করুন (Duplicate)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEditQuestionInRail(q.id)}
              className="p-1 hover:text-[#006a4e] cursor-pointer"
              title="সাইডবারে বিস্তারিত সম্পাদনা করুন"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(q.id)}
              className="p-1 hover:text-red-600 cursor-pointer"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- CREATIVE QUESTION (CQ) RENDERING --- */}
        {q.type === 'cq' && (
          <div className="cq-block">
            {/* Header: Question Number and Title and Marks */}
            <div className="flex items-start justify-between gap-2 font-bold mb-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-black font-bold">
                  {q.numberBn || toBengaliDigits(index + 1)}.
                </span>
                {q.title && (
                  <span className="text-black font-semibold underline decoration-dotted">
                    {q.title}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-black shrink-0">
                {paper.settings.showMarksInBrackets
                  ? `[${q.marksBn || toBengaliDigits(q.marks)}]`
                  : q.marksBn || toBengaliDigits(q.marks)}
              </span>
            </div>

            {/* Stimulus / উদ্দীপক */}
            {q.stimulus && (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateQuestionStimulus(q.id, e.currentTarget.textContent || '')}
                className="paper-editable text-justify mb-2 px-2.5 py-1.5 bg-neutral-50/70 border-l-2 border-black/50 text-[13.5px] italic rounded-r-xs leading-relaxed"
                title="উদ্দীপক সম্পাদনা করতে ক্লিক করুন"
              >
                {q.stimulus}
              </div>
            )}

            {/* Sub-questions (ক, খ, গ, ঘ) */}
            <div className="sub-questions space-y-1 pl-1">
              {q.subQuestions?.map((sub) => (
                <div key={sub.key} className="flex items-start justify-between gap-2 text-justify">
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-bold shrink-0">({sub.key})</span>
                    <span className="flex-1">{sub.text}</span>
                  </div>
                  <span className="font-semibold text-xs shrink-0 tabular-nums">
                    {sub.marksBn || toBengaliDigits(sub.marks)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MULTIPLE CHOICE QUESTION (MCQ) RENDERING --- */}
        {q.type === 'mcq' && (
          <div className="mcq-block">
            {/* Question statement */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-start gap-1.5 text-justify flex-1">
                <span className="font-bold shrink-0">
                  {q.numberBn || toBengaliDigits(index + 1)}.
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateQuestionText(q.id, e.currentTarget.textContent || '')}
                  className="paper-editable font-medium"
                >
                  {q.text}
                </span>
              </div>
              {q.marks > 1 && (
                <span className="text-xs font-bold shrink-0">
                  [{q.marksBn || toBengaliDigits(q.marks)}]
                </span>
              )}
            </div>

            {/* Context Stimulus for MCQ if present */}
            {q.stimulus && (
              <div className="text-xs italic bg-neutral-50 px-2 py-1 mb-1.5 border-l border-black/40">
                {q.stimulus}
              </div>
            )}

            {/* Options Grid: 2 columns or 4 columns based on layout */}
            <div className="options-grid grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs sm:text-[13px] pl-4">
              {q.options?.map((opt) => (
                <div key={opt.label} className="flex items-baseline gap-1">
                  <span className="font-bold">({opt.label})</span>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SHORT QUESTION RENDERING --- */}
        {q.type === 'short' && (
          <div className="short-block">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 text-justify flex-1">
                <span className="font-bold shrink-0">
                  {q.numberBn || toBengaliDigits(index + 1)}.
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateQuestionText(q.id, e.currentTarget.textContent || '')}
                  className="paper-editable"
                >
                  {q.text}
                </span>
              </div>
              <span className="text-xs font-bold shrink-0">
                {paper.settings.showMarksInBrackets
                  ? `[${q.marksBn || toBengaliDigits(q.marks)}]`
                  : q.marksBn || toBengaliDigits(q.marks)}
              </span>
            </div>
          </div>
        )}

        {/* --- FILL IN THE BLANKS RENDERING --- */}
        {q.type === 'fill_in_the_blanks' && (
          <div className="fill-block">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 text-justify flex-1">
                <span className="font-bold shrink-0">
                  {q.numberBn || toBengaliDigits(index + 1)}.
                </span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateQuestionText(q.id, e.currentTarget.textContent || '')}
                  className="paper-editable"
                >
                  {q.text}
                </span>
              </div>
              <span className="text-xs font-bold shrink-0">
                [{q.marksBn || toBengaliDigits(q.marks)}]
              </span>
            </div>
          </div>
        )}

        {/* --- MATCHING PAIRS RENDERING --- */}
        {q.type === 'matching' && (
          <div className="matching-block">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-start gap-1.5 font-bold flex-1">
                <span>{q.numberBn || toBengaliDigits(index + 1)}.</span>
                <span>{q.text || 'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিল কর:'}</span>
              </div>
              <span className="text-xs font-bold shrink-0">
                [{q.marksBn || toBengaliDigits(q.marks)}]
              </span>
            </div>

            {q.matchingPairs && q.matchingPairs.length > 0 && (
              <table className="w-full text-xs border border-black/50 text-left my-1">
                <thead>
                  <tr className="bg-neutral-100 border-b border-black/50">
                    <th className="p-1 border-r border-black/50 w-1/2">ক-স্তম্ভ</th>
                    <th className="p-1 w-1/2">খ-স্তম্ভ</th>
                  </tr>
                </thead>
                <tbody>
                  {q.matchingPairs.map((pair, pIdx) => (
                    <tr key={pIdx} className="border-b border-black/30 last:border-b-0">
                      <td className="p-1 border-r border-black/50">
                        ({toBengaliDigits(pIdx + 1)}) {pair.left}
                      </td>
                      <td className="p-1">
                        ({String.fromCharCode(65 + pIdx)}) {pair.right}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  }
};
