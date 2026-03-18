interface Props {
  value: number;
  type: 'bmi' | 'ffmi' | 'bodyFat';
  gender?: 'male' | 'female';
}

export default function ResultSpectrum({ value, type, gender = 'male' }: Props) {
  let percentage = 0;
  let label = '';
  let colorClass = 'text-gray-400';
  let segments: { width: string; color: string; label: string }[] = [];

  if (type === 'bmi') {
    const min = 10;
    const max = 50;
    percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    
    if (value < 18.5) { label = 'Abaixo'; colorClass = 'text-blue-400'; }
    else if (value < 25) { label = 'Ideal'; colorClass = 'text-green-500'; }
    else if (value < 30) { label = 'Sobrepeso'; colorClass = 'text-yellow-500'; }
    else if (value < 35) { label = 'Obesidade grau I'; colorClass = 'text-orange-500'; }
    else if (value < 40) { label = 'Obesidade grau II'; colorClass = 'text-red-500'; }
    else { label = 'Obesidade grau III'; colorClass = 'text-red-800'; }

    segments = [
      { width: '21.25%', color: 'bg-blue-300', label: 'Abaixo' },
      { width: '16.25%', color: 'bg-green-500', label: 'Ideal' },
      { width: '12.5%', color: 'bg-yellow-400', label: 'Sobre' },
      { width: '12.5%', color: 'bg-orange-400', label: 'Grau I' },
      { width: '12.5%', color: 'bg-red-500', label: 'Grau II' },
      { width: '25%', color: 'bg-red-800', label: 'Grau III' },
    ];
  } else if (type === 'ffmi') {
    if (gender === 'male') {
      const min = 15;
      const max = 30;
      percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

      if (value < 18) { label = 'Baixo desenvolvimento muscular'; colorClass = 'text-blue-400'; }
      else if (value < 20) { label = 'Média populacional'; colorClass = 'text-green-500'; }
      else if (value < 22) { label = 'Bom desenvolvimento muscular'; colorClass = 'text-yellow-500'; }
      else if (value < 25) { label = 'Alto desenvolvimento muscular'; colorClass = 'text-orange-500'; }
      else { label = 'Possível uso de esteroides'; colorClass = 'text-red-600'; }

      segments = [
        { width: '20%', color: 'bg-blue-300', label: 'Baixo' },
        { width: '13.3%', color: 'bg-green-500', label: 'Média' },
        { width: '13.3%', color: 'bg-yellow-400', label: 'Bom' },
        { width: '20%', color: 'bg-orange-400', label: 'Alto' },
        { width: '33.4%', color: 'bg-red-600', label: 'Ester.' },
      ];
    } else {
      const min = 12;
      const max = 27;
      percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

      if (value < 15) { label = 'Baixo desenvolvimento muscular'; colorClass = 'text-blue-400'; }
      else if (value < 17) { label = 'Média populacional'; colorClass = 'text-green-500'; }
      else if (value < 19) { label = 'Bom desenvolvimento muscular'; colorClass = 'text-yellow-500'; }
      else if (value < 21) { label = 'Muito alto desenvolvimento muscular'; colorClass = 'text-orange-500'; }
      else { label = 'Possível uso de esteroides'; colorClass = 'text-red-600'; }

      segments = [
        { width: '20%', color: 'bg-blue-300', label: 'Baixo' },
        { width: '13.3%', color: 'bg-green-500', label: 'Média' },
        { width: '13.3%', color: 'bg-yellow-400', label: 'Bom' },
        { width: '13.3%', color: 'bg-orange-400', label: 'M. Alto' },
        { width: '40.1%', color: 'bg-red-600', label: 'Ester.' },
      ];
    }
  } else if (type === 'bodyFat') {
    if (gender === 'male') {
      const min = 0;
      const max = 40;
      percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

      if (value < 6) { label = 'Gordura Essencial'; colorClass = 'text-blue-400'; }
      else if (value < 14) { label = 'Atleta'; colorClass = 'text-emerald-400'; }
      else if (value < 18) { label = 'Fitness/Saudável'; colorClass = 'text-green-500'; }
      else if (value < 25) { label = 'Aceitável'; colorClass = 'text-yellow-500'; }
      else if (value < 30) { label = 'Sobrepeso'; colorClass = 'text-orange-500'; }
      else { label = 'Obesidade'; colorClass = 'text-red-600'; }

      segments = [
        { width: '15%', color: 'bg-blue-300', label: 'Essenc.' },
        { width: '20%', color: 'bg-emerald-400', label: 'Atleta' },
        { width: '10%', color: 'bg-green-500', label: 'Fit' },
        { width: '17.5%', color: 'bg-yellow-400', label: 'Aceit.' },
        { width: '12.5%', color: 'bg-orange-400', label: 'Sobre' },
        { width: '25%', color: 'bg-red-600', label: 'Obeso' },
      ];
    } else {
      const min = 5;
      const max = 50;
      percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

      if (value < 14) { label = 'Gordura Essencial'; colorClass = 'text-blue-400'; }
      else if (value < 21) { label = 'Atleta'; colorClass = 'text-emerald-400'; }
      else if (value < 25) { label = 'Fitness/Saudável'; colorClass = 'text-green-500'; }
      else if (value < 32) { label = 'Aceitável'; colorClass = 'text-yellow-500'; }
      else if (value < 39) { label = 'Sobrepeso'; colorClass = 'text-orange-500'; }
      else { label = 'Obesidade'; colorClass = 'text-red-600'; }

      segments = [
        { width: '20%', color: 'bg-blue-300', label: 'Essenc.' },
        { width: '15.5%', color: 'bg-emerald-400', label: 'Atleta' },
        { width: '8.9%', color: 'bg-green-500', label: 'Fit' },
        { width: '15.5%', color: 'bg-yellow-400', label: 'Aceit.' },
        { width: '15.5%', color: 'bg-orange-400', label: 'Sobre' },
        { width: '24.6%', color: 'bg-red-600', label: 'Obeso' },
      ];
    }
  }

  return (
    <div className="mt-3 space-y-2 w-full">
      <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
        {segments.map((seg, i) => (
          <div key={i} className={`h-full ${seg.color}`} style={{ width: seg.width }} />
        ))}
      </div>
      
      <div className="relative h-4">
        {value > 0 && (
          <div 
            className="absolute -top-3 transition-all duration-700 ease-out flex flex-col items-center"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-800" />
            <span className="text-[9px] font-black font-mono text-gray-800 bg-white px-1 rounded border border-gray-100 shadow-sm">
              {value.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-0.5">
        <span className={`text-[9px] font-black uppercase tracking-tighter ${colorClass}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
