import { Player, world, type RawMessage } from "@minecraft/server";
import type { GameSettingManager } from "./GameSettingManager";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import type { RoleDefinition } from "../../../data/roles";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";
import { KAIRO_DATAVAULT_SAVE_KEYS, SYSTEMS } from "../../../constants/systems";
import { ConsoleManager } from "../../../../@core/kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";
import type { FactionDefinition } from "../../../data/factions";

// クラスが肥大化気味なので、UI部分と責務を分断したい
export class RoleCompositionManager {
    private constructor(private readonly gameSettingManager: GameSettingManager) {}
    public static create(gameSettingManager: GameSettingManager): RoleCompositionManager {
        return new RoleCompositionManager(gameSettingManager);
    }

    public async open(playerId: string): Promise<void> {
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
            ConsoleManager.error("[RoleCompositionManager] Player not Found");
            return;
        }

        const registeredRoleDefinitions =
            await this.gameSettingManager.getDefinitionsMap<RoleDefinition>(
                KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_ADDON_LIST,
                KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_PREFIX,
            );

        const workingRoleDefinitions: Map<string, RoleDefinition[]> =
            this.deepCopyRegisteredRoleDefinitions(registeredRoleDefinitions);

        this.openOverviewForm(player, workingRoleDefinitions);
    }

    private async openOverviewForm(
        player: Player,
        workingRoleDefinitions: Map<string, RoleDefinition[]>,
    ): Promise<void> {
        const addonIds = Array.from(workingRoleDefinitions.keys()).sort((a, b) =>
            a.localeCompare(b, "en", { numeric: true }),
        );

        let roleCount = 0;
        const factions = await this.gameSettingManager.getDefinitions<FactionDefinition>(
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_PREFIX,
        );
        const workingRolesList = this.filterRolesByCount(workingRoleDefinitions).map(
            (role): RawMessage => {
                const rawMessage: RawMessage[] = [];
                const faction = factions.find((faction) => faction.id === role.factionId);

                if (role.color !== undefined) rawMessage.push({ text: `\n${role.color}` });
                else if (faction !== undefined)
                    rawMessage.push({ text: `\n${faction.defaultColor}` });

                if (role.count?.amount === undefined) return {};

                rawMessage.push(role.name);
                rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}` });

                roleCount += role.count.amount;

                return { rawtext: rawMessage };
            },
        );

        const formBody: RawMessage[] = [];
        if (workingRolesList.length === 0)
            formBody.push({
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_NONE_ROLES,
            });
        else {
            formBody.push({
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_SELECTED_ROLES,
            });

            workingRolesList.push(
                { text: "\n\n" },
                {
                    translate:
                        WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE_TOTAL,
                    with: [roleCount.toString()],
                },
            );

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
            if (await this.hasRoleCompositionChanged(workingRoleDefinitions))
                return this.openCancelForm(player, workingRoleDefinitions);
            else return;
        }

        if (selection === 0) this.applyChanges(player, workingRoleDefinitions);
        else {
            const addonId = addonIds[selection - 1];
            if (addonId === undefined) return;
            return this.openEditorForm(player, workingRoleDefinitions, addonId);
        }
    }

    public async openEditorForm(
        player: Player,
        workingRoleDefinitions: Map<string, RoleDefinition[]>,
        addonId: string,
    ): Promise<void> {
        const form = new ModalFormData().title({ translate: `${addonId}.name` });

        const registeredRolesForAddon = workingRoleDefinitions.get(addonId);
        if (registeredRolesForAddon === undefined) return;

        const factions = await this.gameSettingManager.getDefinitions<FactionDefinition>(
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_PREFIX,
        );

        for (const role of registeredRolesForAddon) {
            const faction = factions.find((faction) => faction.id === role.factionId);
            if (faction === undefined) continue;

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
            form.slider(
                { rawtext: [{ text: color }, role.name, { text: SYSTEMS.COLOR_CODE.RESET }] },
                0,
                maxValue,
                { defaultValue, tooltip, valueStep },
            );
        }

        const { formValues, canceled, cancelationReason } = await form.show(player);
        if (canceled || formValues === undefined) {
            return this.openOverviewForm(player, workingRoleDefinitions);
        }

        registeredRolesForAddon.forEach((role, index) => {
            const newValue = formValues[index];
            if (typeof newValue !== "number") return;

            if (role.count?.amount !== undefined) role.count.amount = newValue;
        });

        return this.openOverviewForm(player, workingRoleDefinitions);
    }

    public async openCancelForm(
        player: Player,
        workingRoleDefinitions: Map<string, RoleDefinition[]>,
    ): Promise<void> {
        const form = new MessageFormData()
            .title({
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_TITLE,
            })
            .body({
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_MESSAGE,
            })
            .button1({
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_DISCARD_BUTTON,
            })
            .button2({
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_BACK_BUTTON,
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

    public async applyChanges(
        player: Player,
        working: Map<string, RoleDefinition[]>,
    ): Promise<void> {
        if (await !this.hasRoleCompositionChanged(working)) return;

        const registered = await this.gameSettingManager.getDefinitionsMap<RoleDefinition>(
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_PREFIX,
        );
        for (const [addonId, registeredRoles] of registered.entries()) {
            const workingRoles = working.get(addonId);
            if (!workingRoles) continue;
            const workingMap = new Map(workingRoles.map((r) => [r.id, r]));

            const compactRoleComposition: Record<string, number> = {};
            for (const role of registeredRoles) {
                const w = workingMap.get(role.id);
                if (!w) continue;

                if (!role.count) role.count = { amount: 0 };

                role.count.amount = w.count?.amount ?? 0;

                if (role.count.amount <= 0) continue;

                compactRoleComposition[role.id] = role.count.amount;
            }

            KairoUtils.saveToDataVault(
                KAIRO_DATAVAULT_SAVE_KEYS.ROLE_COMPOSITION_PREFIX + addonId,
                JSON.stringify(compactRoleComposition),
            );
        }

        const roleDefinitionsAfterApply = this.gameSettingManager.getSelectedRolesForNextGame();

        world.sendMessage({
            translate:
                WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE,
            with: [player.name],
        });
        const roleListMessage: RawMessage[] = [];
        roleListMessage.push({ text: SYSTEMS.SEPARATOR.LINE_CYAN + "\n" });

        const factions = await this.gameSettingManager.getDefinitions<FactionDefinition>(
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_PREFIX,
        );
        let roleCount = 0;
        for (const role of this.gameSettingManager.sortRoleDefinitions(roleDefinitionsAfterApply)) {
            const rawMessage: RawMessage[] = [];
            const faction = factions.find((faction) => faction.id === role.factionId);

            if (role.color !== undefined) rawMessage.push({ text: `${role.color}` });
            else if (faction !== undefined) rawMessage.push({ text: `${faction.defaultColor}` });

            if (role.count?.amount === undefined) continue;

            rawMessage.push(role.name);
            rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count.amount}\n` });

            roleCount += role.count.amount;

            roleListMessage.push({ rawtext: rawMessage });
        }
        roleListMessage.push(
            { text: "\n" },
            {
                translate:
                    WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE_TOTAL,
                with: [roleCount.toString()],
            },
        );
        roleListMessage.push({ text: "\n" + SYSTEMS.SEPARATOR.LINE_CYAN });
        world.sendMessage({ rawtext: roleListMessage });

        for (const player of world.getPlayers()) {
            player.playSound(SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_ID, {
                pitch: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_PITCH,
                volume: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_VOLUME,
                location: player.location,
            });
        }

        return;
    }

    private deepCopyRegisteredRoleDefinitions(
        source: Map<string, RoleDefinition[]>,
    ): Map<string, RoleDefinition[]> {
        const copy = new Map<string, RoleDefinition[]>();

        for (const [addonId, roles] of source.entries()) {
            copy.set(addonId, JSON.parse(JSON.stringify(roles)));
        }

        return copy;
    }

    private filterRolesByCount(RoleDefinitions: Map<string, RoleDefinition[]>): RoleDefinition[] {
        return [...RoleDefinitions.values()].flat().filter((role) => (role.count?.amount ?? 0) > 0);
    }

    private async hasRoleCompositionChanged(
        working: Map<string, RoleDefinition[]>,
    ): Promise<boolean> {
        const original = await this.gameSettingManager.getDefinitionsMap<RoleDefinition>(
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_PREFIX,
        );
        for (const [addonId, originalRoles] of original.entries()) {
            const workingRoles = working.get(addonId);
            if (!workingRoles) return true;

            const originalMap = new Map(originalRoles.map((r) => [r.id, r]));

            for (const w of workingRoles) {
                const o = originalMap.get(w.id);
                if (!o) return true;

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
