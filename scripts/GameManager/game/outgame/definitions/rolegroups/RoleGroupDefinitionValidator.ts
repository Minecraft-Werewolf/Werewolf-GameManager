import type { RoleGroupDefinition } from "../../../../data/rolegroup";
import type { RoleGroupRegistrationValidator } from "./RoleGroupRegistrationValidator";

export class RoleGroupDefinitionValidator {
    private constructor(
        private readonly roleRegistrationValidator: RoleGroupRegistrationValidator,
    ) {}

    public static create(
        roleRegistrationValidator: RoleGroupRegistrationValidator,
    ): RoleGroupDefinitionValidator {
        return new RoleGroupDefinitionValidator(roleRegistrationValidator);
    }

    public isRoleGroup(data: unknown): data is RoleGroupDefinition {
        if (!this.isObject(data)) return false;

        if (typeof data.id !== "string") return false;
        return true;
    }

    private isObject(x: unknown): x is Record<string, unknown> {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
}
