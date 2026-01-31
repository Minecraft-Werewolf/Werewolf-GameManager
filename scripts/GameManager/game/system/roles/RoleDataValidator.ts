import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

/**
 * 役職データは文字列で送られてくるため、
 * データを検証する必要がある。そのためのクラス
 */
export class RoleDataValidator {
    private constructor(private readonly roleManager: RoleManager) {}

    public static create(roleManager: RoleManager): RoleDataValidator {
        return new RoleDataValidator(roleManager);
    }

    public isRole(data: unknown): data is RoleDefinition {
        if (!this.isObject(data)) return false;

        if (typeof data.id !== "string") return false;
        if (!KairoUtils.isRawMessage(data.name)) return false;
        if (!KairoUtils.isRawMessage(data.description)) return false;
        if (typeof data.factionId !== "string") return false;
        if (typeof data.sortIndex !== "number") return false;

        if (data.count !== undefined && !this.isValidCount(data.count)) return false;
        if (data.color !== undefined && !this.isColorType(data.color)) return false;
        if (data.divinationResult !== undefined && !this.isResultType(data.divinationResult))
            return false;
        if (data.mediumResult !== undefined && !this.isResultType(data.mediumResult)) return false;
        if (data.knownRoles !== undefined && !this.isStringArray(data.knownRoles)) return false;

        if (data.skills !== undefined) {
            if (!Array.isArray(data.skills)) return false;
            if (!data.skills.every((s) => this.isSkillDefinition(s))) return false;
        }

        if (data.handleGameEvents !== undefined) {
            if (!this.isObject(data.handleGameEvents)) return false;

            for (const [eventType, binding] of Object.entries(data.handleGameEvents)) {
                if (!this.isGameEventType(eventType)) return false;
                if (!this.isSkillEventBinding(binding)) return false;
            }
        }

        if (data.appearance !== undefined) {
            if (!this.isObject(data.appearance)) return false;
            const ap = data.appearance as Record<string, unknown>;
            if (ap.toSelf !== undefined && !this.isRoleRef(ap.toSelf)) return false;
            if (ap.toOthers !== undefined && !this.isRoleRef(ap.toOthers)) return false;
            if (ap.toWerewolves !== undefined && !this.isRoleRef(ap.toWerewolves)) return false;
        }

        return true;
    }

    private isObject(x: unknown): x is Record<string, unknown> {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }

    private isStringArray(x: unknown): x is string[] {
        return Array.isArray(x) && x.every((v) => typeof v === "string");
    }

    private isValidCount(x: unknown): boolean {
        if (!this.isObject(x)) return false;
        if (x.max !== undefined && typeof x.max !== "number") return false;
        if (x.step !== undefined && typeof x.step !== "number") return false;
        return true;
    }

    private isRoleRef(x: unknown): x is { addonId: string; roleId: string } {
        return this.isObject(x) && typeof x.addonId === "string" && typeof x.roleId === "string";
    }

    private isResultType(x: unknown): x is string {
        return typeof x === "string";
    }

    private isColorType(x: unknown): x is string {
        return typeof x === "string";
    }

    private isGameEventType(x: unknown): x is string {
        return typeof x === "string";
    }

    private isSkillDefinition(x: unknown): boolean {
        if (!this.isObject(x)) return false;

        if (typeof x.id !== "string") return false;
        if (!KairoUtils.isRawMessage(x.name)) return false;

        if (
            x.cooldown !== undefined &&
            typeof x.cooldown !== "number" &&
            typeof x.cooldown !== "string"
        )
            return false;

        if (
            x.maxUses !== undefined &&
            typeof x.maxUses !== "number" &&
            typeof x.maxUses !== "string"
        )
            return false;

        return true;
    }

    private isSkillEventBinding(x: unknown): boolean {
        return this.isObject(x) && typeof x.skillId === "string";
    }
}
