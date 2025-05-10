export interface UserEntry {
  id: number;
  email: string;
  password: string;
}

export type NewUserEntry = Omit<UserEntry, "id">;
