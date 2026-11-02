import React from 'react';
import {
  Printer,
  Columns,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  FileCheck2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ExamPaper } from '../types';
import { toBengaliDigits, calculateTotalMarks } from '../utils/bengaliUtils';
import { presetTemplates } from '../data/presetTemplates';

interface HeaderBarProps {
  paper: ExamPaper;
  setPaper: React.Dispatch<React.SetStateAction<ExamPaper>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onPrint: () => void;
  onOpenAnswerKey: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  paper,
  setPaper,
  zoom,
  setZoom,
  activeTab,
  setActiveTab,
  onPrint,
  onOpenAnswerKey,
}) => {
  const currentTotalMarks = calculateTotalMarks(paper.questions);
  const targetFullMarks = paper.header.fullMarks || 0;
  const isMarksMatch = currentTotalMarks === targetFullMarks;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paper, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${paper.header.subject || 'question-paper'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.header && parsed.questions) {
            setPaper(parsed);
          } else {
            alert('সঠিক প্রশ্নপত্র JSON ফাইল নয়।');
          }
        } catch {
          alert('ফাইলটি পড়তে সমস্যা হয়েছে।');
        }
      };
    }
  };

  const toggleColumnLayout = () => {
    setPaper((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        layoutColumns: prev.settings.layoutColumns === 1 ? 2 : 1,
      },
    }));
  };

  const handleSelectPreset = (id: string) => {
    const found = presetTemplates.find((t) => t.id === id);
    if (found) {
      if (confirm('নতুন টেমপ্লেট লোড করলে বর্তমান পরিবর্তন প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?')) {
        setPaper(JSON.parse(JSON.stringify(found)));
      }
    }
  };

  return (
    <header className="no-print bg-[#fbfdfc] border-b border-[#cfd9d3] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#006a4e] flex items-center justify-center text-white shadow-sm ring-2 ring-[#006a4e]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#12231b] tracking-tight flex items-center gap-1.5 font-ui">
                প্রশ্নপত্র জেনারেটর
                <span className="text-[11px] font-semibold bg-[#d6ece3] text-[#006a4e] px-1.5 py-0.5 rounded-sm">
                  NCTB কারিকুলাম
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#55675e] hidden sm:block">
              {paper.header.instituteName || 'পরীক্ষার নাম ও বিবরণ'}
            </p>
          </div>
        </div>

        {/* Center: Marks counter indicator & Presets */}
        <div className="flex items-center gap-3">
          {/* Marks tally indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              isMarksMatch
                ? 'bg-[#d4efdf] text-[#0b6b3f] border-[#0b6b3f]/30'
                : 'bg-[#fbe9c8] text-[#8a4b00] border-[#8a4b00]/30'
            }`}
            title={`নির্ধারিত পূর্ণমান: ${targetFullMarks}, প্রশ্নে বরাদ্দকৃত মোট নম্বর: ${currentTotalMarks}`}
          >
            <span className="font-semibold">মোট নম্বর:</span>
            <span>{toBengaliDigits(currentTotalMarks)}</span>
            <span>/</span>
            <span className="font-bold">{toBengaliDigits(targetFullMarks)}</span>
            {!isMarksMatch && (
              <span className="text-[10px] ml-1 px-1 bg-white/70 rounded">
                ({currentTotalMarks > targetFullMarks ? '+' : ''}
                {toBengaliDigits(currentTotalMarks - targetFullMarks)})
              </span>
            )}
          </div>

          {/* Quick preset loader */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-[#55675e]">
            <span className="font-medium text-[#12231b]">টেমপ্লেট:</span>
            <select
              aria-label="টেমপ্লেট নির্বাচন"
              className="bg-[#f0f5f2] border border-[#cfd9d3] rounded px-2 py-1 text-xs text-[#12231b] focus:border-[#006a4e] focus:outline-hidden"
              onChange={(e) => {
                if (e.target.value) handleSelectPreset(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>
                নমুনা নির্বাচন করুন...
              </option>
              {presetTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.header.subject} ({t.header.gradeClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side controls: Column toggle, Zoom, AI shortcut, Print */}
        <div className="flex items-center gap-2">
          {/* Column Toggle */}
          <button
            type="button"
            onClick={toggleColumnLayout}
            className={`px-2.5 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              paper.settings.layoutColumns === 2
                ? 'bg-[#d6ece3] text-[#006a4e] border-[#006a4e]/40'
                : 'bg-[#f0f5f2] text-[#55675e] border-[#cfd9d3] hover:bg-[#e9efeb]'
            }`}
            title={paper.settings.layoutColumns === 2 ? '২ কলাম লেআউট সক্রিয়' : '১ কলাম লেআউট সক্রিয়'}
          >
            {paper.settings.layoutColumns === 2 ? <Columns className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">
              {paper.settings.layoutColumns === 2 ? '২ কলাম' : '১ কলাম'}
            </span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-[#f0f5f2] border border-[#cfd9d3] rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
              className="p-1.5 hover:bg-[#d6ece3] text-[#55675e] hover:text-[#006a4e] transition-colors"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-[#55675e] min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
              className="p-1.5 hover:bg-[#d6ece3] text-[#55675e] hover:text-[#006a4e] transition-colors"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="p-1.5 hover:bg-[#d6ece3] text-[#55675e] hover:text-[#006a4e] transition-colors border-l border-[#cfd9d3]"
              title="রিসেট জুম (১০০%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Answer Key */}
          <button
            type="button"
            onClick={onOpenAnswerKey}
            className="px-2.5 py-1.5 rounded bg-[#f0f5f2] hover:bg-[#d6ece3] text-[#12231b] hover:text-[#006a4e] border border-[#cfd9d3] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="উত্তরমালা ও মার্কিং গাইড দেখুন"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#006a4e]" />
            <span className="hidden md:inline">উত্তরমালা</span>
          </button>

          {/* AI Generator Shortcut Button */}
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#006a4e] text-white shadow-xs'
                : 'bg-emerald-50 text-[#006a4e] border border-[#006a4e]/30 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI প্রণেতা</span>
          </button>

          {/* Save/Export dropdown or icons */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-1.5 rounded bg-[#f0f5f2] hover:bg-[#d6ece3] text-[#55675e] hover:text-[#006a4e] border border-[#cfd9d3] transition-colors cursor-pointer"
            title="প্রশ্নপত্র ডাউনলোড করুন (JSON)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 rounded bg-[#f0f5f2] hover:bg-[#d6ece3] text-[#55675e] hover:text-[#006a4e] border border-[#cfd9d3] transition-colors cursor-pointer"
            title="প্রশ্নপত্র আপলোড করুন (JSON)"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Primary Print / PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded bg-[#006a4e] hover:bg-[#085a43] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow"
            title="প্রিন্ট করুন বা PDF হিসেবে সেভ করুন (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
