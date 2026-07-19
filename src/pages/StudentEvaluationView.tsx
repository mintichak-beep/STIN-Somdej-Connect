import React, { useState, useEffect } from 'react';
import { evaluationService } from '../services/evaluation.service';
import { Evaluation } from '../types/db';
import { DashboardCard } from '../components/DashboardCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function StudentEvaluationView({ studentId }: { studentId: string }) {
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await evaluationService.getStudentEvaluations(studentId);
        setEvals(data);
        setLoading(false);
    }
    fetchData();
  }, [studentId]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Evaluations</h2>
      <div className="space-y-4">
        {evals.map(ev => (
            <DashboardCard key={ev.id} title={`Evaluation on ${ev.createdAt}`}>
                <p className="text-sm">Total Score: {ev.totalScore} ({ev.percentage}%)</p>
                <p className="text-sm">Grade: {ev.grade}</p>
                <p className="text-sm mt-2 font-bold">Feedback: {ev.comment}</p>
            </DashboardCard>
        ))}
      </div>
    </div>
  );
}
