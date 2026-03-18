import { Assessment } from './types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Trash2, Edit2 } from 'lucide-react';

interface Props {
  assessments: Assessment[];
  onDelete: (id: string) => void;
  onView: (assessment: Assessment) => void;
  onEdit: (assessment: Assessment) => void;
}

export default function AssessmentHistory({ assessments, onDelete, onView, onEdit }: Props) {
  if (assessments.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
        <p className="text-sm font-medium">Nenhuma avaliação registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Data</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Protocolo</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Peso</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">IMC</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">FFMI</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">% Gordura</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">% M. Magra</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">M. Magra (kg)</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">M. Gorda (kg)</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assessments.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-700">
                  {format(parseISO(item.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-4 text-xs text-gray-500">{item.protocol}</td>
                <td className="p-4 text-sm font-mono font-bold text-gray-800">{item.weight} kg</td>
                <td className="p-4 text-sm font-mono text-gray-600">{item.results.imc}</td>
                <td className="p-4 text-sm font-mono text-indigo-600 font-bold">{item.results.ffmi}</td>
                <td className="p-4 text-sm font-mono text-rose-600 font-bold">{item.results.bodyFat}%</td>
                <td className="p-4 text-sm font-mono text-emerald-600">{(100 - item.results.bodyFat).toFixed(2)}%</td>
                <td className="p-4 text-sm font-mono text-emerald-700 font-bold">{item.results.leanMass} kg</td>
                <td className="p-4 text-sm font-mono text-rose-700">{item.results.fatMass} kg</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(item)} className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(item)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
