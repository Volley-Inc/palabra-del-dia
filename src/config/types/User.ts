import { UserRecord } from "@volley/gev";

export const DEFAULT_USER_DATA = {
  name: "",
} as const;

export interface User extends UserRecord {
  name: string;
  /** 
   * Not used in the sample code, just here to show that User 
   * attributes can be optional.
   */
  age?: number;
}
