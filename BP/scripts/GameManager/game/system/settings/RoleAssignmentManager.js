import { Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";
import { SYSTEMS } from "../../../constants/systems";
export class RoleAssignmentManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new RoleAssignmentManager(gameSettingManager);
    }
    async open(playerId) {
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
            ConsoleManager.error("[RoleAssignmentManager] Player not Found");
            return;
        }
        const registeredRoleDefinitions = this.gameSettingManager.getRegisteredRoleDefinitions();
        const workingRoleDefinitions = this.deepCopyRegisteredRoleDefinitions(registeredRoleDefinitions);
        this.openOverviewForm(player, workingRoleDefinitions);
    }
    async openOverviewForm(player, workingRoleDefinitions) {
        const addonIds = Array.from(workingRoleDefinitions.keys()).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        const workingRolesList = this.filterRolesByCount(workingRoleDefinitions).map((role) => {
            const rawMessage = [];
            const faction = this.gameSettingManager.getFactionData(role.factionId);
            if (faction !== null)
                rawMessage.push({ text: `\n${faction.defaultColor}` });
            rawMessage.push(role.name);
            rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}` });
            return { rawtext: rawMessage };
        });
        const formBody = [];
        if (workingRolesList.length === 0)
            formBody.push({
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_NONE_ROLES,
            });
        else {
            formBody.push({
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_SELECTED_ROLES,
            });
            formBody.push(...workingRolesList);
        }
        const form = new ActionFormData()
            .title({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_TITLE })
            .body({ rawtext: formBody })
            .divider()
            .button({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_CONFIRM,
        })
            .divider();
        for (const addonId of addonIds) {
            form.button({ translate: `${addonId}.name` });
        }
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled || selection === undefined) {
            if (this.hasRoleAssignmentChanged(workingRoleDefinitions))
                return this.openCancelForm(player, workingRoleDefinitions);
            else
                return;
        }
        if (selection === 0)
            this.applyChanges(workingRoleDefinitions);
        else {
            const addonId = addonIds[selection - 1];
            if (addonId === undefined)
                return;
            return this.openEditorForm(player, workingRoleDefinitions, addonId);
        }
    }
    async openEditorForm(player, workingRoleDefinitions, addonId) {
        const form = new ModalFormData().title({ translate: `${addonId}.name` });
        const registeredRolesForAddon = workingRoleDefinitions.get(addonId);
        if (registeredRolesForAddon === undefined)
            return;
        for (const role of registeredRolesForAddon) {
            const faction = this.gameSettingManager.getFactionData(role.factionId);
            if (faction === null)
                continue;
            const color = faction.defaultColor;
            const maxValue = role.count?.max ?? 4;
            const defaultValue = role.count?.amount ?? 0;
            const valueStep = role.count?.step ?? 1;
            const tooltip = {
                rawtext: [
                    { text: color },
                    role.name,
                    { text: `${SYSTEMS.COLOR_CODE.RESET}\n\n` },
                    role.description,
                    { text: "\n\n" },
                    /**
                     * Name:
                     * Faction:
                     * Count:
                     * Fortune Result:
                     * Medium Result:
                     */
                ],
            };
            form.slider({ rawtext: [{ text: color }, role.name, { text: SYSTEMS.COLOR_CODE.RESET }] }, 0, maxValue, { defaultValue, tooltip, valueStep });
        }
        const { formValues, canceled, cancelationReason } = await form.show(player);
        if (canceled || formValues === undefined) {
            return this.openOverviewForm(player, workingRoleDefinitions);
        }
        registeredRolesForAddon.forEach((role, index) => {
            const newValue = formValues[index];
            if (typeof newValue !== "number")
                return;
            if (role.count?.amount !== undefined)
                role.count.amount = newValue;
        });
        return this.openOverviewForm(player, workingRoleDefinitions);
    }
    async openCancelForm(player, workingRoleDefinitions) { }
    applyChanges(workingRoleDefinitions) { }
    deepCopyRegisteredRoleDefinitions(source) {
        const copy = new Map();
        for (const [addonId, roles] of source.entries()) {
            copy.set(addonId, JSON.parse(JSON.stringify(roles)));
        }
        return copy;
    }
    filterRolesByCount(RoleDefinitions) {
        return [...RoleDefinitions.values()].flat().filter((role) => (role.count?.amount ?? 0) > 0);
    }
    hasRoleAssignmentChanged(working) {
        const original = this.gameSettingManager.getRegisteredRoleDefinitions();
        for (const [addonId, originalRoles] of original.entries()) {
            const workingRoles = working.get(addonId);
            if (!workingRoles)
                return true;
            const originalMap = new Map(originalRoles.map((r) => [r.id, r]));
            for (const w of workingRoles) {
                const o = originalMap.get(w.id);
                if (!o)
                    return true;
                const oAmount = o.count?.amount ?? 0;
                const wAmount = w.count?.amount ?? 0;
                if (oAmount !== wAmount) {
                    return true;
                }
            }
        }
        return false;
    }
}
