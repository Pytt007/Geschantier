import React, { useState } from 'react';
import { analyzeRisks } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { Icon } from '../components/Icon';
import ReactMarkdown from 'react-markdown';

export const RiskAnalysis: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!situation.trim()) return;
    setIsLoading(true);
    setAnalysis('');
    try {
      const result = await analyzeRisks(situation);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Erreur lors de l'analyse des risques.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analyse de Risques Assistée par IA</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Icon name="shield" className="w-6 h-6 mr-2 text-amber-600"/>
            1. Décrivez la situation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Expliquez une tâche ou une opération. L'IA identifiera les dangers potentiels et suggérera des actions préventives.
          </p>
          
          <label htmlFor="situation-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Situation à analyser
          </label>
          <textarea
            id="situation-desc"
            rows={10}
            className="w-full p-3 bg-white dark:bg-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            placeholder="Ex: Travaux de soudure en hauteur sur un échafaudage par temps venteux."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !situation.trim()}
            className="mt-6 w-full flex justify-center items-center bg-amber-600 text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner /> : 'Analyser les Risques'}
          </button>
        </div>

        <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">2. Analyse des Risques</h3>
          <div className="prose prose-slate dark:prose-invert max-w-none h-[30rem] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
            {analysis ? (
              <ReactMarkdown components={{
                table: ({node, ...props}) => <table className="w-full text-sm" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-slate-200 dark:bg-slate-700" {...props} />,
                th: ({node, ...props}) => <th className="p-2 text-left" {...props} />,
                td: ({node, ...props}) => <td className="p-2 border-t dark:border-slate-600" {...props} />,
              }}>{analysis}</ReactMarkdown>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <p>L'analyse des risques apparaîtra ici...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};