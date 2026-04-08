/**
 * Maps our internal form question IDs to official USCIS I-485 PDF field names.
 * Field names are XFA format extracted from the unlocked 01/20/25 edition PDF.
 *
 * Field types:
 *   TextField  — set with form.getTextField(name).setText(value)
 *   CheckBox   — set with form.getCheckBox(name).check() / .uncheck()
 *   Dropdown   — set with form.getDropdown(name).select(value)
 *
 * CheckBox conventions:
 *   YesNo pairs: [0] = Yes, [1] = No
 *   Gender:      [0] = Male, [1] = Female
 *   Ethnicity:   [0] = Hispanic or Latino, [1] = Not Hispanic or Latino
 *   Race:        [0] = White, [1] = Asian, [2] = Black/AA, [3] = AIAN, [4] = NHOPI
 *   Eye color:   [0-8] = Black, Blue, Brown, Gray, Green, Hazel, Maroon, Multicolored, Pink
 *   Hair color:  [0-8] = Bald, Black, Blond, Brown, Gray, Red, Sandy, White, Unknown
 */

// ─── Simple text/date fields (questionId → full XFA field name) ────────────────

export const TEXT_FIELD_MAP: Record<string, string> = {
  // Part 1 — Personal Information
  Pt1Line1a_FamilyName:               "form1[0].#subform[0].Pt1Line1_FamilyName[0]",
  Pt1Line1b_GivenName:                "form1[0].#subform[0].Pt1Line1_GivenName[0]",
  Pt1Line1c_MiddleName:               "form1[0].#subform[0].Pt1Line1_MiddleName[0]",
  Pt1Line2_OtherNames:                "form1[0].#subform[0].Pt1Line2_FamilyName[0]", // best effort: first alias family name
  Pt1Line3_DateofBirth:               "form1[0].#subform[0].Pt1Line3_DOB[0]",
  Pt1Line4_CityTownofBirth:           "form1[0].#subform[1].Pt1Line7_CityTownOfBirth[0]",
  Pt1Line5_CountryofBirth:            "form1[0].#subform[1].Pt1Line7_CountryOfBirth[0]",
  Pt1Line6_CountryofCitizenship:      "form1[0].#subform[1].Pt1Line8_CountryofCitizenshipNationality[0]",
  Pt1Line7_AlienNumber:               "form1[0].#subform[0].AlienNumber[0]",
  Pt1Line8_SSN:                       "form1[0].#subform[3].Pt1Line19_SSN[0]",
  Pt1Line9_USCISOnlineAcctNumber:     "form1[0].#subform[1].Pt1Line9_USCISAccountNumber[0]",

  // Part 1 — Current mailing address
  Pt1Line10_StreetNumberName:         "form1[0].#subform[2].Pt1Line18_StreetNumberName[0]",
  Pt1Line11_AptSteFlrNumber:          "form1[0].#subform[2].Pt1Line18US_AptSteFlrNumber[0]",
  Pt1Line12_CityOrTown:               "form1[0].#subform[2].Pt1Line18_CityOrTown[0]",
  Pt1Line14_ZipCode:                  "form1[0].#subform[2].Pt1Line18_ZipCode[0]",

  // Part 1 — Contact (physically on Part 3 of the I-485 PDF)
  Pt1Line15_DaytimeTelephoneNumber:   "form1[0].#subform[22].Pt3Line3_DaytimePhoneNumber1[0]",
  Pt1Line16_MobileNumber:             "form1[0].#subform[22].Pt3Line4_MobileNumber1[0]",
  Pt1Line17_EmailAddress:             "form1[0].#subform[22].Pt3Line5_Email[0]",

  // Part 3 — Processing Information (last entry, passport, visa)
  Pt3Line1_CityTownLastEntry:         "form1[0].#subform[1].Pt1Line10_CityTown[0]",
  Pt3Line3_DateLastEntry:             "form1[0].#subform[1].Pt1Line10_DateofArrival[0]",
  Pt3Line4_I94Number:                 "form1[0].#subform[2].P1Line12_I94[0]",
  Pt3Line5_StatusAtLastEntry:         "form1[0].#subform[2].Pt1Line12_Status[0]",
  Pt3Line6_AuthorizedStayDate:        "form1[0].#subform[1].Pt1Line10_NonImmDate[0]",
  Pt3Line7_PassportNumber:            "form1[0].#subform[1].Pt1Line10_PassportNum[0]",
  Pt3Line8_PassportExpiration:        "form1[0].#subform[1].Pt1Line10_ExpDate[0]",
  Pt3Line9_PassportCountry:           "form1[0].#subform[1].Pt1Line10_Passport[0]",
  Pt3Line10_VisaNumber:               "form1[0].#subform[1].Pt1Line10_VisaNum[0]",
  Pt3Line11_VisaType:                 "form1[0].#subform[2].Pt1Line14_Status[0]",

  // Part 4 — Address History (current address)
  Pt4Line1_Street:                    "form1[0].#subform[2].Pt1Line18_StreetNumberName[0]",
  Pt4Line1_Apt:                       "form1[0].#subform[2].Pt1Line18US_AptSteFlrNumber[0]",
  Pt4Line1_City:                      "form1[0].#subform[2].Pt1Line18_CityOrTown[0]",
  Pt4Line1_Zip:                       "form1[0].#subform[2].Pt1Line18_ZipCode[0]",
  Pt4Line1_DateFrom:                  "form1[0].#subform[2].Pt1Line18_Date[0]",

  // Part 4 — Address History (previous address)
  Pt4Line2_Street:                    "form1[0].#subform[3].Pt1Line18_PriorStreetName[0]",
  Pt4Line2_Apt:                       "form1[0].#subform[3].Pt1Line18_PriorAddress_Number[0]",
  Pt4Line2_City:                      "form1[0].#subform[3].Pt1Line18_PriorCity[0]",
  Pt4Line2_Zip:                       "form1[0].#subform[3].Pt1Line18_PriorZipCode[0]",
  Pt4Line2_Country:                   "form1[0].#subform[3].Pt1Line18_PriorCountry[0]",
  Pt4Line2_DateFrom:                  "form1[0].#subform[3].Pt1Line18_PriorDateFrom[0]",
  Pt4Line2_DateTo:                    "form1[0].#subform[3].Pt1Line18PriorDateTo[0]",

  // Part 5 — Employment History (current/most recent employer)
  Pt5Line1_EmployerName:              "form1[0].#subform[7].Pt4Line7_EmployerName[0]",
  Pt5Line1_Street:                    "form1[0].#subform[8].Part4Line7_StreetName[0]",
  Pt5Line1_City:                      "form1[0].#subform[8].P4Line7_City[0]",
  Pt5Line1_Zip:                       "form1[0].#subform[8].P4Line7_ZipCode[0]",
  Pt5Line1_DateFrom:                  "form1[0].#subform[8].Pt4Line7_DateFrom[0]",
  Pt5Line1_DateTo:                    "form1[0].#subform[8].Pt4Line7_DateTo[0]",

  // Part 5 — Employment History (previous employer)
  Pt5Line2_EmployerName:              "form1[0].#subform[8].Pt4Line8_EmployerName[0]",
  Pt5Line2_Occupation:                "form1[0].#subform[8].Pt4Line8_Occupation[0]",
  Pt5Line2_City:                      "form1[0].#subform[8].P4Line8_City[0]",
  Pt5Line2_Zip:                       "form1[0].#subform[8].P4Line8_ZipCode[0]",
  Pt5Line2_DateFrom:                  "form1[0].#subform[8].Pt4Line8_DateFrom[0]",
  Pt5Line2_DateTo:                    "form1[0].#subform[8].Pt4Line8_DateTo[0]",

  // Part 6 — Biographic (weight — split into 3 digit boxes)
  // Handled separately in the route via splitWeight()
};

