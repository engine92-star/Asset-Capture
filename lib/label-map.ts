export interface MappedAssetLabel {
  label: string;
  category: string;
  baseValue: number;
}

const EXACT_LABEL_MAP: Record<string, MappedAssetLabel> = {
  'home good': { label: 'Commercial Equipment', category: 'Equipment', baseValue: 8500 },
  'fashion good': { label: 'High-Value Apparel Inventory', category: 'Inventory', baseValue: 6200 },
  food: { label: 'Commercial Kitchen Equipment', category: 'Equipment', baseValue: 7800 },
  place: { label: 'Fixed Property Fixture', category: 'Real Estate', baseValue: 25000 },
  plant: { label: 'Landscaping Asset', category: 'Infrastructure', baseValue: 5400 },
  chair: { label: 'Office Chair (Executive)', category: 'Furniture', baseValue: 1200 },
  table: { label: 'Conference Table Set', category: 'Furniture', baseValue: 6800 },
  desk: { label: 'Office Workstation Desk', category: 'Furniture', baseValue: 4200 },
  sofa: { label: 'Commercial Seating', category: 'Furniture', baseValue: 5500 },
  bed: { label: 'Hospitality Bed Frame', category: 'Furniture', baseValue: 4800 },
  refrigerator: { label: 'Commercial Refrigerator', category: 'Equipment', baseValue: 8200 },
  oven: { label: 'Commercial Oven', category: 'Equipment', baseValue: 9600 },
  microwave: { label: 'Commercial Microwave', category: 'Equipment', baseValue: 3200 },
  dishwasher: { label: 'Commercial Dishwasher', category: 'Equipment', baseValue: 7100 },
  washer: { label: 'Commercial Washer', category: 'Equipment', baseValue: 6400 },
  dryer: { label: 'Commercial Dryer', category: 'Equipment', baseValue: 6100 },
  television: { label: 'Commercial Display System', category: 'Technology', baseValue: 5200 },
  tv: { label: 'Commercial Display System', category: 'Technology', baseValue: 5200 },
  monitor: { label: 'Workstation Monitor', category: 'Technology', baseValue: 3800 },
  laptop: { label: 'Laptop Workstation', category: 'Technology', baseValue: 4200 },
  computer: { label: 'Desktop Workstation', category: 'Technology', baseValue: 5600 },
  printer: { label: 'Commercial Printer', category: 'Equipment', baseValue: 7100 },
  phone: { label: 'Mobile Device Fleet Unit', category: 'Technology', baseValue: 2800 },
  camera: { label: 'Security Camera', category: 'Technology', baseValue: 9200 },
  vehicle: { label: 'Company Vehicle', category: 'Vehicles', baseValue: 42000 },
  car: { label: 'Company Vehicle', category: 'Vehicles', baseValue: 42000 },
  truck: { label: 'Delivery Truck', category: 'Vehicles', baseValue: 55000 },
  bicycle: { label: 'Commercial Bicycle Fleet', category: 'Vehicles', baseValue: 3200 },
  tool: { label: 'Industrial Tool Set', category: 'Equipment', baseValue: 4100 },
  machine: { label: 'Industrial Machine', category: 'Machinery', baseValue: 35000 },
  safe: { label: 'Security Safe', category: 'Security', baseValue: 8900 },
  shelf: { label: 'Industrial Shelving System', category: 'Infrastructure', baseValue: 5800 },
  cabinet: { label: 'Storage Cabinet System', category: 'Furniture', baseValue: 4600 },
  generator: { label: 'Commercial Generator', category: 'Equipment', baseValue: 18500 },
  HVAC: { label: 'Commercial HVAC Unit', category: 'Equipment', baseValue: 12500 },
};

const KEYWORD_MAP: Array<{ keywords: string[]; mapping: MappedAssetLabel }> = [
  {
    keywords: ['server', 'rack', 'network'],
    mapping: { label: 'Server Rack', category: 'Technology', baseValue: 14200 },
  },
  {
    keywords: ['forklift', 'pallet', 'warehouse'],
    mapping: { label: 'Forklift', category: 'Machinery', baseValue: 35000 },
  },
  {
    keywords: ['solar', 'panel', 'inverter'],
    mapping: { label: 'Solar Panel Array', category: 'Infrastructure', baseValue: 28000 },
  },
  {
    keywords: ['medical', 'imaging', 'x-ray'],
    mapping: { label: 'Medical Imaging Device', category: 'Medical', baseValue: 95000 },
  },
  {
    keywords: ['pos', 'register', 'terminal'],
    mapping: { label: 'POS Terminal System', category: 'Technology', baseValue: 6400 },
  },
];

export function mapMlLabel(rawLabel: string): MappedAssetLabel | null {
  const normalized = rawLabel.trim().toLowerCase();
  if (!normalized) return null;

  const exact = EXACT_LABEL_MAP[normalized];
  if (exact) return exact;

  for (const [key, mapping] of Object.entries(EXACT_LABEL_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }

  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.mapping;
    }
  }

  return null;
}