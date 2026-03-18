import { Assessment } from './types';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getBMIInfo } from './BMIDisplay';

interface Props {
  current: Assessment;
  previous?: Assessment;
}

export default function ResultsCard({ current, previous }: Props) {
  const getDiff = (key: 'bodyFat' | 'weight' | 'leanMass' | 'fatMass' | 'imc' | 'ffmi') => {
    if (!previous) return null;
    const currVal = key === 'weight' ? current.weight : current.results[key];
    const prevVal = key === 'weight' ? previous.weight : previous.results[key];
    const diff = currVal - prevVal;
    return {
      value: Math.abs(diff).toFixed(2),
      isUp: diff > 0,
      isDown: diff < 0,
      isNeutral: diff === 0
    };
  };

  const bmiInfo = getBMIInfo(current.results.imc);

  const stats = [
    { 
      label: 'Percentual de Gordura', 
      value: `${current.results.bodyFat}%`, 
      key: 'bodyFat', 
      color: 'text-rose-600',
      getDiffColor: (isUp: boolean) => isUp ? 'text-rose-500' : 'text-emerald-500'
    },
    { 
      label: 'Peso Corporal', 
      value: `${current.weight} kg`, 
      key: 'weight', 
      color: 'text-gray-900',
      getDiffColor: (isUp: boolean) => isUp ? 'text-rose-500' : 'text-emerald-500'
    },
    { 
      label: 'Massa Magra', 
      value: `${current.results.leanMass} kg`, 
      key: 'leanMass', 
      color: 'text-emerald-600',
      getDiffColor: (isUp: boolean) => isUp ? 'text-emerald-500' : 'text-rose-500'
    },
    { 
      label: `IMC - ${bmiInfo.label}`, 
      value: `${current.results.imc}`, 
      key: 'imc', 
      color: bmiInfo.color,
      getDiffColor: (isUp: boolean) => isUp ? 'text-rose-500' : 'text-emerald-500'
    },
    { 
      label: 'FFMI', 
      value: `${current.results.ffmi}`, 
      key: 'ffmi', 
      color: 'text-indigo-600',
      getDiffColor: (isUp: boolean) => isUp ? 'text-emerald-500' : 'text-rose-500'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          Última Avaliação
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-tighter">
            {current.date}
          </span>
        </h3>
        {previous && (
          <span className="text-[10px] font-medium text-gray-400">
            Comparado a {previous.date}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const diff = getDiff(stat.key as any);
          return (
            <div key={stat.key} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</span>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
                {diff && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${diff.isNeutral ? 'text-gray-400' : stat.getDiffColor(diff.isUp)}`}>
                    {diff.isUp ? <TrendingUp size={12} /> : diff.isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {diff.value}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
