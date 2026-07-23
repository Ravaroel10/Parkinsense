/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { LiveDataPoint } from '../types';
import { Flame, Thermometer, Droplets, Gauge } from 'lucide-react';

interface LiveChartsProps {
  data: LiveDataPoint[];
}

type TabType = 'gas' | 'temp' | 'humidity' | 'pressure';

export default function LiveCharts({ data }: LiveChartsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gas');

  // Scientific sensor coloring
  const colors = {
    s1: '#0F766E', // Teal Primary
    s2: '#14B8A6', // Cyan Secondary
    s3: '#6366F1', // Indigo
    s4: '#EC4899', // Fuchsia/Pink
  };

  // Metric-specific configurations
  const config = {
    gas: {
      title: 'Gas Sensor Resistance',
      unit: 'kΩ',
      desc: 'VOC adsorption signature (reducing compounds in sebum cause resistance to drop)',
      yDomain: ['auto', 'auto'] as [number | string, number | string],
      keys: {
        s1: 's1Gas',
        s2: 's2Gas',
        s3: 's3Gas',
        s4: 's4Gas',
      },
    },
    temp: {
      title: 'Chamber Temperature',
      unit: '°C',
      desc: 'Inner chamber ambient temperature monitored for gas volume calculations',
      yDomain: [20, 35] as [number | string, number | string],
      keys: {
        s1: 's1Temp',
        s2: 's2Temp',
        s3: 's3Temp',
        s4: 's4Temp',
      },
    },
    humidity: {
      title: 'Relative Humidity',
      unit: '%RH',
      desc: 'Moisture density during skin sebum VOC desorption phases',
      yDomain: [30, 60] as [number | string, number | string],
      keys: {
        s1: 's1Hum',
        s2: 's2Hum',
        s3: 's3Hum',
        s4: 's4Hum',
      },
    },
    pressure: {
      title: 'Barometric Pressure',
      unit: 'hPa',
      desc: 'Chamber pressure to maintain stable volumetric flow models',
      yDomain: ['auto', 'auto'] as [number | string, number | string],
      keys: {
        s1: 's1Press',
        s2: 's2Press',
        s3: 's3Press',
        s4: 's4Press',
      },
    },
  };

  const current = config[activeTab];

  // Custom tooltips for laboratory look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-md font-sans text-xs">
          <div className="font-mono text-zinc-500 mb-1 border-b border-zinc-100 pb-1">
            Elapsed: {label} (s)
          </div>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 my-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-medium text-zinc-700">
                {p.name}:
              </span>
              <span className="font-mono font-semibold ml-auto text-zinc-900">
                {p.value} {current.unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col h-full shadow-xs">
      {/* Tab Selectors */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4 font-sans">
        <div className="min-w-0">
          <h3 className="font-sans font-semibold text-base sm:text-lg text-zinc-800 truncate" title="Sensor Real-Time Telemetry">
            Sensor Real-Time Telemetry
          </h3>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-sans truncate" title={`${current.title} • ${current.desc}`}>
            {current.title} • {current.desc}
          </p>
        </div>
        
        {/* Scientific styled tabs */}
        <div className="flex overflow-x-auto scrollbar-none bg-zinc-50 p-0.5 rounded-xl border border-zinc-200 max-w-full flex-shrink-0 self-start xl:self-auto">
          <button
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] xs:text-xs font-medium transition-all flex-shrink-0 ${
              activeTab === 'gas'
                ? 'bg-white text-black shadow-xs border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Gas (kΩ)</span>
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] xs:text-xs font-medium transition-all flex-shrink-0 ${
              activeTab === 'temp'
                ? 'bg-white text-black shadow-xs border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp (°C)</span>
          </button>
          <button
            onClick={() => setActiveTab('humidity')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] xs:text-xs font-medium transition-all flex-shrink-0 ${
              activeTab === 'humidity'
                ? 'bg-white text-black shadow-xs border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>RH (%)</span>
          </button>
          <button
            onClick={() => setActiveTab('pressure')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] xs:text-xs font-medium transition-all flex-shrink-0 ${
              activeTab === 'pressure'
                ? 'bg-white text-black shadow-xs border border-zinc-200/50'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Pres (hPa)</span>
          </button>
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="flex-1 w-full min-h-[300px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
              <Flame className="w-5 h-5 animate-pulse text-zinc-300" />
            </div>
            <h4 className="font-sans font-medium text-zinc-700 text-sm">Waiting for acquisition stream</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">Start device connection and recording in the "Data Acquisition" panel to begin plotting live sensor data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(226, 232, 240, 0.4)"
              />
              <XAxis
                dataKey="elapsed"
                tickLine={false}
                stroke="#94A3B8"
                style={{ fontSize: 10, fontFamily: 'monospace' }}
              />
              <YAxis
                domain={current.yDomain}
                tickLine={false}
                axisLine={false}
                stroke="#94A3B8"
                style={{ fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: 11,
                  fontFamily: 'Inter',
                  paddingTop: 10,
                }}
              />
              <Line
                name="Sensor 1 (CH1)"
                type="monotone"
                dataKey={current.keys.s1}
                stroke={colors.s1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                name="Sensor 2 (CH2)"
                type="monotone"
                dataKey={current.keys.s2}
                stroke={colors.s2}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                name="Sensor 3 (CH3)"
                type="monotone"
                dataKey={current.keys.s3}
                stroke={colors.s3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                name="Sensor 4 (CH4)"
                type="monotone"
                dataKey={current.keys.s4}
                stroke={colors.s4}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
