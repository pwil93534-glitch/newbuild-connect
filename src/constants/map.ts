import { MilitaryBase } from '../types';

export const COMMUNITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'windrose-pulte':           { latitude: 33.6362, longitude: -112.3693 },
  'marley-park-tm':           { latitude: 33.6228, longitude: -112.3580 },
  'sterling-grove-tb':        { latitude: 33.6046, longitude: -112.3810 },
  'sun-city-festival-dw':     { latitude: 33.3756, longitude: -112.5873 },
  'encanterra-shea':          { latitude: 33.2393, longitude: -111.6182 },
  'saguaro-trails-meritage':  { latitude: 32.1631, longitude: -110.9305 },
  'rancho-sahuarita':         { latitude: 31.9461, longitude: -110.9550 },
  'vail-ranch-drhorton':      { latitude: 32.0378, longitude: -110.7076 },
  'sierra-vista-richmond':    { latitude: 31.5599, longitude: -110.3062 },
  'goodyear-meritage':        { latitude: 33.3553, longitude: -112.3638 },
  'prasada-drhorton':         { latitude: 33.6410, longitude: -112.4100 },
  'canyon-trails-meritage':   { latitude: 33.4359, longitude: -112.3629 },
  'tartesso-drhorton':        { latitude: 33.4205, longitude: -112.6940 },
  'verrado-tb':               { latitude: 33.4724, longitude: -112.5446 },
  'higley-heights-richmond':  { latitude: 33.3033, longitude: -111.7336 },
  'layton-lakes-tm':          { latitude: 33.2918, longitude: -111.7754 },
  'adora-trails-drhorton':    { latitude: 33.2990, longitude: -111.7150 },
  'trilogy-at-vistancia-shea':{ latitude: 33.7140, longitude: -112.2985 },
  'sun-city-grand-dw':        { latitude: 33.6720, longitude: -112.3473 },
  'marana-community-pulte':   { latitude: 32.3984, longitude: -111.1500 },
  'civano-meritage':          { latitude: 32.1533, longitude: -110.7922 },
};

export const BASE_COORDINATES: Record<MilitaryBase, { latitude: number; longitude: number; name: string; shortName: string }> = {
  luke:             { latitude: 33.5350, longitude: -112.3830, name: 'Luke Air Force Base', shortName: 'Luke AFB' },
  huachuca:         { latitude: 31.5440, longitude: -110.3444, name: 'Fort Huachuca', shortName: 'Ft. Huachuca' },
  dm:               { latitude: 32.1668, longitude: -110.8833, name: 'Davis-Monthan AFB', shortName: 'DM AFB' },
  veteran_retired:  { latitude: 33.5350, longitude: -112.3830, name: 'Luke Air Force Base', shortName: 'Luke AFB' },
};

export const ARIZONA_REGION = {
  latitude: 32.9,
  longitude: -111.7,
  latitudeDelta: 4.2,
  longitudeDelta: 4.2,
};

export const PHOENIX_REGION = {
  latitude: 33.5,
  longitude: -112.2,
  latitudeDelta: 1.4,
  longitudeDelta: 1.4,
};

export const TUCSON_REGION = {
  latitude: 32.0,
  longitude: -110.9,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};
