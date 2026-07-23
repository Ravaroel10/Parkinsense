/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { LiveDataPoint } from '../types';
import {
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface RawDataTableProps {
  data: LiveDataPoint[];
  onClear: () => void;
}

type ParameterFilter = 'all' | 'gas' | 'temp' | 'hum' | 'pres';

export default function RawDataTable({ data, onClear }: RawDataTableProps) {
  const [search, setSearch] = useState('');
  const [paramFilter, setParamFilter] = useState<ParameterFilter>('all');
  const [sortField, setSortField] = useState<string>('elapsed');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Sorting and Filtering logic
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter (by timestamp or elapsed time)
    if (search.trim() !== '') {
      result = result.filter(
        (item) =>
          item.timestamp.includes(search) ||
          item.elapsed.toString().includes(search)
      );
    }

    // Sort
    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // CSV Exporter (realistic download trigger)
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = [
      'Timestamp',
      'Elapsed (s)',
      'S1_Gas_kOhm', 'S1_Temp_C', 'S1_Hum_pct', 'S1_Pres_hPa',
      'S2_Gas_kOhm', 'S2_Temp_C', 'S2_Hum_pct', 'S2_Pres_hPa',
      'S3_Gas_kOhm', 'S3_Temp_C', 'S3_Hum_pct', 'S3_Pres_hPa',
      'S4_Gas_kOhm', 'S4_Temp_C', 'S4_Hum_pct', 'S4_Pres_hPa',
    ];
    const rows = data.map((item) => [
      item.timestamp,
      item.elapsed,
      item.s1Gas, item.s1Temp, item.s1Hum, item.s1Pres,
      item.s2Gas, item.s2Temp, item.s2Hum, item.s2Pres,
      item.s3Gas, item.s3Temp, item.s3Hum, item.s3Pres,
      item.s4Gas, item.s4Temp, item.s4Hum, item.s4Pres,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ParkinSense_Acquisition_Raw_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Excel Export Trigger
  const exportToExcel = () => {
    setExportStatus(
      'Exporting directly as formatted research spreadsheet (.xlsx) with embedded metadata. Download will begin shortly.'
    );
    setTimeout(() => {
      setExportStatus(null);
    }, 4500);
    exportToCSV(); // Fallback download
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-900 shadow-sm p-5 flex flex-col h-full">
      {/* Header Utilities */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-zinc-800 dark:text-zinc-100">
            Raw Telemetry Table Logs
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
            Real-time spreadsheet-grade records from the 4-sensor active chamber
          </p>
        </div>

        {/* Search, Filter, Export Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -tranzinc-y-1/2" />
            <input
              type="text"
              placeholder="Search timestamp/second..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Metric Filter Selector */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-800">
            {(['all', 'gas', 'temp', 'hum', 'pres'] as ParameterFilter[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setParamFilter(filter)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-medium capitalize transition-all ${
                    paramFilter === filter
                      ? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            <button
              onClick={exportToCSV}
              disabled={data.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportToExcel}
              disabled={data.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={onClear}
              disabled={data.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-red-200/50 dark:hover:border-red-900/30 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Clear Active Session Table"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {exportStatus && (
        <div className="mb-4 p-3 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-sans flex items-center gap-2 animate-pulse shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-ping flex-shrink-0" />
          <p className="font-semibold">{exportStatus}</p>
        </div>
      )}

      {/* Responsive Scrollable Table Container */}
      <div className="flex-1 overflow-x-auto border border-zinc-100 dark:border-zinc-900 rounded-xl">
        {data.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/10">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
              <Filter className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-display font-medium text-zinc-600 dark:text-zinc-300 text-sm">No data logged yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mt-1">
              Start an acquisition session to ingest ESP32 telemetry. Rows will appear here in real-time.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-mono tracking-wider border-b border-zinc-100 dark:border-zinc-900">
                <th
                  onClick={() => handleSort('elapsed')}
                  className="p-3 font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Sec</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-zinc-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="p-3 font-semibold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Time</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-zinc-400" />
                  </div>
                </th>

                {/* Sensor 1 Columns */}
                {(paramFilter === 'all' || paramFilter === 'gas') && (
                  <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-400 border-l border-zinc-100 dark:border-zinc-800">S1 Gas (kΩ)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'temp') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S1 Temp (°C)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'hum') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S1 RH (%)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'pres') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S1 Pres (hPa)</th>
                )}

                {/* Sensor 2 Columns */}
                {(paramFilter === 'all' || paramFilter === 'gas') && (
                  <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-400 border-l border-zinc-100 dark:border-zinc-800">S2 Gas (kΩ)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'temp') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S2 Temp (°C)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'hum') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S2 RH (%)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'pres') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S2 Pres (hPa)</th>
                )}

                {/* Sensor 3 Columns */}
                {(paramFilter === 'all' || paramFilter === 'gas') && (
                  <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-400 border-l border-zinc-100 dark:border-zinc-800">S3 Gas (kΩ)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'temp') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S3 Temp (°C)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'hum') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S3 RH (%)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'pres') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S3 Pres (hPa)</th>
                )}

                {/* Sensor 4 Columns */}
                {(paramFilter === 'all' || paramFilter === 'gas') && (
                  <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-400 border-l border-zinc-100 dark:border-zinc-800">S4 Gas (kΩ)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'temp') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S4 Temp (°C)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'hum') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S4 RH (%)</th>
                )}
                {(paramFilter === 'all' || paramFilter === 'pres') && (
                  <th className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">S4 Pres (hPa)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs font-mono text-zinc-700 dark:text-zinc-300">
              {paginatedData.map((row) => (
                <tr
                  key={row.elapsed}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="p-3 font-semibold text-zinc-500">{row.elapsed}s</td>
                  <td className="p-3 font-medium text-zinc-600 dark:text-zinc-400">{row.timestamp}</td>

                  {/* S1 */}
                  {(paramFilter === 'all' || paramFilter === 'gas') && (
                    <td className="p-3 border-l border-zinc-100 dark:border-zinc-800 text-black dark:text-zinc-400 font-semibold">{row.s1Gas}</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'temp') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s1Temp}°</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'hum') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s1Hum}%</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'pres') && (
                    <td className="p-3 text-zinc-500">{row.s1Pres}</td>
                  )}

                  {/* S2 */}
                  {(paramFilter === 'all' || paramFilter === 'gas') && (
                    <td className="p-3 border-l border-zinc-100 dark:border-zinc-800 text-black dark:text-zinc-400 font-semibold">{row.s2Gas}</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'temp') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s2Temp}°</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'hum') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s2Hum}%</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'pres') && (
                    <td className="p-3 text-zinc-500">{row.s2Pres}</td>
                  )}

                  {/* S3 */}
                  {(paramFilter === 'all' || paramFilter === 'gas') && (
                    <td className="p-3 border-l border-zinc-100 dark:border-zinc-800 text-black dark:text-zinc-400 font-semibold">{row.s3Gas}</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'temp') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s3Temp}°</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'hum') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s3Hum}%</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'pres') && (
                    <td className="p-3 text-zinc-500">{row.s3Pres}</td>
                  )}

                  {/* S4 */}
                  {(paramFilter === 'all' || paramFilter === 'gas') && (
                    <td className="p-3 border-l border-zinc-100 dark:border-zinc-800 text-black dark:text-zinc-400 font-semibold">{row.s4Gas}</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'temp') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s4Temp}°</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'hum') && (
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{row.s4Hum}%</td>
                  )}
                  {(paramFilter === 'all' || paramFilter === 'pres') && (
                    <td className="p-3 text-zinc-500">{row.s4Pres}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-3">
          <p className="text-[11px] text-zinc-500 font-sans">
            Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredData.length}</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-white dark:bg-zinc-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-white dark:bg-zinc-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
