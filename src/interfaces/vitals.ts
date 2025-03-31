
export interface VitalSign {
  recorded_at: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  blood_sugar: number;
  heart_rate: number;
}

export interface ChartData {
  date: string;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  heartRate: number;
}
