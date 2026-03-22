import { ReferenceRange } from './types';

interface ReferenceRangeDisplayProps {
  referenceRange: {
    unisex?: ReferenceRange;
    male?: ReferenceRange;
    female?: ReferenceRange;
  };
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  showLabels?: boolean;
}

export const ReferenceRangeDisplay = ({ 
  referenceRange, 
  className = "", 
  labelClassName = "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
  valueClassName = "text-sm font-black text-primary",
  showLabels = true
}: ReferenceRangeDisplayProps) => {
  if (referenceRange.unisex) {
    return (
      <div className={className}>
        {showLabels ? (
          <p className={labelClassName}>Intervalo de Referência</p>
        ) : (
          <span className="text-muted-foreground mr-1">Ref:</span>
        )}
        <p className={showLabels ? valueClassName : "inline " + valueClassName}>
          {referenceRange.unisex.min} - {referenceRange.unisex.max}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {showLabels ? (
        <p className={labelClassName}>Intervalo de Referência</p>
      ) : (
        <span className="text-muted-foreground mr-1">Ref:</span>
      )}
      <div className={showLabels ? "flex gap-4" : "inline-flex gap-3"}>
        {referenceRange.male && (
          <div className="inline-flex items-center">
            <span className="text-[9px] font-bold text-blue-400 uppercase mr-1">M:</span>
            <span className={valueClassName}>{referenceRange.male.min} - {referenceRange.male.max}</span>
          </div>
        )}
        {referenceRange.female && (
          <div className="inline-flex items-center">
            <span className="text-[9px] font-bold text-pink-400 uppercase mr-1">F:</span>
            <span className={valueClassName}>{referenceRange.female.min} - {referenceRange.female.max}</span>
          </div>
        )}
      </div>
    </div>
  );
};
