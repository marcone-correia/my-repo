/**
 * Maps our internal form question IDs to official USCIS I-485 PDF field names.
 * Field names follow the USCIS naming convention for the 09/17/19 edition.
 *
 * For checkbox fields: the mapped value is the field name prefix;
 * we append _Yes or _No at fill time for yes/no questions,
 * or use the exact field name for checkboxes.
 *
 * Run `node scripts/listPdfFields.js` after placing i485.pdf in public/forms/
 * to get the exact field names from the live PDF and correct any mismatches.
 */

export const FIELD_MAP: Record<string, string | string[]> = {
  // Part 1 — Your Information
  Pt1Line1a_FamilyName:            "Pt1Line1a_FamilyName",
  Pt1Line1b_GivenName:             "Pt1Line1b_GivenName",
  Pt1Line1c_MiddleName:            "Pt1Line1c_MiddleName",
  Pt1Line2_OtherNames:             "Pt1Line2_OtherNames",
  Pt1Line3_DateofBirth:            "Pt1Line3_DateofBirth",
  Pt1Line4_CityTownofBirth:        "Pt1Line4_CityTownofBirth",
  Pt1Line5_CountryofBirth:         "Pt1Line5_CountryofBirth",
  Pt1Line6_CountryofCitizenship:   "Pt1Line6_CountryofCitizenship",
  Pt1Line7_AlienNumber:            "Pt1Line7_AlienNumber",
  Pt1Line8_SSN:                    "Pt1Line8_SSN",
  Pt1Line9_USCISOnlineAcctNumber:  "Pt1Line9_USCISOnlineAcctNumber",
  Pt1Line10_StreetNumberName:      "Pt1Line10_StreetNumberName",
  Pt1Line11_AptSteFlrNumber:       "Pt1Line11_AptSteFlrNumber",
  Pt1Line12_CityOrTown:            "Pt1Line12_CityOrTown",
  Pt1Line13_State:                 "Pt1Line13_State",
  Pt1Line14_ZipCode:               "Pt1Line14_ZipCode",
  Pt1Line15_DaytimeTelephoneNumber: "Pt1Line15_DaytimeTelephoneNumber",
  Pt1Line16_MobileNumber:          "Pt1Line16_MobileNumber",
  Pt1Line17_EmailAddress:          "Pt1Line17_EmailAddress",
  Pt1Line18_Gender:                "Pt1Line18_Gender", // may be two checkboxes: Pt1Line18a_Male / Pt1Line18b_Female

  // Part 2 — Basis of Eligibility
  // Each option maps to its own checkbox in the PDF
  Pt2Line1_AdjustmentBasis:        "Pt2Line1_AdjustmentBasis",

  // Part 3 — Processing Information
  Pt3Line1_CityTownLastEntry:      "Pt3Line1_CityTownLastEntry",
  Pt3Line2_StateLastEntry:         "Pt3Line2_StateLastEntry",
  Pt3Line3_DateLastEntry:          "Pt3Line3_DateLastEntry",
  Pt3Line4_I94Number:              "Pt3Line4_I94Number",
  Pt3Line5_StatusAtLastEntry:      "Pt3Line5_StatusAtLastEntry",
  Pt3Line6_AuthorizedStayDate:     "Pt3Line6_AuthorizedStayDate",
  Pt3Line7_PassportNumber:         "Pt3Line7_PassportNumber",
  Pt3Line8_PassportExpiration:     "Pt3Line8_PassportExpiration",
  Pt3Line9_PassportCountry:        "Pt3Line9_PassportCountry",
  Pt3Line10_VisaNumber:            "Pt3Line10_VisaNumber",
  Pt3Line11_VisaType:              "Pt3Line11_VisaType",
  Pt3Line12_VisaExpiration:        "Pt3Line12_VisaExpiration",

  // Part 4 — Address History (current)
  Pt4Line1_StreetNumberName:       "Pt4Line1_StreetNumberName",
  Pt4Line1_AptSteFlrNumber:        "Pt4Line1_AptSteFlrNumber",
  Pt4Line1_CityOrTown:             "Pt4Line1_CityOrTown",
  Pt4Line1_State:                  "Pt4Line1_State",
  Pt4Line1_ZipCode:                "Pt4Line1_ZipCode",
  Pt4Line1_Country:                "Pt4Line1_Country",
  Pt4Line1_DateFrom:               "Pt4Line1_DateFrom",
  // Part 4 — previous address
  Pt4Line2_StreetNumberName:       "Pt4Line2_StreetNumberName",
  Pt4Line2_AptSteFlrNumber:        "Pt4Line2_AptSteFlrNumber",
  Pt4Line2_CityOrTown:             "Pt4Line2_CityOrTown",
  Pt4Line2_State:                  "Pt4Line2_State",
  Pt4Line2_ZipCode:                "Pt4Line2_ZipCode",
  Pt4Line2_Country:                "Pt4Line2_Country",
  Pt4Line2_DateFrom:               "Pt4Line2_DateFrom",
  Pt4Line2_DateTo:                 "Pt4Line2_DateTo",

  // Part 5 — Employment History
  Pt5Line1_EmployerOrSchoolName:   "Pt5Line1_EmployerOrSchoolName",
  Pt5Line1_Occupation:             "Pt5Line1_Occupation",
  Pt5Line1_StreetNumberName:       "Pt5Line1_StreetNumberName",
  Pt5Line1_CityOrTown:             "Pt5Line1_CityOrTown",
  Pt5Line1_State:                  "Pt5Line1_State",
  Pt5Line1_ZipCode:                "Pt5Line1_ZipCode",
  Pt5Line1_DateFrom:               "Pt5Line1_DateFrom",
  Pt5Line1_DateTo:                 "Pt5Line1_DateTo",
  Pt5Line2_EmployerOrSchoolName:   "Pt5Line2_EmployerOrSchoolName",
  Pt5Line2_Occupation:             "Pt5Line2_Occupation",
  Pt5Line2_CityOrTown:             "Pt5Line2_CityOrTown",
  Pt5Line2_State:                  "Pt5Line2_State",
  Pt5Line2_DateFrom:               "Pt5Line2_DateFrom",
  Pt5Line2_DateTo:                 "Pt5Line2_DateTo",

  // Part 6 — Biographic Information
  Pt6Line1_Ethnicity:              "Pt6Line1_Ethnicity",
  Pt6Line2_Race:                   "Pt6Line2_Race",
  Pt6Line3_HeightFeet:             "Pt6Line3_HeightFeet",
  Pt6Line4_HeightInches:           "Pt6Line4_HeightInches",
  Pt6Line5_WeightLbs:              "Pt6Line5_WeightLbs",
  Pt6Line6_EyeColor:               "Pt6Line6_EyeColor",
  Pt6Line7_HairColor:              "Pt6Line7_HairColor",

  // Part 9 — Yes/No questions
  // Each maps to a pair: Pt9LineXX_YesNoYes and Pt9LineXX_YesNoNo
  Pt9Line1a_YesNo:  "Pt9Line1a_YesNo",
  Pt9Line1b_YesNo:  "Pt9Line1b_YesNo",
  Pt9Line1c_YesNo:  "Pt9Line1c_YesNo",
  Pt9Line1d_YesNo:  "Pt9Line1d_YesNo",
  Pt9Line1e_YesNo:  "Pt9Line1e_YesNo",
  Pt9Line2a_YesNo:  "Pt9Line2a_YesNo",
  Pt9Line2b_YesNo:  "Pt9Line2b_YesNo",
  Pt9Line3a_YesNo:  "Pt9Line3a_YesNo",
  Pt9Line4a_YesNo:  "Pt9Line4a_YesNo",
  Pt9Line5a_YesNo:  "Pt9Line5a_YesNo",
  Pt9Line6a_YesNo:  "Pt9Line6a_YesNo",
  Pt9Line6b_YesNo:  "Pt9Line6b_YesNo",
  Pt9Line7a_YesNo:  "Pt9Line7a_YesNo",
  Pt9Line8a_YesNo:  "Pt9Line8a_YesNo",
  Pt9Line9a_YesNo:  "Pt9Line9a_YesNo",
  Pt9Line10a_YesNo: "Pt9Line10a_YesNo",
  Pt9Line11a_YesNo: "Pt9Line11a_YesNo",
};

