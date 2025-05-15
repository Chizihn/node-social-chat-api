export const GenderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type GenderEnumType = keyof typeof GenderEnum;

export const FriendshipStatus = {
  ACCEPTED: "ACCEPTED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  BLOCKED: "BLOCKED",
  REMOVED: "REMOVED",
} as const;

export type FriendshipStatusType = keyof typeof FriendshipStatus;
