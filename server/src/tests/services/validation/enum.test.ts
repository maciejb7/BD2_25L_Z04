import { ValidationService } from "../../../services/validation.service";
import { FieldValidationError } from "../../../errors/errors";

describe("doesStringMachesEnum function test", () => {
  enum TestEnum {
    VALUE1 = "value1",
    VALUE2 = "value2",
    VALUE3 = "value3",
  }

  it("should not throw anything for matching enum value", () => {
    expect(() => {
      ValidationService.doesStringFieldMatchesEnum(
        "value1",
        TestEnum,
        "testField",
      );
    }).not.toThrow();
  });

  it("should throw FieldValidationError for non-matching enum value", () => {
    expect(() => {
      ValidationService.doesStringFieldMatchesEnum(
        "invalidValue",
        TestEnum,
        "testField",
      );
    }).toThrow(
      new FieldValidationError(
        "TestField musi być jednym z: value1, value2, value3.",
        400,
      ),
    );
  });
});
