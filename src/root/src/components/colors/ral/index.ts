import { RALColor } from './types';
import { ralSeries1000 } from './series1000';
import { ralSeries2000 } from './series2000';
import { ralSeries3000 } from './series3000';
import { ralSeries4000 } from './series4000';
import { ralSeries5000 } from './series5000';
import { ralSeries6000 } from './series6000';
import { ralSeries7000 } from './series7000';
import { ralSeries8000 } from './series8000';
import { ralSeries9000 } from './series9000';

// Combina tutte le serie RAL in un unico array
export const ralColors: RALColor[] = [
  ...ralSeries1000,
  ...ralSeries2000,
  ...ralSeries3000,
  ...ralSeries4000,
  ...ralSeries5000,
  ...ralSeries6000,
  ...ralSeries7000,
  ...ralSeries8000,
  ...ralSeries9000
];

// Raggruppa i colori per serie
export const ralSeriesGroups = {
  '1000': ralSeries1000,
  '2000': ralSeries2000,
  '3000': ralSeries3000,
  '4000': ralSeries4000,
  '5000': ralSeries5000,
  '6000': ralSeries6000,
  '7000': ralSeries7000,
  '8000': ralSeries8000,
  '9000': ralSeries9000
};