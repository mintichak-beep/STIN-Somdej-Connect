import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { paymentUtilityService } from '../services/paymentUtility.service';
import { UtilityShare } from '../types/db';
import { Upload } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function StudentUtilities() {
  const [shares, setShares] = useState<UtilityShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await paymentUtilityService.getShares();
        setShares(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Utility Bills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shares.map(share => (
          <DashboardCard key={share.id} title={`Bill ID: ${share.utilityRecordId}`}>
            <p className="text-sm">Amount: {share.sharedAmount} THB</p>
            <p className="text-sm">Status: {share.paymentStatus}</p>
            {share.paymentStatus === 'pending' && (
                <button className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                    <Upload className="h-4 w-4" /> Upload Proof
                </button>
            )}
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
