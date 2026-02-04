import type { SettingDefinition } from "../../../../data/settings";
import type { SettingRegistrationValidator } from "./SettingRegistrationValidator";

export class SettingDefinitionValidator {
    private constructor(private readonly roleRegistrationValidator: SettingRegistrationValidator) {}

    public static create(
        roleRegistrationValidator: SettingRegistrationValidator,
    ): SettingDefinitionValidator {
        return new SettingDefinitionValidator(roleRegistrationValidator);
    }

    public isSetting(data: unknown): data is SettingDefinition {
        if (!this.isObject(data)) return false;

        if (typeof data.id !== "string") return false;
        return true;
    }

    private isObject(x: unknown): x is Record<string, unknown> {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
}
