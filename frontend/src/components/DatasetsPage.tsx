/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ChangeEvent } from 'react';
import { DatasetItem, LiveDataPoint } from '../types';
import {
  FileText,
  Download,
  Trash2,
  Eye,
  LineChart as ChartIcon,
  Search,
  Activity,
  HardDrive,
  Users,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface DatasetsPageProps {
  datasets: DatasetItem[];
  onDeleteDataset: (id: string) => void;
  onAddDataset?: (dataset: DatasetItem) => void;
}

export default function DatasetsPage({ datasets, onDeleteDataset, onAddDataset }: DatasetsPageProps) {
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'Healthy' | 'Parkinson'>('all');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  
  // Cache plots for previewing items using actual seriesData if present
const previewData = useMemo(() => {
  if (!previewingId) return [];

  const ds = datasets.find((d) => d.id === previewingId);

  if (!ds) return [];

  return ds.seriesData ?? [];
}, [previewingId, datasets]);

  // Statistics calculations directly from actual saved dataset items
  const stats = useMemo(() => {
    const total = datasets.length;
    const parkCount = datasets.filter((d) => d.diagnosis === 'Parkinson').length;
    const healthyCount = datasets.filter((d) => d.diagnosis === 'Healthy').length;
    const totalSamples = datasets.reduce((acc, curr) => acc + curr.samplesCount, 0);
    const avgDuration = total > 0 ? Math.round(datasets.reduce((acc, curr) => acc + curr.duration, 0) / total) : 0;
    
    const storageKB = datasets.reduce((acc, curr) => {
      const num = parseFloat(curr.fileSize) || 0;
      return acc + num;
    }, 0);

    return {
      total,
      parkCount,
      healthyCount,
      totalSamples,
      avgDuration,
      storageUsed: `${(storageKB / 1024).toFixed(2)} MB`,
    };
  }, [datasets]);

  // Filtered dataset records
  const filteredDatasets = useMemo(() => {
    return datasets.filter((item) => {
      const matchesSearch =
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.participantId.toLowerCase().includes(search.toLowerCase()) ||
        item.sampleId.toLowerCase().includes(search.toLowerCase()) ||
        item.operator.toLowerCase().includes(search.toLowerCase());
      
      const matchesCohort = cohortFilter === 'all' || item.diagnosis === cohortFilter;
      
      return matchesSearch && matchesCohort;
    });
  }, [datasets, search, cohortFilter]);

  // File Upload Handler
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((line) => line.trim().length > 0);
      if (lines.length < 2) return;

      const seriesData: LiveDataPoint[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < 2) continue;

        const elapsed = parseFloat(cols[1]) || i;
        const s1Gas = parseFloat(cols[2]) || 0;
        const s2Gas = parseFloat(cols[3]) || 0;
        const s3Gas = parseFloat(cols[4]) || 0;
        const s4Gas = parseFloat(cols[5]) || 0;

        const baseTimestamp = cols[0] || `${i}s`;
        seriesData.push({
          timestamp: baseTimestamp,
          elapsed,
          s1Gas,
          s2Gas,
          s3Gas,
          s4Gas,
          s1Temp: parseFloat(cols[6]) || 0,
          s2Temp: parseFloat(cols[7]) || 0,
          s3Temp: parseFloat(cols[8]) || 0,
          s4Temp: parseFloat(cols[9]) || 0,
          s1Hum: parseFloat(cols[10]) || 0,
          s2Hum: parseFloat(cols[11]) || 0,
          s3Hum: parseFloat(cols[12]) || 0,
          s4Hum: parseFloat(cols[13]) || 0,
          s1Press: parseFloat(cols[14]) || 0,
          s2Press: parseFloat(cols[15]) || 0,
          s3Press: parseFloat(cols[16]) || 0,
          s4Press: parseFloat(cols[17]) || 0,
        });
      }

      const isParkinson = file.name.toLowerCase().includes('park') || file.name.toLowerCase().includes('pd');
      const baseName = file.name.replace(/\.csv$/i, '').replace(/\s+/g, '-').toUpperCase();
      const newDataset: DatasetItem = {
        id: `REC-${Date.now()}`,
        filename: file.name,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        participantId: baseName.slice(0, 12) || 'SUBJ-001',
        sampleId: baseName.includes('SEB') ? baseName : `SEB-${Date.now().toString().slice(-3)}`,
        diagnosis: isParkinson ? 'Parkinson' : 'Healthy',
        duration: seriesData.length > 0 ? seriesData[seriesData.length - 1].elapsed : 300,
        samplesCount: seriesData.length,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        operator: 'Research Operator',
        seriesData,
      };

      if (onAddDataset) {
        onAddDataset(newDataset);
      }
    };

    reader.readAsText(file);
  };

  // Download Action
  const triggerDownload = (item: DatasetItem) => {
  const series = item.seriesData ?? [];
    const headers = ['Timestamp', 'Elapsed_Sec', 'CH1_Gas_kOhm', 'CH2_Gas_kOhm', 'CH3_Gas_kOhm', 'CH4_Gas_kOhm'];
    const rows = series.map((s) => [
      s.timestamp,
      s.elapsed,
      s.s1Gas,
      s.s2Gas,
      s.s3Gas,
      s.s4Gas,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-zinc-100">
      
      {/* MONOCHROME STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Research Datasets</p>
            <p className="text-2xl font-display font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-zinc-500 font-sans">Saved clinical CSV files</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Cohort Mix */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Cohort Balance</p>
            <p className="text-xl font-display font-bold text-white">
              <span className="text-white">{stats.parkCount} PD</span>
              <span className="text-zinc-600 mx-1.5">•</span>
              <span className="text-zinc-400">{stats.healthyCount} HC</span>
            </p>
            <p className="text-[10px] text-zinc-500 font-sans">Parkinson vs Healthy Control</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Volatile Frame Samples */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Total Timeframes</p>
            <p className="text-2xl font-display font-bold text-white">
              {stats.totalSamples.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 font-sans">Avg {stats.avgDuration}s per session</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Vault Storage size */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Storage Utilized</p>
            <p className="text-2xl font-display font-bold text-white">{stats.storageUsed}</p>
            <p className="text-[10px] text-zinc-500 font-sans">Direct database payload</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & DATABASE EXPLORER LIST */}
      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-white">
              Research Dataset Vault
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Browse, analyze, and manage stored diagnostic chemical recordings.
            </p>
          </div>

          {/* Search, Filter Tools & CSV Upload Button */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV Dataset</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -tranzinc-y-1/2" />
              <input
                type="text"
                placeholder="Search PID, operator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-48 rounded-xl border border-zinc-800 bg-[#09090b] text-xs focus:outline-none focus:border-zinc-500 text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex bg-[#09090b] rounded-xl p-1 border border-zinc-800">
              <button
                onClick={() => setCohortFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  cohortFilter === 'all'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCohortFilter('Parkinson')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  cohortFilter === 'Parkinson'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                PD
              </button>
              <button
                onClick={() => setCohortFilter('Healthy')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  cohortFilter === 'Healthy'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                HC
              </button>
            </div>
          </div>
        </div>

        {/* DATABASE TABLE / EMPTY STATE */}
        <div className="overflow-x-auto">
          {filteredDatasets.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#09090b] p-8">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white font-sans">No research datasets found</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No recorded samples match your filter, or no dataset has been created yet. Perform an acquisition session or upload a CSV file.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <label className="cursor-pointer bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-zinc-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV File</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDatasets.map((item) => (
                <div key={item.id} className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#09090b] hover:border-zinc-700 transition-all">
                  {/* File Header Row */}
                  <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center flex-shrink-0 border border-zinc-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <p className="font-mono text-xs font-bold text-white">{item.filename}</p>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            item.diagnosis === 'Parkinson'
                              ? 'bg-white text-black'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}>
                            {item.diagnosis === 'Parkinson' ? 'PD' : 'Healthy Control'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 font-sans mt-1">
                          <span>PID: <span className="font-semibold text-zinc-200">{item.participantId}</span></span>
                          <span className="text-zinc-700">•</span>
                          <span>SID: <span className="font-semibold text-zinc-200">{item.sampleId}</span></span>
                          <span className="text-zinc-700">•</span>
                          <span>Logged: <span className="font-mono text-zinc-400">{item.timestamp}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Indicators and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                      <div className="hidden md:block text-right font-sans text-xs text-zinc-400 mr-2">
                        <p className="font-mono text-[10px] font-semibold text-zinc-200">{item.fileSize}</p>
                        <p className="text-[10px] text-zinc-500">{item.samplesCount} samples ({item.duration}s)</p>
                      </div>

                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        {/* Toggle Preview */}
                        <button
                          onClick={() => setPreviewingId(previewingId === item.id ? null : item.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            previewingId === item.id
                              ? 'bg-white text-black border-white'
                              : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-zinc-200'
                          }`}
                          title="Preview Sensor Curves"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Curves</span>
                          {previewingId === item.id ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                        </button>

                        <button
                          onClick={() => triggerDownload(item)}
                          className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                          title="Download raw CSV file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">CSV</span>
                        </button>

                        <button
                          onClick={() => onDeleteDataset(item.id)}
                          className="p-2 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Purge record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Scientific Preview Panel */}
                  {previewingId === item.id && (
                    <div className="border-t border-zinc-800 bg-[#121214] p-4 sm:p-6">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans mb-4 border-b border-zinc-800 pb-2">
                        <ChartIcon className="w-4 h-4 text-white" />
                        <span className="font-semibold text-white">Headspace Desorption Profile Preview:</span>
                        <span className="font-mono text-[10px] text-zinc-500">CH1-CH4 Gas Resistance curves</span>
                      </div>

                      {/* Mini Recharts Curve Preview */}
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={previewData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="elapsed" stroke="#71717a" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                            <YAxis stroke="#71717a" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                            <Tooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-black text-white p-2.5 rounded-xl border border-zinc-800 text-[10px] font-mono shadow-lg">
                                      <p className="text-zinc-400">Elapsed: {payload[0].payload.elapsed}s</p>
                                      {payload.map((p: any) => (
                                        <p key={p.name} style={{ color: p.color }}>
                                          {p.name}: {p.value} kΩ
                                        </p>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line name="CH1" type="monotone" dataKey="s1Gas" stroke="#ffffff" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line name="CH2" type="monotone" dataKey="s2Gas" stroke="#a1a1aa" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line name="CH3" type="monotone" dataKey="s3Gas" stroke="#71717a" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            <Line name="CH4" type="monotone" dataKey="s4Gas" stroke="#3f3f46" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 text-[11px] text-zinc-400 font-sans leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p>
                          <span className="font-semibold text-zinc-200">Volumetric signature classification:</span> This profile shows the gas resistance response under exposure to organic headspace molecules. Under Parkinson sebum VOC exposure, the sensors experience heightened adsorption of aldehydes, resulting in steeper downward resistance.
                        </p>
                        <div className="bg-[#09090b] p-3 rounded-xl border border-zinc-800 font-mono text-[10px] flex flex-col justify-center space-y-1 text-zinc-300">
                          <p>• Operator: {item.operator}</p>
                          <p>• Sample ID: {item.sampleId}</p>
                          <p>• Sensor Hardware: Bosch BME680 Rev 1.2</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
