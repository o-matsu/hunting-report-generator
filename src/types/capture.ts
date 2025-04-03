export enum Gender {
  Male = "Male",
  Female = "Female",
}

export const GenderTemplate = {
  [Gender.Male]: 'gender-male',
  [Gender.Female]: 'gender-female',
} as const;

export enum DisposalMethod {
  Burial = "Burial",
  Incineration = "Incineration",
  PersonalConsumption = "Personal consumption",
  ProcessingFacility = "Transport to a wild meat processing facility",
}

export const DisposalMethodTemplate = {
  [DisposalMethod.Burial]: 'disposal-burial',
  [DisposalMethod.Incineration]: 'disposal-incineration',
  [DisposalMethod.PersonalConsumption]: 'disposal-personal',
  [DisposalMethod.ProcessingFacility]: 'disposal-facility',
} as const;