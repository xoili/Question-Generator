import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { ExamPaper } from '../types';
import { toBengaliDigits } from '../utils/bengaliUtils';

interface AnswerKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ExamPaper;
}

export const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({ isOpen, onClose, paper }) => {
  if (!isOpen) return null;

  const mcqQuestions = paper.questions.filter((q) => q.type === 'mcq');
  const cqQuestions = paper.questions.filter((q) => q.type === 'cq');
  const otherQuestions = paper.questions.filter((q) => q.type !== 'mcq' && q.type !== 'cq');

  const handlePrintAnswers = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#cfd9d3]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#cfd9d3] bg-[#fbfdfc] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#12231b] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#006a4e]" />
              শিক্ষকের মূল্যায়ন সহায়িকা ও উত্তরমালা (Answer Key)
            </h3>
            <p className="text-xs text-[#55675e]">
              {paper.header.subject} • {paper.header.gradeClass} • {paper.header.examTitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintAnswers}
              className="px-3 py-1.5 rounded bg-[#f0f5f2] hover:bg-[#d6ece3] text-[#006a4e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#55675e] hover:bg-[#f0f5f2] hover:text-[#12231b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#12231b]">
          {/* MCQ Answer Key Table */}
          {mcqQuestions.length > 0 && (
            <div>
              <h4 className="font-bold text-[#006a4e] border-b pb-1.5 mb-3 flex items-center justify-between">
                <span>বহুনির্বাচনী প্রশ্নাবলির সঠিক উত্তর (MCQ Answer Key)</span>
                <span className="text-xs font-normal text-[#55675e]">মোট: {toBengaliDigits(mcqQuestions.length)} টি</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {mcqQuestions.map((q, idx) => {
                  const correctOption = q.options?.find((o) => o.isCorrect);
                  return (
                    <div
                      key={q.id}
                      className="p-2 rounded border border-[#cfd9d3] bg-[#fbfdfc] flex items-center justify-between"
                    >
                      <span className="font-bold text-[#55675e]">প্রশ্ন {q.numberBn || toBengaliDigits(idx + 1)}:</span>
                      <span className="px-2 py-0.5 rounded bg-[#d6ece3] text-[#006a4e] font-bold text-sm">
                        {correctOption ? `(${correctOption.label})` : 'চিহ্নিত নেই'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed MCQ explanations */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-[#55675e] uppercase tracking-wider">
                  ব্যাখ্যা ও নির্ভুল উত্তর বিবরণ:
                </span>
                {mcqQuestions.map((q, idx) => (
                  <div key={q.id} className="text-xs bg-[#f0f5f2] p-2.5 rounded border border-[#cfd9d3]">
                    <span className="font-bold text-[#12231b]">{toBengaliDigits(idx + 1)}. {q.text}</span>
                    <div className="mt-1 flex flex-wrap gap-2 text-[#55675e]">
                      {q.options?.map((opt) => (
                        <span
                          key={opt.label}
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            opt.isCorrect
                              ? 'bg-[#006a4e] text-white font-semibold'
                              : 'bg-white border border-[#cfd9d3]'
                          }`}
                        >
                          ({opt.label}) {opt.text}
                        </span>
                      ))}
                    </div>
                    {q.answerHint && (
                      <p className="mt-1.5 text-[11px] text-[#0b6b3f] italic">
                        উত্তরের ব্যাখ্যা: {q.answerHint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CQ Evaluation Guidelines */}
          {cqQuestions.length > 0 && (
            <div>
              <h4 className="font-bold text-[#006a4e] border-b pb-1.5 mb-3 flex items-center justify-between">
                <span>সৃজনশীল প্রশ্নাবলির মার্কিং স্কিম ও মূল্যায়ন নির্দেশিকা (CQ Rubrics)</span>
                <span className="text-xs font-normal text-[#55675e]">মোট: {toBengaliDigits(cqQuestions.length)} টি</span>
              </h4>
              <div className="space-y-4">
                {cqQuestions.map((q, idx) => (
                  <div key={q.id} className="border border-[#cfd9d3] rounded-md p-3.5 bg-[#fbfdfc]">
                    <div className="flex items-center justify-between font-bold text-sm text-[#12231b] pb-2 border-b border-[#cfd9d3]/60">
                      <span>
                        প্রশ্ন {q.numberBn || toBengaliDigits(idx + 1)} {q.title && `(${q.title})`}
                      </span>
                      <span className="text-xs bg-[#d6ece3] text-[#006a4e] px-2 py-0.5 rounded font-semibold">
                        পূর্ণমান: {q.marksBn || toBengaliDigits(q.marks)}
                      </span>
                    </div>

                    {q.stimulus && (
                      <div className="mt-2 text-xs italic text-[#55675e] bg-amber-50/60 p-2 rounded border-l-2 border-amber-500">
                        উদ্দীপক: {q.stimulus}
                      </div>
                    )}

                    <div className="mt-3 space-y-2">
                      {q.subQuestions?.map((sub) => (
                        <div key={sub.key} className="text-xs pl-2 border-l-2 border-[#006a4e]/40">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#12231b]">
                              ({sub.key}) {sub.text}
                            </span>
                            <span className="text-[11px] text-[#55675e] font-mono">
                              [{sub.marksBn || toBengaliDigits(sub.marks)} নম্বর]
                            </span>
                          </div>
                          {sub.cognitiveLevel && (
                            <span className="inline-block text-[10px] text-[#006a4e] font-medium bg-[#d6ece3]/60 px-1.5 py-0.2 rounded mt-0.5">
                              স্তর: {sub.cognitiveLevel}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.answerHint && (
                      <div className="mt-3 text-xs bg-emerald-50 text-[#0b6b3f] p-2 rounded border border-[#0b6b3f]/20">
                        <span className="font-bold">মূল্যায়ন সূত্র:</span> {q.answerHint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Questions */}
          {otherQuestions.length > 0 && (
            <div>
              <h4 className="font-bold text-[#006a4e] border-b pb-1.5 mb-3">
                অন্যান্য প্রশ্নাবলির ইঙ্গিত (Short / Matching / Fill in blanks)
              </h4>
              <div className="space-y-2">
                {otherQuestions.map((q, idx) => (
                  <div key={q.id} className="p-2.5 rounded border border-[#cfd9d3] bg-[#fbfdfc] text-xs">
                    <span className="font-bold text-[#12231b]">
                      {q.numberBn || toBengaliDigits(idx + 1)}. {q.text}
                    </span>
                    {q.answerHint && (
                      <p className="mt-1 text-emerald-800 italic">উত্তরের ইঙ্গিত: {q.answerHint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#cfd9d3] bg-[#f0f5f2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#12231b] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
