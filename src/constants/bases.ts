import { MilitaryBase } from '../types';

export interface BaseInfo {
  id: MilitaryBase;
  name: string;
  shortName: string;
  city: string;
  state: string;
  area: 'phoenix' | 'tucson';
  coordinates: { latitude: number; longitude: number };
  bahRates: {
    e5NoDep: number;
    e5WithDep: number;
    o3NoDep: number;
    o3WithDep: number;
  };
}

export const MILITARY_BASES: BaseInfo[] = [
  {
    id: 'luke',
    name: 'Luke Air Force Base',
    shortName: 'Luke AFB',
    city: 'Glendale',
    state: 'AZ',
    area: 'phoenix',
    coordinates: { latitude: 33.5354, longitude: -112.3829 },
    bahRates: {
      e5NoDep: 1641,
      e5WithDep: 1980,
      o3NoDep: 2520,
      o3WithDep: 3678,
    },
  },
  {
    id: 'huachuca',
    name: 'Fort Huachuca',
    shortName: 'Fort Huachuca',
    city: 'Sierra Vista',
    state: 'AZ',
    area: 'tucson',
    coordinates: { latitude: 31.5544, longitude: -110.3445 },
    bahRates: {
      e5NoDep: 1260,
      e5WithDep: 1554,
      o3NoDep: 1920,
      o3WithDep: 2511,
    },
  },
  {
    id: 'dm',
    name: 'Davis-Monthan AFB',
    shortName: 'Davis-Monthan',
    city: 'Tucson',
    state: 'AZ',
    area: 'tucson',
    coordinates: { latitude: 32.1661, longitude: -110.8831 },
    bahRates: {
      e5NoDep: 1356,
      e5WithDep: 1680,
      o3NoDep: 2040,
      o3WithDep: 2583,
    },
  },
  {
    id: 'veteran_retired',
    name: 'Veteran / Retiring',
    shortName: 'Veteran',
    city: 'Arizona',
    state: 'AZ',
    area: 'phoenix',
    coordinates: { latitude: 33.4484, longitude: -112.074 },
    bahRates: {
      e5NoDep: 0,
      e5WithDep: 0,
      o3NoDep: 0,
      o3WithDep: 0,
    },
  },
];
