interface Props {
  bmi: number;
  showLabel?: boolean;
}

export const getBMIInfo = (bmi: number) => {
  if (bmi === 0) return { label: 'N/A', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100', description: '-', hex: '#9ca3af' };
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-100', description: 'Risco de deficiências nutricionais.', hex: '#60a5fa' };
  if (bmi < 25) return { label: 'Peso ideal', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', description: 'Peso saudável para a altura.', hex: '#22c55e' };
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', description: 'Aumento do risco de comorbidades.', hex: '#eab308' };
  if (bmi < 35) return { label: 'Obesidade grau I', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', description: 'Risco moderado de doenças.', hex: '#f97316' };
  if (bmi < 40) return { label: 'Obesidade grau II', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', description: 'Risco grave de doenças.', hex: '#ef4444' };
  return { label: 'Obesidade grau III', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200', description: 'Risco muito grave de doenças.', hex: '#991b1b' };
};

export default function BMIDisplay({ bmi, showLabel = true }: Props) {
  const info = getBMIInfo(bmi);
  const minBmi = 10;
  const maxBmi = 50;
  const percentage = Math.min(100, Math.max(0, ((bmi - minBmi) / (maxBmi - minBmi)) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Índice de Massa Corporal</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-black font-mono tracking-tighter ${info.color}`}>
              {bmi > 0 ? bmi.toFixed(1) : '--.-'}
            </span>
            <div className="flex flex-col">
              <span className={`text-sm font-bold uppercase ${info.color}`}>{info.label}</span>
              <span className="text-[10px] text-gray-400 font-medium">Classificação Atual</span>
            </div>
          </div>
        </div>
        <div className={`hidden md:block px-4 py-2 rounded-xl border ${info.border} ${info.bg} max-w-xs`}>
          <p className={`text-[10px] leading-tight font-medium ${info.color}`}>{info.description}</p>
        </div>
      </div>

      <div className="relative pt-8 pb-4">
        <div className="absolute top-0 left-0 w-full flex text-[8px] font-bold uppercase tracking-tighter text-gray-400 px-1">
          <div style={{ width: '21.25%' }}>Abaixo</div>
          <div style={{ width: '16.25%' }}>Ideal</div>
          <div style={{ width: '12.5%' }}>Sobrepeso</div>
          <div style={{ width: '12.5%' }}>Grau I</div>
          <div style={{ width: '12.5%' }}>Grau II</div>
          <div style={{ width: '25%' }}>Grau III</div>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-gray-100">
          <div className="h-full bg-blue-300" style={{ width: '21.25%' }} />
          <div className="h-full bg-green-500" style={{ width: '16.25%' }} />
          <div className="h-full bg-yellow-400" style={{ width: '12.5%' }} />
          <div className="h-full bg-orange-400" style={{ width: '12.5%' }} />
          <div className="h-full bg-red-500" style={{ width: '12.5%' }} />
          <div className="h-full bg-red-800" style={{ width: '25%' }} />
        </div>

        {bmi > 0 && (
          <div 
            className="absolute top-6 transition-all duration-700 ease-out z-10"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="flex flex-col items-center group">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-900" />
              <div className="w-1 h-6 bg-gray-900 rounded-full -mt-1 shadow-sm" />
              <div className="mt-1 bg-white border border-gray-200 shadow-sm rounded px-1.5 py-0.5">
                <span className="text-[9px] font-black font-mono text-gray-900">{bmi.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: '< 18.5', color: 'bg-blue-300' },
          { label: '18.5 - 24.9', color: 'bg-green-500' },
          { label: '25 - 29.9', color: 'bg-yellow-400' },
          { label: '30 - 34.9', color: 'bg-orange-400' },
          { label: '35 - 39.9', color: 'bg-red-500' },
          { label: '≥ 40', color: 'bg-red-800' },
        ].map((range, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${range.color}`} />
            <span className="text-[8px] font-bold text-gray-400">{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
