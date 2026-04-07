export type PetitionerType = "usc" | "lpr";

export type EntryMethod =
  | "visa"               // entered with a valid visa
  | "advance_parole"     // entered with Advance Parole travel document
  | "without_inspection" // crossed border without documents
  | "other";             // other / unknown

export type CurrentStatus =
  | "daca"         // DACA recipient
  | "valid_status" // valid visa or other lawful status
  | "overstay"     // status has expired
  | "no_status"    // no current legal status
  | "unknown";

export type PriorRemoval = "no" | "yes" | "unknown";

export type FilingStage =
  | "concurrent"           // filing I-130 + I-485 at the same time
  | "post_i130_approval"   // I-130 already approved, now filing I-485
  | "unknown";

export interface IntakeAnswers {
  petitionerType: PetitionerType;
  entryMethod: EntryMethod;
  currentStatus: CurrentStatus;
  priorRemoval: PriorRemoval;
  filingStage: FilingStage;
}
