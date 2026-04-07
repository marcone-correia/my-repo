export type QuestionType =
  | "text"
  | "date"
  | "select"
  | "radio"
  | "yesno"
  | "tel"
  | "email"
  | "number";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  hint?: string;
  explanation?: string; // expandable in Part 9
  pdfField?: string;
  group?: string; // visual group label within a section
}

export type SectionLayout = "grouped" | "oneAtATime" | "review";

export interface Section {
  id: string;
  title: string;
  shortTitle: string;
  layout: SectionLayout;
  warning?: string;
  questions: Question[];
}

// ─── Shared options ────────────────────────────────────────────────────────────

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
].map(s => ({ value: s, label: s }));

const EYE_COLORS = ["Black","Blue","Brown","Gray","Green","Hazel","Maroon","Multicolored","Pink","Unknown"]
  .map(c => ({ value: c.toLowerCase(), label: c }));

const HAIR_COLORS = ["Bald","Black","Blond","Brown","Gray","Red","Sandy","White","Unknown"]
  .map(c => ({ value: c.toLowerCase(), label: c }));

// ─── Sections ─────────────────────────────────────────────────────────────────

export const SECTIONS: Section[] = [
  // ── Getting Started ─────────────────────────────────────────────────────────
  {
    id: "getting_started",
    title: "Getting Started",
    shortTitle: "Getting Started",
    layout: "grouped",
    questions: [
      {
        id: "gs_preparer_type",
        label: "Who is filling out this form?",
        type: "radio",
        required: true,
        options: [
          { value: "self", label: "The applicant (I am filling this out myself)" },
          { value: "attorney", label: "An attorney or accredited representative" },
          { value: "preparer", label: "A non-attorney preparer helping the applicant" },
        ],
        hint: "This determines Part 14 of the I-485. Most people choose 'The applicant.'",
      },
    ],
  },

  // ── Part 1 — Your Information ────────────────────────────────────────────────
  {
    id: "part1",
    title: "Part 1 — Your Information",
    shortTitle: "Your Info",
    layout: "grouped",
    questions: [
      // Name
      { id: "Pt1Line1a_FamilyName",   label: "Family name (last name)",  type: "text", required: true,  pdfField: "Pt1Line1a_FamilyName",  group: "Legal Name", placeholder: "As it appears on your passport" },
      { id: "Pt1Line1b_GivenName",    label: "Given name (first name)",  type: "text", required: true,  pdfField: "Pt1Line1b_GivenName",   group: "Legal Name" },
      { id: "Pt1Line1c_MiddleName",   label: "Middle name",              type: "text", required: false, pdfField: "Pt1Line1c_MiddleName",  group: "Legal Name", placeholder: "Leave blank if none" },
      // Aliases
      { id: "Pt1Line2_OtherNames",    label: "Other names used (aliases, maiden name, etc.)", type: "text", required: false, pdfField: "Pt1Line2_OtherNames", hint: "Include all other names you have ever used. Leave blank if none." },
      // DOB + birthplace
      { id: "Pt1Line3_DateofBirth",   label: "Date of birth",           type: "date", required: true,  pdfField: "Pt1Line3_DateofBirth",  group: "Birth Information" },
      { id: "Pt1Line4_CityTownofBirth", label: "City or town of birth", type: "text", required: true,  pdfField: "Pt1Line4_CityTownofBirth", group: "Birth Information" },
      { id: "Pt1Line5_CountryofBirth", label: "Country of birth",       type: "text", required: true,  pdfField: "Pt1Line5_CountryofBirth",  group: "Birth Information" },
      // Citizenship
      { id: "Pt1Line6_CountryofCitizenship", label: "Country of citizenship or nationality", type: "text", required: true, pdfField: "Pt1Line6_CountryofCitizenship" },
      // IDs
      { id: "Pt1Line7_AlienNumber",          label: "Alien Registration Number (A-Number)", type: "text", required: false, pdfField: "Pt1Line7_AlienNumber", group: "Government IDs", hint: "Starts with 'A' followed by 8 or 9 digits. On your EAD or DACA approval notice.", placeholder: "A-000000000" },
      { id: "Pt1Line8_SSN",                  label: "U.S. Social Security Number",           type: "text", required: false, pdfField: "Pt1Line8_SSN",          group: "Government IDs", placeholder: "XXX-XX-XXXX" },
      { id: "Pt1Line9_USCISOnlineAcctNumber", label: "USCIS Online Account Number",          type: "text", required: false, pdfField: "Pt1Line9_USCISOnlineAcctNumber", group: "Government IDs", hint: "From your myUSCIS account. Leave blank if you don't have one." },
      // Address
      { id: "Pt1Line10_StreetNumberName", label: "Street number and name",    type: "text", required: true,  pdfField: "Pt1Line10_StreetNumberName", group: "Current Mailing Address" },
      { id: "Pt1Line11_AptSteFlrNumber",  label: "Apt / Ste / Flr number",    type: "text", required: false, pdfField: "Pt1Line11_AptSteFlrNumber",  group: "Current Mailing Address", placeholder: "e.g. Apt 2B" },
      { id: "Pt1Line12_CityOrTown",       label: "City or town",              type: "text", required: true,  pdfField: "Pt1Line12_CityOrTown",       group: "Current Mailing Address" },
      { id: "Pt1Line13_State",            label: "State",                     type: "select", required: true, pdfField: "Pt1Line13_State", options: US_STATES, group: "Current Mailing Address" },
      { id: "Pt1Line14_ZipCode",          label: "ZIP code",                  type: "text", required: true,  pdfField: "Pt1Line14_ZipCode", group: "Current Mailing Address", placeholder: "XXXXX" },
      // Contact
      { id: "Pt1Line15_DaytimeTelephoneNumber", label: "Daytime phone number", type: "tel",   required: true,  pdfField: "Pt1Line15_DaytimeTelephoneNumber", group: "Contact Information" },
      { id: "Pt1Line16_MobileNumber",           label: "Mobile phone number",  type: "tel",   required: false, pdfField: "Pt1Line16_MobileNumber",           group: "Contact Information" },
      { id: "Pt1Line17_EmailAddress",           label: "Email address",        type: "email", required: false, pdfField: "Pt1Line17_EmailAddress",           group: "Contact Information" },
      // Gender
      {
        id: "Pt1Line18_Gender",
        label: "Gender",
        type: "radio",
        required: true,
        pdfField: "Pt1Line18_Gender",
        options: [
          { value: "Male",   label: "Male" },
          { value: "Female", label: "Female" },
        ],
      },
    ],
  },

  // ── Part 2 — Basis of Eligibility ────────────────────────────────────────────
  {
    id: "part2",
    title: "Part 2 — Basis of Eligibility",
    shortTitle: "Eligibility Basis",
    layout: "oneAtATime",
    questions: [
      {
        id: "Pt2Line1_AdjustmentBasis",
        label: "On what basis are you applying to adjust status?",
        type: "radio",
        required: true,
        pdfField: "Pt2Line1_AdjustmentBasis",
        hint: "This is the legal reason you qualify for a green card.",
        options: [
          { value: "immediate_relative_usc", label: "Immediate relative of a U.S. citizen (spouse, unmarried child under 21, or parent)" },
          { value: "other_family_based",     label: "Other family-based preference category" },
          { value: "employment_based",        label: "Employment-based" },
          { value: "asylee",                  label: "Asylee (1 year after asylum granted)" },
          { value: "refugee",                 label: "Refugee (admitted at least 1 year ago)" },
          { value: "special_immigrant",       label: "Special immigrant" },
          { value: "other",                   label: "Other" },
        ],
        explanation: "Most applicants using Throughline are immediate relatives of a U.S. citizen — typically a spouse. If you are married to a U.S. citizen and were admitted on Advance Parole, select the first option.",
      },
      {
        id: "Pt2Line2_ImmigrantPetitionFiled",
        label: "Has an immigrant visa petition (I-130) been filed on your behalf?",
        type: "radio",
        required: true,
        options: [
          { value: "yes_approved", label: "Yes — and it has been approved (I received an I-797 approval notice)" },
          { value: "yes_pending",  label: "Yes — and it is still pending" },
          { value: "concurrent",   label: "We are filing the I-130 and I-485 at the same time" },
          { value: "no",           label: "No" },
        ],
        explanation: "If you are filing concurrently (I-130 and I-485 together), select the third option. This is common for immediate relatives of U.S. citizens.",
      },
    ],
  },

  // ── Part 3 — Processing Information ──────────────────────────────────────────
  {
    id: "part3",
    title: "Part 3 — Processing Information",
    shortTitle: "Processing Info",
    layout: "grouped",
    questions: [
      { id: "Pt3Line1_CityTownLastEntry",  label: "City or town of last entry into the U.S.", type: "text", required: true,  pdfField: "Pt3Line1_CityTownLastEntry",  group: "Last Entry into the U.S." },
      { id: "Pt3Line2_StateLastEntry",     label: "State of last entry",                      type: "select", required: true, pdfField: "Pt3Line2_StateLastEntry", options: US_STATES, group: "Last Entry into the U.S." },
      { id: "Pt3Line3_DateLastEntry",      label: "Date of last entry",                       type: "date",   required: true,  pdfField: "Pt3Line3_DateLastEntry",      group: "Last Entry into the U.S." },
      { id: "Pt3Line4_I94Number",          label: "I-94 Arrival/Departure Record Number",     type: "text",   required: false, pdfField: "Pt3Line4_I94Number",          group: "Last Entry into the U.S.", hint: "Found on your I-94 card or at i94.cbp.dhs.gov. Leave blank if unavailable.", placeholder: "11-digit number" },
      { id: "Pt3Line5_StatusAtLastEntry",  label: "Status at last entry (visa type or parole)", type: "text", required: true,  pdfField: "Pt3Line5_StatusAtLastEntry",  group: "Last Entry into the U.S.", placeholder: "e.g. B-2, Parolee, F-1" },
      { id: "Pt3Line6_AuthorizedStayDate", label: "Authorized stay expiration (or 'D/S' if duration of status)", type: "text", required: false, pdfField: "Pt3Line6_AuthorizedStayDate", group: "Last Entry into the U.S.", placeholder: "MM/DD/YYYY or D/S" },

      // Passport
      { id: "Pt3Line7_PassportNumber",     label: "Passport number",                  type: "text", required: false, pdfField: "Pt3Line7_PassportNumber",     group: "Travel Document" },
      { id: "Pt3Line8_PassportExpiration", label: "Passport expiration date",          type: "date", required: false, pdfField: "Pt3Line8_PassportExpiration", group: "Travel Document" },
      { id: "Pt3Line9_PassportCountry",    label: "Country that issued your passport", type: "text", required: false, pdfField: "Pt3Line9_PassportCountry",    group: "Travel Document" },

      // Visa
      { id: "Pt3Line10_VisaNumber",     label: "Visa number (if entered on a visa)",  type: "text", required: false, pdfField: "Pt3Line10_VisaNumber",     group: "Visa (if applicable)", hint: "Red number on your visa. Leave blank if you entered on Advance Parole." },
      { id: "Pt3Line11_VisaType",       label: "Visa type/category",                  type: "text", required: false, pdfField: "Pt3Line11_VisaType",       group: "Visa (if applicable)", placeholder: "e.g. B-2, F-1" },
      { id: "Pt3Line12_VisaExpiration", label: "Visa expiration date",                type: "date", required: false, pdfField: "Pt3Line12_VisaExpiration", group: "Visa (if applicable)" },
    ],
  },

  // ── Part 4 — Address History ──────────────────────────────────────────────────
  {
    id: "part4",
    title: "Part 4 — Address History",
    shortTitle: "Address History",
    layout: "grouped",
    questions: [
      { id: "Pt4Line1_Street",   label: "Current street address",    type: "text",   required: true,  pdfField: "Pt4Line1_StreetNumberName", group: "Current Address (last 5 years)" },
      { id: "Pt4Line1_Apt",      label: "Apt / unit",                type: "text",   required: false, pdfField: "Pt4Line1_AptSteFlrNumber",  group: "Current Address (last 5 years)" },
      { id: "Pt4Line1_City",     label: "City or town",              type: "text",   required: true,  pdfField: "Pt4Line1_CityOrTown",       group: "Current Address (last 5 years)" },
      { id: "Pt4Line1_State",    label: "State",                     type: "select", required: true,  pdfField: "Pt4Line1_State", options: US_STATES, group: "Current Address (last 5 years)" },
      { id: "Pt4Line1_Zip",      label: "ZIP code",                  type: "text",   required: true,  pdfField: "Pt4Line1_ZipCode",          group: "Current Address (last 5 years)" },
      { id: "Pt4Line1_Country",  label: "Country",                   type: "text",   required: true,  pdfField: "Pt4Line1_Country",          group: "Current Address (last 5 years)", placeholder: "United States" },
      { id: "Pt4Line1_DateFrom", label: "Date moved in",             type: "date",   required: true,  pdfField: "Pt4Line1_DateFrom",         group: "Current Address (last 5 years)" },

      { id: "Pt4Line2_Street",   label: "Previous street address",   type: "text",   required: false, pdfField: "Pt4Line2_StreetNumberName", group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_Apt",      label: "Apt / unit",                type: "text",   required: false, pdfField: "Pt4Line2_AptSteFlrNumber",  group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_City",     label: "City or town",              type: "text",   required: false, pdfField: "Pt4Line2_CityOrTown",       group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_State",    label: "State",                     type: "select", required: false, pdfField: "Pt4Line2_State", options: US_STATES, group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_Zip",      label: "ZIP code",                  type: "text",   required: false, pdfField: "Pt4Line2_ZipCode",          group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_Country",  label: "Country",                   type: "text",   required: false, pdfField: "Pt4Line2_Country",          group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_DateFrom", label: "Date moved in",             type: "date",   required: false, pdfField: "Pt4Line2_DateFrom",         group: "Previous Address (if any in last 5 years)" },
      { id: "Pt4Line2_DateTo",   label: "Date moved out",            type: "date",   required: false, pdfField: "Pt4Line2_DateTo",           group: "Previous Address (if any in last 5 years)" },
    ],
  },

  // ── Part 5 — Employment History ───────────────────────────────────────────────
  {
    id: "part5",
    title: "Part 5 — Employment History",
    shortTitle: "Employment",
    layout: "grouped",
    questions: [
      { id: "Pt5Line1_EmployerName",    label: "Current or most recent employer name", type: "text", required: false, pdfField: "Pt5Line1_EmployerOrSchoolName", group: "Current / Most Recent" },
      { id: "Pt5Line1_Occupation",      label: "Occupation / job title",               type: "text", required: false, pdfField: "Pt5Line1_Occupation",          group: "Current / Most Recent" },
      { id: "Pt5Line1_Street",          label: "Street address",                       type: "text", required: false, pdfField: "Pt5Line1_StreetNumberName",    group: "Current / Most Recent" },
      { id: "Pt5Line1_City",            label: "City or town",                         type: "text", required: false, pdfField: "Pt5Line1_CityOrTown",          group: "Current / Most Recent" },
      { id: "Pt5Line1_State",           label: "State",                                type: "select", required: false, pdfField: "Pt5Line1_State", options: US_STATES, group: "Current / Most Recent" },
      { id: "Pt5Line1_Zip",             label: "ZIP code",                             type: "text", required: false, pdfField: "Pt5Line1_ZipCode",             group: "Current / Most Recent" },
      { id: "Pt5Line1_DateFrom",        label: "Start date",                           type: "date", required: false, pdfField: "Pt5Line1_DateFrom",            group: "Current / Most Recent" },
      { id: "Pt5Line1_DateTo",          label: "End date (leave blank if current)",    type: "date", required: false, pdfField: "Pt5Line1_DateTo",              group: "Current / Most Recent" },

      { id: "Pt5Line2_EmployerName",    label: "Previous employer name",               type: "text", required: false, pdfField: "Pt5Line2_EmployerOrSchoolName", group: "Previous Employment (if any in last 5 years)" },
      { id: "Pt5Line2_Occupation",      label: "Occupation / job title",               type: "text", required: false, pdfField: "Pt5Line2_Occupation",           group: "Previous Employment (if any in last 5 years)" },
      { id: "Pt5Line2_City",            label: "City or town",                         type: "text", required: false, pdfField: "Pt5Line2_CityOrTown",           group: "Previous Employment (if any in last 5 years)" },
      { id: "Pt5Line2_State",           label: "State",                                type: "select", required: false, pdfField: "Pt5Line2_State", options: US_STATES, group: "Previous Employment (if any in last 5 years)" },
      { id: "Pt5Line2_DateFrom",        label: "Start date",                           type: "date", required: false, pdfField: "Pt5Line2_DateFrom",             group: "Previous Employment (if any in last 5 years)" },
      { id: "Pt5Line2_DateTo",          label: "End date",                             type: "date", required: false, pdfField: "Pt5Line2_DateTo",               group: "Previous Employment (if any in last 5 years)" },
    ],
  },

  // ── Part 6 — Biographic Information ──────────────────────────────────────────
  {
    id: "part6",
    title: "Part 6 — Biographic Information",
    shortTitle: "Biographic Info",
    layout: "grouped",
    questions: [
      {
        id: "Pt6Line1_Ethnicity",
        label: "Ethnicity",
        type: "radio",
        required: true,
        pdfField: "Pt6Line1_Ethnicity",
        options: [
          { value: "Hispanic or Latino",     label: "Hispanic or Latino" },
          { value: "Not Hispanic or Latino", label: "Not Hispanic or Latino" },
        ],
      },
      {
        id: "Pt6Line2_Race",
        label: "Race",
        type: "radio",
        required: true,
        pdfField: "Pt6Line2_Race",
        hint: "Select the option that best describes you. If you identify with more than one, select the primary one.",
        options: [
          { value: "White",                                   label: "White" },
          { value: "Asian",                                   label: "Asian" },
          { value: "Black or African American",              label: "Black or African American" },
          { value: "American Indian or Alaska Native",       label: "American Indian or Alaska Native" },
          { value: "Native Hawaiian or Other Pacific Islander", label: "Native Hawaiian or Other Pacific Islander" },
        ],
      },
      { id: "Pt6Line3_HeightFeet",   label: "Height — feet",   type: "number", required: true,  pdfField: "Pt6Line3_HeightFeet",   group: "Physical Description", placeholder: "e.g. 5" },
      { id: "Pt6Line4_HeightInches", label: "Height — inches", type: "number", required: true,  pdfField: "Pt6Line4_HeightInches", group: "Physical Description", placeholder: "0–11" },
      { id: "Pt6Line5_WeightLbs",    label: "Weight (lbs)",    type: "number", required: true,  pdfField: "Pt6Line5_WeightLbs",    group: "Physical Description" },
      {
        id: "Pt6Line6_EyeColor",
        label: "Eye color",
        type: "select",
        required: true,
        pdfField: "Pt6Line6_EyeColor",
        group: "Physical Description",
        options: EYE_COLORS,
      },
      {
        id: "Pt6Line7_HairColor",
        label: "Hair color",
        type: "select",
        required: true,
        pdfField: "Pt6Line7_HairColor",
        group: "Physical Description",
        options: HAIR_COLORS,
      },
    ],
  },

  // ── Part 9 — Eligibility & Background ────────────────────────────────────────
  {
    id: "part9",
    title: "Part 9 — Eligibility & Background",
    shortTitle: "Background",
    layout: "oneAtATime",
    warning:
      "⚠️ Review these questions carefully\n\nPart 9 contains questions about your immigration history, criminal record, and other background information. Your answers directly affect your eligibility for a green card. Answering incorrectly — even unintentionally — can have serious consequences.\n\nWe strongly recommend reviewing each answer in this section with a licensed immigration attorney or paralegal before submitting your application.\n\nThese questions are required by USCIS and cannot be skipped.",
    questions: [
      {
        id: "Pt9Line1a_YesNo",
        label: "Have you EVER knowingly committed any crime for which you have NOT been arrested?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line1a_YesNo",
        explanation:
          "This question asks whether you committed a crime but were never caught or charged. Answer honestly — disclosing an offense here is generally better than having it discovered during background checks. Consult an attorney if you are unsure.",
      },
      {
        id: "Pt9Line1b_YesNo",
        label: "Have you EVER been arrested, cited, charged, indicted, fined, or detained by any law enforcement officer for any reason?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line1b_YesNo",
        explanation:
          "This includes traffic arrests, DUIs, disorderly conduct, and any other encounter that resulted in an official record — even if charges were dropped or expunged. If you answered yes, your attorney will help you gather court records.",
      },
      {
        id: "Pt9Line1c_YesNo",
        label: "Have you EVER been a party to any criminal proceeding — not including juvenile records?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line1c_YesNo",
        explanation:
          "A criminal proceeding includes any court case where you were the defendant, even if you were acquitted or the case was dismissed.",
      },
      {
        id: "Pt9Line1d_YesNo",
        label: "Have you EVER had a juvenile court proceeding or been convicted of a crime as a juvenile?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line1d_YesNo",
        explanation:
          "Juvenile records are typically sealed, but USCIS still requires disclosure. An attorney can help you understand whether and how to disclose this.",
      },
      {
        id: "Pt9Line1e_YesNo",
        label: "Have you EVER had an offense expunged, or received a pardon, amnesty, or suspended sentence for any crime?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line1e_YesNo",
        explanation:
          "Even if your record was expunged or you received a pardon, you must disclose it on this form. USCIS is not bound by state expungement orders.",
      },
      {
        id: "Pt9Line2a_YesNo",
        label: "Have you EVER been a member of or in any way associated with any organization, association, fund, foundation, party, club, or similar group in the U.S. or elsewhere?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line2a_YesNo",
        explanation:
          "This is a broad question about organizational membership. Answer Yes if you have been a member of any group — including religious, social, or political organizations. Most applicants answer Yes and simply list innocent memberships.",
      },
      {
        id: "Pt9Line2b_YesNo",
        label: "Have you EVER been a member of or in any way involved with a terrorist organization as designated by the U.S. Secretary of State?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line2b_YesNo",
        explanation:
          "The U.S. maintains a list of designated foreign terrorist organizations. If you have never had any involvement with any such group, answer No.",
      },
      {
        id: "Pt9Line3a_YesNo",
        label: "Have you EVER applied for exemption or discharge from training or service in the U.S. armed forces on the basis of alienage?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line3a_YesNo",
        explanation:
          "If you sought to avoid U.S. military service specifically because you are not a citizen, this may affect your eligibility for citizenship in the future.",
      },
      {
        id: "Pt9Line4a_YesNo",
        label: "Have you EVER been a member of, or in any way associated with, the Nazi government of Germany or any government that engaged in genocide?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line4a_YesNo",
        explanation:
          "This is a standard USCIS question required by statute. For virtually all applicants, the answer is No.",
      },
      {
        id: "Pt9Line5a_YesNo",
        label: "Have you EVER engaged in or do you intend to engage in any espionage, sabotage, or activities to violate or circumvent any U.S. law?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line5a_YesNo",
        explanation:
          "This question asks about spying, sabotage, or deliberate law-breaking. For virtually all applicants, the answer is No.",
      },
      {
        id: "Pt9Line6a_YesNo",
        label: "Have you EVER been removed, excluded, or deported from the United States?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line6a_YesNo",
        explanation:
          "A formal removal or deportation order is different from voluntarily leaving the country. If you left under a grant of Voluntary Departure, consult your attorney about how to answer this.",
      },
      {
        id: "Pt9Line6b_YesNo",
        label: "Have you EVER been placed in removal, exclusion, rescission, or deportation proceedings?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line6b_YesNo",
        explanation:
          "This asks whether removal proceedings were ever started against you, even if they were terminated or you won your case. Answer Yes if any such proceedings were initiated.",
      },
      {
        id: "Pt9Line7a_YesNo",
        label: "Are you currently under a removal, deportation, or exclusion order?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line7a_YesNo",
        explanation:
          "If you currently have an outstanding order of removal or deportation, this is a critical issue that requires immediate attorney review before filing.",
      },
      {
        id: "Pt9Line8a_YesNo",
        label: "Have you EVER been a J nonimmigrant exchange visitor who was subject to the 2-year foreign residence requirement?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line8a_YesNo",
        explanation:
          "Some J-1 visa holders are required to return to their home country for 2 years before applying for a green card, unless they receive a waiver. If you have never held a J visa, answer No.",
      },
      {
        id: "Pt9Line9a_YesNo",
        label: "Have you EVER been a beneficiary of an immigration petition that was denied, revoked, or withdrawn?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line9a_YesNo",
        explanation:
          "If a prior I-130 or other immigrant petition filed on your behalf was denied or withdrawn, answer Yes. This does not automatically disqualify you, but you must disclose it.",
      },
      {
        id: "Pt9Line10a_YesNo",
        label: "Do you owe any Federal, State, or local taxes that are overdue?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line10a_YesNo",
        explanation:
          "Unpaid taxes do not automatically bar you from a green card, but you must disclose them. USCIS may ask for evidence of a payment plan.",
      },
      {
        id: "Pt9Line11a_YesNo",
        label: "Have you EVER been declared legally incompetent, or been confined to a mental institution?",
        type: "yesno",
        required: true,
        pdfField: "Pt9Line11a_YesNo",
        explanation:
          "This refers to formal legal or medical proceedings — not simply receiving mental health treatment. Outpatient therapy or counseling does not need to be disclosed here.",
      },
    ],
  },

  // ── Review & Preview ──────────────────────────────────────────────────────────
  {
    id: "review",
    title: "Review & Preview",
    shortTitle: "Review",
    layout: "review",
    questions: [],
  },
];

export function getSectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getRequiredQuestions(): Question[] {
  return SECTIONS.flatMap((s) => s.questions.filter((q) => q.required));
}

export function getSectionStatus(
  section: Section,
  formData: Record<string, string>
): "not_started" | "in_progress" | "complete" | "skipped" {
  if (section.layout === "review") return "not_started";
  const questions = section.questions;
  if (questions.length === 0) return "not_started";
  const answered = questions.filter((q) => formData[q.id] !== undefined && formData[q.id] !== "");
  if (answered.length === 0) return "not_started";
  const required = questions.filter((q) => q.required);
  const allRequired = required.every((q) => formData[q.id] !== undefined && formData[q.id] !== "");
  if (allRequired && answered.length >= required.length) return "complete";
  return "in_progress";
}
