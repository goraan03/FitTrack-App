export type UpdateProfileDto = {
  firstName: string;
  lastName: string;
  gender: "musko" | "zensko" | null;
  address: string | null;
  dateOfBirthISO: string | null; // YYYY-MM-DD
};

export function validateUpdateProfile(dto: any): { uspesno: boolean; poruka?: string; data?: UpdateProfileDto } {
  if (!dto) return { uspesno: false, poruka: "Nedostaju podaci" };

  const firstName = String(dto.firstName ?? "").trim();
  const lastName = String(dto.lastName ?? "").trim();
  const genderRaw = dto.gender ?? null;
  const addressRaw = dto.address ?? null;
  const dobRaw = dto.dateOfBirthISO ?? null;

  if (!firstName || firstName.length < 2) return { uspesno: false, poruka: "Ime je obavezno (min 2 karaktera)" };
  if (!lastName || lastName.length < 2) return { uspesno: false, poruka: "Prezime je obavezno (min 2 karaktera)" };

  let gender: "musko" | "zensko" | null = null;
  if (genderRaw !== null && genderRaw !== "" && genderRaw !== undefined) {
    const g = String(genderRaw);
    if (g !== "musko" && g !== "zensko") return { uspesno: false, poruka: "Neispravan pol" };
    gender = g as any;
  }

  const address = addressRaw == null ? null : String(addressRaw).trim() || null;

  let dateOfBirthISO: string | null = null;
  if (dobRaw != null && String(dobRaw).trim()) {
    const s = String(dobRaw).trim();
    // vrlo jednostavna validacija formata YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { uspesno: false, poruka: "Neispravan datum rođenja" };
    dateOfBirthISO = s;
  }

  return {
    uspesno: true,
    data: { firstName, lastName, gender, address, dateOfBirthISO },
  };
}