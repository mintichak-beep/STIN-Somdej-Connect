import React, { useState, useEffect } from 'react';
import { practiceSiteService } from '../services/practiceSite.service';
import { PracticeSite } from '../types/practiceSite';

export const PracticeSiteManagement = () => {
  const [sites, setSites] = useState<PracticeSite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    setLoading(true);
    const data = await practiceSiteService.getPracticeSites();
    setSites(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Practice Sites</h1>
        <button className="bg-[#D32F2F] text-white px-4 py-2 rounded-lg font-bold">New Practice Site</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-slate-700">Code</th>
                <th className="px-6 py-3 text-left font-bold text-slate-700">Name</th>
                <th className="px-6 py-3 text-left font-bold text-slate-700">Type</th>
                <th className="px-6 py-3 text-left font-bold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-t">
                  <td className="px-6 py-4">{site.code}</td>
                  <td className="px-6 py-4">{site.name}</td>
                  <td className="px-6 py-4">{site.hospitalType}</td>
                  <td className="px-6 py-4">{site.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
