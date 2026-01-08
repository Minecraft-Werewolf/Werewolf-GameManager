import { Player, world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";
import { SYSTEMS } from "../../../constants/systems";
export class RoleCompositionManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new RoleCompositionManager(gameSettingManager);
    }
    async open(playerId) {
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
            ConsoleManager.error("[RoleCompositionManager] Player not Found");
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
            if (role.color !== undefined)
                rawMessage.push({ text: `\n${role.color}` });
            else if (faction !== null)
                rawMessage.push({ text: `\n${faction.defaultColor}` });
            rawMessage.push(role.name);
            rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}` });
            return { rawtext: rawMessage };
        });
        const formBody = [];
        if (workingRolesList.length === 0)
            formBody.push({
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_NONE_ROLES,
            });
        else {
            formBody.push({
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_SELECTED_ROLES,
            });
            formBody.push(...workingRolesList);
        }
        const form = new ActionFormData()
            .title({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_TITLE,
        })
            .body({ rawtext: formBody })
            .divider()
            .button({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CONFIRM,
        })
            .divider();
        for (const addonId of addonIds) {
            form.button({ translate: `${addonId}.name` });
        }
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled || selection === undefined) {
            if (this.hasRoleCompositionChanged(workingRoleDefinitions))
                return this.openCancelForm(player, workingRoleDefinitions);
            else
                return;
        }
        if (selection === 0)
            this.applyChanges(player, workingRoleDefinitions);
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
            const color = role.color ?? faction.defaultColor;
            const maxValue = role.count?.max ?? 4;
            const defaultValue = role.count?.amount ?? 0;
            const valueStep = role.count?.step ?? 1;
            const tooltip = {
                rawtext: [
                    { text: color },
                    role.name,
                    { text: `${SYSTEMS.COLOR_CODE.RESET}\n` },
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
    async openCancelForm(player, workingRoleDefinitions) {
        const form = new MessageFormData()
            .title({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_TITLE,
        })
            .body({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_MESSAGE,
        })
            .button1({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_DISCARD_BUTTON,
        })
            .button2({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_BACK_BUTTON,
        });
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled || selection === undefined) {
            return this.openOverviewForm(player, workingRoleDefinitions);
        }
        switch (selection) {
            case 0:
                return;
            case 1:
                this.openOverviewForm(player, workingRoleDefinitions);
                break;
        }
    }
    applyChanges(player, working) {
        if (!this.hasRoleCompositionChanged(working))
            return;
        const registered = this.gameSettingManager.getRegisteredRoleDefinitions();
        for (const [addonId, registeredRoles] of registered.entries()) {
            const workingRoles = working.get(addonId);
            if (!workingRoles)
                continue;
            const workingMap = new Map(workingRoles.map((r) => [r.id, r]));
            for (const role of registeredRoles) {
                const w = workingMap.get(role.id);
                if (!w)
                    continue;
                if (!role.count)
                    role.count = { amount: 0 };
                role.count.amount = w.count?.amount ?? 0;
            }
        }
        const roleDefinitionsAfterApply = this.gameSettingManager.getSelectedRolesForNextGame();
        world.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE,
            with: [player.name],
        });
        world.sendMessage(SYSTEMS.SEPARATOR.LINE_CYAN);
        const roleListMessage = [];
        for (const role of this.gameSettingManager.sortRoleDefinitions(roleDefinitionsAfterApply)) {
            const rawMessage = [];
            const faction = this.gameSettingManager.getFactionData(role.factionId);
            if (role.color !== undefined)
                rawMessage.push({ text: `${role.color}` });
            else if (faction !== null)
                rawMessage.push({ text: `${faction.defaultColor}` });
            rawMessage.push(role.name);
            rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}\n` });
            roleListMessage.push({ rawtext: rawMessage });
        }
        world.sendMessage({ rawtext: roleListMessage });
        world.sendMessage(SYSTEMS.SEPARATOR.LINE_CYAN);
        for (const player of world.getPlayers()) {
            player.playSound(SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_ID, {
                pitch: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_PITCH,
                volume: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_VOLUME,
                location: player.location,
            });
        }
        return;
    }
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
    hasRoleCompositionChanged(working) {
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
