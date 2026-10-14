export interface MountainPeak {
  name: string;
  elevationMeters: number;
  coordinates: [number, number];
  range: string;
}

export interface RiverPath {
  name: string;
  basin: string;
  color: string;
  strokeWidth: number;
  path: [number, number][];
}

export const STRATEGIC_RIVERS: RiverPath[] = [
  {
    name: 'Brahmaputra River (Mighty Trans-Valley Arterial)',
    basin: 'Brahmaputra Basin',
    color: '#0284C7',
    strokeWidth: 5,
    path: [
      [26.15, 91.65],
      [26.19, 91.75],
      [26.28, 91.95],
      [26.42, 92.18],
      [26.54, 92.45],
      [26.62, 92.75],
      [26.63, 92.86],
      [26.66, 93.18],
      [26.70, 93.45],
    ],
  },
  {
    name: 'Kameng River (Jia Bhareli Gorge)',
    basin: 'Kameng Canyon',
    color: '#38BDF8',
    strokeWidth: 3,
    path: [
      [27.32, 92.74],
      [27.18, 92.68],
      [27.02, 92.65], // Bhalukpong canyon
      [26.88, 92.71],
      [26.72, 92.82],
      [26.63, 92.86], // Merges into Brahmaputra near Tezpur
    ],
  },
  {
    name: 'Tenga River',
    basin: 'West Kameng Valley',
    color: '#38BDF8',
    strokeWidth: 2,
    path: [
      [27.24, 92.58],
      [27.18, 92.49], // Tenga Valley Post
      [27.12, 92.44],
      [27.05, 92.52],
    ],
  },
  {
    name: 'Dirang Chu (River)',
    basin: 'Dirang Gorge',
    color: '#38BDF8',
    strokeWidth: 2.5,
    path: [
      [27.46, 92.18],
      [27.38, 92.22],
      [27.35, 92.24], // Dirang Bridge
      [27.28, 92.32],
      [27.20, 92.42],
    ],
  },
  {
    name: 'Tawang Chu (Glacial Torrent)',
    basin: 'Tawang High Valley',
    color: '#38BDF8',
    strokeWidth: 2.5,
    path: [
      [27.65, 92.05],
      [27.58, 91.92],
      [27.57, 91.86], // Tawang Basin
      [27.53, 91.72],
    ],
  },
];

export const MOUNTAIN_PEAKS: MountainPeak[] = [
  { name: 'Sela Pass Ridge', elevationMeters: 4170, coordinates: [27.5050, 92.1050], range: 'Eastern Himalaya' },
  { name: 'Mt. Gorichen Apex', elevationMeters: 6488, coordinates: [27.78, 92.38], range: 'Great Himalaya' },
  { name: 'Kangto High Ridge', elevationMeters: 7060, coordinates: [27.86, 92.54], range: 'Eastern Himalaya' },
  { name: 'Mandala Top', elevationMeters: 2850, coordinates: [27.2950, 92.1450], range: 'Shergaon Range' },
  { name: 'Bomdila Ridge', elevationMeters: 2415, coordinates: [27.2645, 92.4159], range: 'Lesser Himalaya' },
  { name: 'Dafla Foothill Ridges', elevationMeters: 1850, coordinates: [27.12, 93.05], range: 'Sub-Himalaya' },
];
