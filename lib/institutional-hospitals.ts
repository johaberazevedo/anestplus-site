export const HOSPITAL_ACCESS_FEATURE = "hospital_access";
export const HOSPITAL_COORDINATION_FEATURE = "hospital_coordination";
export const HOSPITAL_BILLING_FEATURE = "hospital_billing";
export type HospitalAccessFeature = typeof HOSPITAL_ACCESS_FEATURE | typeof HOSPITAL_COORDINATION_FEATURE
  | typeof HOSPITAL_BILLING_FEATURE;
export const HOSPITAL_FIELDS = "code,name,latitude,longitude,radius_meters,is_active";

export function isHospitalCode(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80
    && /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value);
}

export function coordinationPath(hospitalCode: unknown): string | null {
  return isHospitalCode(hospitalCode) ? `/institucional/${hospitalCode}/coordenacao` : null;
}

export function billingPath(hospitalCode: unknown): string | null {
  return isHospitalCode(hospitalCode) ? `/institucional/${hospitalCode}/faturamento` : null;
}

export function parseHospital(body: Record<string, unknown>) {
  const { code, name, latitude, longitude, radius_meters, is_active } = body;
  if (!isHospitalCode(code) || typeof name !== "string") return null;
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 120
      || typeof latitude !== "number" || !Number.isFinite(latitude) || Math.abs(latitude) > 90
      || typeof longitude !== "number" || !Number.isFinite(longitude) || Math.abs(longitude) > 180
      || typeof radius_meters !== "number" || !Number.isInteger(radius_meters)
      || radius_meters < 1 || radius_meters > 2_147_483_647
      || typeof is_active !== "boolean") return null;

  return { code, name: trimmedName, latitude, longitude, radius_meters, is_active };
}

export type InstitutionalHospital = NonNullable<ReturnType<typeof parseHospital>>;
