export interface SimulationState {
  pollutantLoad: number; // 0-100%
  dosage: number; // 0.0 - 2.0 g/L
  flowRate: number; // L/min
  ph: number; // 0-14
  turbidity: number; // NTU
  dissolvedOxygen: number; // mg/L
  recoveryRate: number; // %
  isAutoDosing: boolean;
  alerts: string[];
}

export interface ChartDataPoint {
  time: number;
  concentration: number;
}

export enum PollutantType {
  MICROPLASTIC = 'Microplastics',
  HEAVY_METAL = 'Heavy Metals (Pb, Cd)',
  ORGANIC = 'Organic Pollutants'
}
