// src/shared/constants/hoofOptions.ts
// All farrier-specific dropdown values. Ship as defaults; teams can add custom options later.

export const SHOE_TYPES = [
  'Plain stamp',
  'Plain (city head)',
  'Rim',
  'Bar (straight)',
  'Bar (egg)',
  'Bar (heart)',
  'Wedge',
  'Glue-on',
  'Natural Balance',
  'Slider',
  'Racing plate',
  'Barefoot trim only',
] as const;

export const SHOE_MATERIALS = [
  'Steel',
  'Aluminum',
  'Copper alloy',
  'Composite/Plastic',
  'Titanium',
] as const;

export const PAD_TYPES = [
  'Flat leather',
  'Flat plastic',
  'Wedge pad',
  'Pour-in pad',
  'Rim pad',
  'None',
] as const;

export const PACKING_TYPES = [
  'Pine tar oakum',
  'Silicone (Keratex/SoundHorse)',
  'Pour-in (Vettec/Equilox)',
  'Cotton/gauze',
  'None',
] as const;

export const NAIL_TYPES = [
  'E-head',
  'City head',
  'Slim blade',
  'Combo',
] as const;

export const NAIL_SIZES = [
  '4',
  '4.5',
  '5',
  '5.5',
  '6',
  '7',
  '8',
] as const;

export const HOOF_POSITIONS = [
  { value: 'LF' as const, label: 'Left Fore' },
  { value: 'RF' as const, label: 'Right Fore' },
  { value: 'LH' as const, label: 'Left Hind' },
  { value: 'RH' as const, label: 'Right Hind' },
] as const;

export const DISCIPLINES = [
  'Grand Prix Jumper',
  'Hunter',
  'Dressage',
  'Eventing',
  'Reining',
  'Cutting',
  'Barrel Racing',
  'Trail',
  'Pleasure',
  'Endurance',
  'Racing (Thoroughbred)',
  'Racing (Standardbred)',
  'Driving',
  'Draft/Work',
  'Retired',
  'Other',
] as const;
