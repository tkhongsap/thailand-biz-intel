import amphurData from "../../data/geo/chiang-mai-amphurs.json";

export interface Amphur {
  code: string;
  name_th: string;
  name_en: string;
  lat: number;
  lon: number;
}

export const AMPHURS: Amphur[] = amphurData as Amphur[];

export function getAmphurByCode(code: string): Amphur | undefined {
  return AMPHURS.find((a) => a.code === code);
}

/**
 * Normalize amphur name from DB — removes "อ." prefix and maps to amphur code.
 */
export function normalizeAmphurName(rawName: string): string {
  return rawName.replace(/^อ\./, "");
}

export function findAmphurByThaiName(rawName: string): Amphur | undefined {
  const normalized = normalizeAmphurName(rawName);
  return AMPHURS.find((a) => a.name_th === normalized);
}