// ─── Dropdown fields (questionId → full XFA field name) ───────────────────────

export const DROPDOWN_FIELD_MAP: Record<string, string> = {
  Pt1Line13_State:        "form1[0].#subform[2].Pt1Line18_State[0]",       // current mailing address state
  Pt3Line2_StateLastEntry: "form1[0].#subform[1].Pt1Line10_State[0]",       // last entry state
  Pt4Line1_State:         "form1[0].#subform[2].Pt1Line18_State[0]",       // Part 4 current address state
  Pt4Line2_State:         "form1[0].#subform[3].Pt1Line18_PriorState[0]",  // Part 4 prior address state
  Pt5Line1_State:         "form1[0].#subform[8].P4Line7_State[0]",         // employer 1 state
  Pt5Line2_State:         "form1[0].#subform[8].P4Line8_State[0]",         // employer 2 state
  Pt6Line3_HeightFeet:    "form1[0].#subform[12].Pt7Line3_HeightFeet[0]",  // height feet
  Pt6Line4_HeightInches:  "form1[0].#subform[12].Pt7Line3_HeightInches[0]", // height inches
};

// ─── Gender checkboxes ─────────────────────────────────────────────────────────
// [0] = Male, [1] = Female

export const GENDER_FIELD_BASE = "form1[0].#subform[1].Pt1Line6_CB_Sex";

