import { GevTest } from "@volley/gev-testing";
import { testConfig } from "../config/testConfig";

/**
 * Sample test cases to demonstrate @volley/gev-testing, a fluent testing
 * framework for GEV (https://github.com/Volley-Inc/gev-testing).
 */
describe("IntroScene", () => {
  test("will ask name, greet user", async () => {
    await new GevTest(testConfig)
      .launch()
      .ssmlContains("Hello world!")
      .ssmlContains("What is your name?")
      .intent("Name", { name: "John Doe" })
      .ssmlContains("Nice to meet you John Doe!")
      .go();
  });

  test("handles confused state", async () => {
    await new GevTest(testConfig)
      .launch()
      .ssmlContains("What is your name?")
      .intent("Yes")
      .ssmlContains("Sorry, I didn't catch that. What is your name?")
      .intent("Name", { name: "John Doe" })
      .ssmlContains("Nice to meet you John Doe!")
      .go();
  });

  test("remembers user's name", async () => {
    await new GevTest(testConfig)
      .launch()
      .intent("Name", { name: "John Doe" })
      .launch()
      .ssmlContains("It's great to see you again John Doe!")
      .go();
  });
});
