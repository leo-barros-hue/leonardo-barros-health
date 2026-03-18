import { Protocol, Gender, Skinfolds } from './types';

export function calculateAssessment(
  protocol: Protocol,
  gender: Gender,
  age: number,
  weight: number,
  height: number,
  skinfolds: Skinfolds
) {
  const folds = Object.values(skinfolds).filter((v): v is number => v !== undefined);
  const sumFolds = folds.reduce((acc, val) => acc + val, 0);

  let bodyFat = 0;

  switch (protocol) {
    case '3 dobras Guedes': {
      const density = gender === 'Masculino'
        ? 1.17136 - 0.06706 * Math.log10(sumFolds)
        : 1.16650 - 0.07063 * Math.log10(sumFolds);
      bodyFat = ((4.95 / density) - 4.50) * 100;
      break;
    }

    case '3 dobras Jackson & Pollock': {
      const density = gender === 'Masculino'
        ? 1.10938 - (0.0008267 * sumFolds) + (0.0000016 * Math.pow(sumFolds, 2)) - (0.0002574 * age)
        : 1.0994921 - (0.0009929 * sumFolds) + (0.0000023 * Math.pow(sumFolds, 2)) - (0.0001392 * age);
      bodyFat = ((4.95 / density) - 4.50) * 100;
      break;
    }

    case '4 dobras Durnin & Womersley': {
      let c = 1.1620, m = 0.0630;
      if (gender === 'Masculino') {
        if (age < 20) { c = 1.1620; m = 0.0630; }
        else if (age < 30) { c = 1.1631; m = 0.0632; }
        else if (age < 40) { c = 1.1422; m = 0.0544; }
        else if (age < 50) { c = 1.1620; m = 0.0700; }
        else { c = 1.1715; m = 0.0779; }
      } else {
        if (age < 20) { c = 1.1549; m = 0.0678; }
        else if (age < 30) { c = 1.1599; m = 0.0717; }
        else if (age < 40) { c = 1.1423; m = 0.0632; }
        else if (age < 50) { c = 1.1333; m = 0.0612; }
        else { c = 1.1339; m = 0.0645; }
      }
      const density = c - (m * Math.log10(sumFolds));
      bodyFat = ((4.95 / density) - 4.50) * 100;
      break;
    }

    case '4 dobras Faulkner': {
      bodyFat = (sumFolds * 0.153) + 5.783;
      break;
    }

    case '7 dobras Jackson, Pollock & Ward': {
      const density = gender === 'Masculino'
        ? 1.112 - (0.00043499 * sumFolds) + (0.00000055 * Math.pow(sumFolds, 2)) - (0.00028826 * age)
        : 1.097 - (0.00046971 * sumFolds) + (0.00000056 * Math.pow(sumFolds, 2)) - (0.00012828 * age);
      bodyFat = ((4.95 / density) - 4.50) * 100;
      break;
    }
  }

  bodyFat = Math.max(2, Math.min(60, bodyFat));

  const fatMass = weight * (bodyFat / 100);
  const leanMass = weight - fatMass;
  const imc = height > 0 ? weight / Math.pow(height / 100, 2) : 0;
  const heightInMeters = height / 100;
  const ffmi = heightInMeters > 0 ? leanMass / (heightInMeters * heightInMeters) : 0;
  
  return {
    bodyFat: Number(bodyFat.toFixed(2)),
    fatMass: Number(fatMass.toFixed(2)),
    leanMass: Number(leanMass.toFixed(2)),
    sumFolds: Number(sumFolds.toFixed(2)),
    imc: Number(imc.toFixed(2)),
    ffmi: Number(ffmi.toFixed(2)),
  };
}
