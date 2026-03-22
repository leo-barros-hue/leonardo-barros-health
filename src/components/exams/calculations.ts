import { StatusColor } from './types';

export const calculateDeviation = (value: number, min: number, max: number): number => {
  if (value >= min && value <= max) return 0;
  const range = max - min;
  if (range <= 0) return 0;
  if (value < min) return (min - value) / range;
  return (value - max) / range;
};

export const getDynamicColor = (value: number, min: number, max: number): string => {
  if (value >= min && value <= max) return '#22c55e';
  const deviation = calculateDeviation(value, min, max);
  if (deviation <= 0.1) return '#eab308';
  if (deviation <= 0.25) return '#f97316';
  return '#ef4444';
};

export const getStatusColor = (value: number, min: number, max: number): StatusColor => {
  if (value >= min && value <= max) return 'green';
  const deviation = calculateDeviation(value, min, max);
  if (deviation <= 0.1) return 'yellow';
  if (deviation <= 0.25) return 'orange';
  return 'red';
};

export const getInterpretation = (value: number, min: number, max: number): string => {
  if (value >= min && value <= max) return 'Dentro da normalidade';
  const deviation = calculateDeviation(value, min, max);
  if (deviation <= 0.1) return 'Alteração Leve';
  if (deviation <= 0.25) return 'Alteração Moderada';
  return 'Alteração Importante';
};

export const getColorHex = (color: StatusColor): string => {
  switch (color) {
    case 'green': return '#22c55e';
    case 'red': return '#ef4444';
    default: return '#ef4444';
  }
};

export const getBgColorClass = (color: StatusColor): string => {
  switch (color) {
    case 'green': return 'bg-green-500/10 border-green-500/20 text-green-700';
    case 'red': return 'bg-red-500/10 border-red-500/20 text-red-700';
    default: return 'bg-red-500/10 border-red-500/20 text-red-700';
  }
};

export const getBorderColorClass = (color: StatusColor): string => {
  switch (color) {
    case 'green': return 'border-green-500';
    case 'red': return 'border-red-500';
    default: return 'border-red-500';
  }
};

export const calculateMETSIR = (glucose: number, triglycerides: number, bmi: number, hdl: number): number | null => {
  if (!glucose || !triglycerides || !bmi || !hdl || hdl <= 1) return null;
  const score = (Math.log(2 * glucose + triglycerides) * bmi) / Math.log(hdl);
  return score;
};

export const getMETSIRInterpretation = (score: number) => {
  if (score <= 50.39) return { label: 'Excelente', color: '#22c55e', description: 'Sensibilidade insulínica preservada' };
  return { label: 'Resistência à Insulina', color: '#ef4444', description: 'Sugere resistência à insulina' };
};

export const getClinicalInsight = (examId: string, current: number, previous: number, unit: string) => {
  const diff = current - previous;
  const absDiff = Math.abs(diff);
  const percentDiff = (diff / previous) * 100;
  const isIncrease = diff > 0;
  
  const increaseIsGood = ['hdl-colesterol'];
  const decreaseIsGood = ['ldl-colesterol', 'triglicerideos', 'glicemia-jejum', 'hba1c', 'pcr-us', 'homocisteina'];

  let improved = false;
  const neutral = absDiff < 0.001;

  if (increaseIsGood.includes(examId)) {
    improved = isIncrease;
  } else if (decreaseIsGood.includes(examId)) {
    improved = !isIncrease;
  } else {
    return {
      text: neutral ? 'Estável' : (isIncrease ? 'Aumento' : 'Redução'),
      color: neutral ? '#eab308' : '#6366F1',
      icon: neutral ? 'neutral' : (isIncrease ? 'up' : 'down'),
      diff: diff,
      percent: percentDiff
    };
  }

  if (neutral) return { text: 'Estabilidade clínica', color: '#eab308', icon: 'neutral', diff: 0, percent: 0 };

  return {
    text: improved ? 'Melhora clínica' : 'Piora clínica',
    color: improved ? '#22c55e' : '#ef4444',
    icon: improved ? 'up' : 'down',
    diff: diff,
    percent: percentDiff
  };
};