/**
 * Part 2 basis of eligibility — maps our answer values to the PDF checkbox field names.
 * These are separate checkboxes in the I-485 PDF.
 */
export const PART2_BASIS_FIELDS: Record<string, string> = {
  immediate_relative_usc: "Pt2Line1a_Checkbox",
  other_family_based:     "Pt2Line1b_Checkbox",
  employment_based:       "Pt2Line1c_Checkbox",
  asylee:                 "Pt2Line1d_Checkbox",
  refugee:                "Pt2Line1e_Checkbox",
  special_immigrant:      "Pt2Line1f_Checkbox",
  other:                  "Pt2Line1g_Checkbox",
};

/**
 * Part 6 race — the I-485 may use individual checkboxes per race value.
 */
export const PART6_RACE_FIELDS: Record<string, string> = {
  "White":                                        "Pt6Line2a_Checkbox",
  "Asian":                                        "Pt6Line2b_Checkbox",
  "Black or African American":                   "Pt6Line2c_Checkbox",
  "American Indian or Alaska Native":            "Pt6Line2d_Checkbox",
  "Native Hawaiian or Other Pacific Islander":   "Pt6Line2e_Checkbox",
};

/**
 * Part 6 ethnicity — may be two checkboxes.
 */
export const PART6_ETHNICITY_FIELDS: Record<string, string> = {
  "Hispanic or Latino":     "Pt6Line1a_Checkbox",
  "Not Hispanic or Latino": "Pt6Line1b_Checkbox",
};
