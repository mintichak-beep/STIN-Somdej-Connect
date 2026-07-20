import React, { useState } from 'react';
import { feedbackService } from '../services/feedback.service';
import { DashboardCard } from '../components/DashboardCard';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UserFeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) return;
    await feedbackService.submit({
        userId: user.uid,
        role: 'student', // Simplification for demo
        rating,
        comment,
        module: 'General'
    });
    alert('Thank you for your feedback!');
    setComment('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">User Feedback</h2>
      <DashboardCard title="Submit Feedback" icon={MessageSquare}>
        <div className="space-y-4">
            <div>
                <label className="block text-sm">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value) || 0)} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
                <label className="block text-sm">Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border rounded px-2 py-1 w-full h-24" />
            </div>
            <button onClick={handleSubmit} className="bg-red-600 text-white px-4 py-2 rounded">Submit</button>
        </div>
      </DashboardCard>
    </div>
  );
}