// ─── Part 2 — Basis of eligibility ────────────────────────────────────────────
// Pt2Line3a_CB[0-14]: immediate relative family-based categories
// Pt2Relative_CB[0-7]: specific family-based relative types
// Pt2Line3b_CB140[0-7]: employment-based categories
// Pt2Line3d_AsyleeRefugeeCB[0/1]: asylee [0], refugee [1]
// etc. — For now we map the common immediate relative case.

export const BASIS_FIELD_MAP: Record<string, { field: string; index: number }> = {
  immediate_relative_usc: { field: "form1[0].#subform[4].Pt2Line3a_CB", index: 0 },
  other_family_based:     { field: "form1[0].#subform[4].Pt2Line3a_CB", index: 1 },
  employment_based:       { field: "form1[0].#subform[5].Pt2Line3b_CB140", index: 0 },
  asylee:                 { field: "form1[0].#subform[6].Pt2Line3d_AsyleeRefugeeCB", index: 0 },
  refugee:                { field: "form1[0].#subform[6].Pt2Line3d_AsyleeRefugeeCB", index: 1 },
};

// ─── Part 6 / Part 7 — Biographic checkboxes ──────────────────────────────────

export const ETHNICITY_FIELD_BASE = "form1[0].#subform[12].Pt7Line1_Ethnicity";
// [0] = Hispanic or Latino, [1] = Not Hispanic or Latino

export const RACE_FIELD_BASE = "form1[0].#subform[12].Pt7Line2_Race";
// [0] = White, [1] = Asian, [2] = Black or African American
// [3] = American Indian or Alaska Native, [4] = Native Hawaiian or Other Pacific Islander
export const RACE_OPTIONS = [
  "White",
  "Asian",
  "Black or African American",
  "American Indian or Alaska Native",
  "Native Hawaiian or Other Pacific Islander",
];

export const EYE_COLOR_FIELD_BASE = "form1[0].#subform[12].Pt7Line5_Eyecolor";
// [0] = Black, [1] = Blue, [2] = Brown, [3] = Gray, [4] = Green
// [5] = Hazel, [6] = Maroon, [7] = Multicolored, [8] = Pink/Unknown
export const EYE_COLOR_OPTIONS = ["black", "blue", "brown", "gray", "green", "hazel", "maroon", "multicolored", "pink"];

export const HAIR_COLOR_FIELD_BASE = "form1[0].#subform[12].Pt7Line6_Haircolor";
// [0] = Bald, [1] = Black, [2] = Blond, [3] = Brown, [4] = Gray
// [5] = Red, [6] = Sandy, [7] = White, [8] = Unknown
export const HAIR_COLOR_OPTIONS = ["bald", "black", "blond", "brown", "gray", "red", "sandy", "white", "unknown"];

