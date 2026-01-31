import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS, SYSTEMS } from "../../../constants/systems";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";
export class InGameItemUseHandler extends BaseEventHandler {
    constructor(inGameEventManager) {
        super(inGameEventManager);
        this.inGameEventManager = inGameEventManager;
        this.beforeEvent = world.beforeEvents.itemUse;
        this.afterEvent = world.afterEvents.itemUse;
    }
    static create(inGameEventManager) {
        return new InGameItemUseHandler(inGameEventManager);
    }
    handleBefore(ev) {
        // 使用前処理
    }
    async handleAfter(ev) {
        // 使用後処理
        const { itemStack, source } = ev;
        switch (itemStack.typeId) {
            case ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID:
                KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.WEREWOLF_GAMEMANAGER, SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET);
                break;
            case ITEM_USE.SKILL_TRIGGER_ITEM_ID:
                const player = source;
                const playerData = this.inGameEventManager
                    .getInGameManager()
                    .getPlayerData(player.id);
                if (!playerData || !playerData.isAlive)
                    return;
                if (!playerData.role)
                    return;
                if (!playerData.role.skills)
                    return;
                if (playerData.role.handleGameEvents?.["SkillUse"] === undefined)
                    return;
                const skillId = playerData.role.handleGameEvents?.["SkillUse"].skillId;
                const skillState = playerData.skillStates.get(skillId);
                if (!skillState)
                    return;
                if (skillState.remainingUses === 0) {
                    player.playSound(SYSTEMS.ERROR.SOUND_ID, {
                        pitch: SYSTEMS.ERROR.SOUND_PITCH,
                        volume: SYSTEMS.ERROR.SOUND_VOLUME,
                        location: player.location,
                    });
                    player.sendMessage({
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.SKILL_NO_REMAINING_USES_ERROR,
                    });
                    return;
                }
                if (skillState.cooldownRemaining > 0) {
                    player.playSound(SYSTEMS.ERROR.SOUND_ID, {
                        pitch: SYSTEMS.ERROR.SOUND_PITCH,
                        volume: SYSTEMS.ERROR.SOUND_VOLUME,
                        location: player.location,
                    });
                    player.sendMessage({
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.SKILL_ON_COOLDOWN_ERROR,
                        with: [skillState.cooldownRemaining.toString()],
                    });
                    return;
                }
                const kairoResponse = await KairoUtils.sendKairoCommandAndWaitResponse(playerData.role?.providerAddonId ?? "", SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_INGAME_PLAYER_SKILL_TRIGGER, {
                    playerId: player.id,
                    eventType: "SkillUse",
                }, this.inGameEventManager.getInGameManager().getWerewolfGameDataManager()
                    .remainingTicks);
                if (kairoResponse.data.success) {
                    skillState.remainingUses -= 1;
                    skillState.cooldownRemaining =
                        playerData.role.skills.find((skill) => skill.id === skillId)
                            ?.cooldown ?? 0;
                    // とりあえず number と見なしているけど、後で設定できるようにしたら string を展開できるようにもする必要がある
                }
                break;
        }
    }
}
