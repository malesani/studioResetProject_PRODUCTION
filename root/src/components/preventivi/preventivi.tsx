export interface Preventivi {
  preventivo_uid: string;
  title: string;
  description: string;
  icon?: string;
}

export const predefinedObjectives: Preventivi[] = [
  {
    preventivo_uid: 'fiera',
    title: 'Preventivo Fiera',
    description: 'Posizionare il brand come leader di settore o innovatore.',
    icon: 'calendar'
  },
  {
    preventivo_uid: 'showroom',
    title: 'Preventivo Showroom',
    description: 'Presentazione prodotti/servizi generica',
    icon: 'camera'
  },
  {
    preventivo_uid: 'mobili',
    title: 'Preventivo Mobili',
    description: 'Arredamento e mobili su misura',
    icon: 'couch'
  },
  {
    preventivo_uid: 'servizi',
    title: 'Preventivo Servizi',
    description: 'Servizi professionali e consulenze',
    icon: 'wrench'
  },
  {
    preventivo_uid: 'altro',
    title: 'Altro',
    description: 'Altri tipi di preventivo personalizzati',
    icon: 'ellipsis-h'
  },
];