import { GevSlot, SimpleIntent } from "@volley/gev";
export type AutoIntent =
  | SimpleIntent<"No">
  | SimpleIntent<"Yes">
  | SimpleIntent<"Resume">
  | SimpleIntent<"Pause">
  | SimpleIntent<"Stop">
  | SimpleIntent<"Help">
  | SimpleIntent<"Cancel">
  | {
      name: "Name";
      slots: {
        name: GevSlot;
      };
    };
