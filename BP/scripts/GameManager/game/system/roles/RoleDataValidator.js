import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
/**
 * 役職データは文字列で送られてくるため、
 * データを検証する必要がある。そのためのクラス
 */
export class RoleDataValidator {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleDataValidator(roleManager);
    }
    isRole(data) {
        if (!this.isObject(data))
            return false;
        if (typeof data.id !== "string")
            return false;
        if (!KairoUtils.isRawMessage(data.name))
            return false;
        if (!KairoUtils.isRawMessage(data.description))
            return false;
        if (typeof data.faction !== "string")
            return false;
        if (typeof data.sortIndex !== "number")
            return false;
        if (data.count !== undefined && !this.isValidCount(data.count))
            return false;
        if (data.color !== undefined && !this.isColorType(data.color))
            return false;
        if (data.divinationResult !== undefined && !this.isResultType(data.divinationResult))
            return false;
        if (data.mediumResult !== undefined && !this.isResultType(data.mediumResult))
            return false;
        if (data.knownRoles !== undefined && !this.isStringArray(data.knownRoles))
            return false;
        if (data.handleGmaeEvents !== undefined) {
            if (!Array.isArray(data.handleGmaeEvents))
                return false;
            if (!data.handleGmaeEvents.every(this.isGameEventType))
                return false;
        }
        if (data.appearance !== undefined) {
            if (!this.isObject(data.appearance))
                return false;
            const ap = data.appearance;
            if (ap.toSelf !== undefined && !this.isRoleRef(ap.toSelf))
                return false;
            if (ap.toOthers !== undefined && !this.isRoleRef(ap.toOthers))
                return false;
            if (ap.toWerewolves !== undefined && !this.isRoleRef(ap.toWerewolves))
                return false;
        }
        return true;
    }
    isObject(x) {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
    isValidCount(x) {
        if (!this.isObject(x))
            return false;
        const count = x;
        if (count.max !== undefined && typeof count.max !== "number")
            return false;
        if (count.step !== undefined && typeof count.step !== "number")
            return false;
        return true;
    }
    isStringArray(x) {
        return Array.isArray(x) && x.every((v) => typeof v === "string");
    }
    isRoleRef(x) {
        return this.isObject(x) && typeof x.addonId === "string" && typeof x.roleId === "string";
    }
    isResultType(x) {
        return typeof x === "string";
    }
    isColorType(x) {
        return typeof x === "string";
    }
    isGameEventType(x) {
        return typeof x === "string";
    }
}
