import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds: number = 10) => {
  return bcrypt.hash(value, saltRounds);
};

export const compareValues = async (
  value: string,
  hash: string
): Promise<boolean> => {
  if (!value || !hash) {
    return false;
  }
  return await bcrypt.compare(value, hash);
};