// ─── Weight (3 separate single-digit boxes) ────────────────────────────────────
export const WEIGHT_FIELDS = [
  "form1[0].#subform[12].Pt7Line4_Weight1[0]",
  "form1[0].#subform[12].Pt7Line4_Weight2[0]",
  "form1[0].#subform[12].Pt7Line4_Weight3[0]",
];

// ─── Part 8 — Background Yes/No questions ─────────────────────────────────────
// questionId → { subform, fieldBase } — checkboxes: [0] = Yes, [1] = No

export const BACKGROUND_YESNO_MAP: Record<string, string> = {
  // Criminal history (Part 8, Lines 22–24)
  Pt9Line1a_YesNo: "form1[0].#subform[13].Pt8Line22_YesNo",  // committed crime, not arrested
  Pt9Line1b_YesNo: "form1[0].#subform[13].Pt8Line23_YesNo",  // arrested, cited, charged
  Pt9Line1c_YesNo: "form1[0].#subform[13].Pt8Line24a_YesNo", // party to criminal proceeding
  Pt9Line1d_YesNo: "form1[0].#subform[13].Pt8Line24b_YesNo", // juvenile court proceeding
  Pt9Line1e_YesNo: "form1[0].#subform[13].Pt8Line24c_YesNo", // expunged / pardoned

  // Organization membership (Part 8, Lines 13 & 17)
  Pt9Line2a_YesNo: "form1[0].#subform[13].Pt8Line17_YesNo",  // member of any organization
  Pt9Line2b_YesNo: "form1[0].#subform[13].Pt8Line13_YesNo",  // member of terrorist organization

  // Military / security (Part 8, Lines 19 & 20)
  Pt9Line3a_YesNo: "form1[0].#subform[13].Pt8Line19_YesNo",  // exemption from military service
  Pt9Line5a_YesNo: "form1[0].#subform[13].Pt8Line20_YesNo",  // espionage / sabotage

  // Nazi / genocide (Part 8, Line 1)
  Pt9Line4a_YesNo: "form1[0].#subform[12].Pt8Line1_YesNo",   // Nazi / genocide government

  // Immigration history (Part 8, Lines 25–30)
  Pt9Line6a_YesNo:  "form1[0].#subform[14].Pt8Line25_YesNo", // removed / deported
  Pt9Line6b_YesNo:  "form1[0].#subform[14].Pt8Line26_YesNo", // placed in removal proceedings
  Pt9Line7a_YesNo:  "form1[0].#subform[14].Pt8Line27_YesNo", // currently under removal order
  Pt9Line8a_YesNo:  "form1[0].#subform[14].Pt8Line28_YesNo", // J-1 2-year requirement
  Pt9Line9a_YesNo:  "form1[0].#subform[14].Pt8Line30_YesNo", // petition denied / revoked

  // Financial / legal capacity (Part 8, Lines 31–32)
  Pt9Line10a_YesNo: "form1[0].#subform[14].Pt8Line31_YesNo", // overdue taxes
  Pt9Line11a_YesNo: "form1[0].#subform[14].Pt8Line32_YesNo", // declared legally incompetent
};

// ─── Date question IDs (formatted MM/DD/YYYY before filling) ──────────────────
export const DATE_QUESTION_IDS = new Set([
  "Pt1Line3_DateofBirth",
  "Pt3Line3_DateLastEntry",
  "Pt3Line8_PassportExpiration",
  "Pt3Line12_VisaExpiration",
  "Pt4Line1_DateFrom",
  "Pt4Line2_DateFrom",
  "Pt4Line2_DateTo",
  "Pt5Line1_DateFrom",
  "Pt5Line1_DateTo",
  "Pt5Line2_DateFrom",
  "Pt5Line2_DateTo",
]);
