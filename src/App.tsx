/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { WorkDeskRail } from './components/WorkDeskRail';
import { A4PaperStage } from './components/A4PaperStage';
import { AnswerKeyModal } from './components/AnswerKeyModal';
import { presetTemplates } from './data/presetTemplates';
import { ExamPaper } from './types';

export default function App() {
  // Initialize with the standard SSC Bangla 1st paper preset
  const [paper, setPaper] = useState<ExamPaper>(() => {
    const saved = localStorage.getItem('bangla_question_paper_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback to preset
      }
    }
    return JSON.parse(JSON.stringify(presetTemplates[0]));
  });

  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<string>('header');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState<boolean>(false);

  // Auto-save draft to local storage
  useEffect(() => {
    try {
      localStorage.setItem('bangla_question_paper_draft', JSON.stringify(paper));
    } catch {
      // Ignore quota errors if storage full
    }
  }, [paper]);

  // Adjust default zoom on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setZoom(0.7);
      } else if (window.innerWidth < 1200) {
        setZoom(0.85);
      } else {
        setZoom(1.0);
      }
    };
    handleResize();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleEditQuestionInRail = (id: string) => {
    setEditingQuestionId(id);
    setActiveTab('add');
  };

  const handleAddNewQuestion = () => {
    setEditingQuestionId(null);
    setActiveTab('add');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#e9efeb] text-[#12231b]">
      {/* Top Header Bar */}
      <HeaderBar
        paper={paper}
        setPaper={setPaper}
        zoom={zoom}
        setZoom={setZoom}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrint={handlePrint}
        onOpenAnswerKey={() => setIsAnswerKeyOpen(true)}
      />

      {/* Main Workspace: Left form rail & Right pale A4 stage */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <WorkDeskRail
          paper={paper}
          setPaper={setPaper}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          editingQuestionId={editingQuestionId}
          setEditingQuestionId={setEditingQuestionId}
        />

        <A4PaperStage
          paper={paper}
          setPaper={setPaper}
          zoom={zoom}
          onEditQuestionInRail={handleEditQuestionInRail}
          onAddNewQuestion={handleAddNewQuestion}
        />
      </div>

      {/* Answer Key & Teacher Evaluation Modal */}
      <AnswerKeyModal
        isOpen={isAnswerKeyOpen}
        onClose={() => setIsAnswerKeyOpen(false)}
        paper={paper}
      />
    </div>
  );
}
