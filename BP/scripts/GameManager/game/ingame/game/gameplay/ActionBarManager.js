import {} from "@minecraft/server";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { SYSTEMS } from "../../../../constants/systems";
export class ActionBarManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }
    static create(gameManager) {
        return new ActionBarManager(gameManager);
    }
    showActionBarToPlayers(players) {
        players.forEach((player) => {
            this.showActionBarToPlayer(player);
        });
    }
    showActionBarToPlayer(player) {
        const actionBarRawMessage = { rawtext: [] };
        if (!actionBarRawMessage.rawtext)
            return;
        const playerData = this.gameManager.getPlayerData(player.id);
        if (!playerData)
            return;
        if (!playerData.role)
            return;
        // 改行用変数
        const lineBreak = { text: "\n" };
        // 役職表示
        const roleName = {
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_ROLE_NAME,
            with: {
                rawtext: [
                    { text: playerData.role.color ?? SYSTEMS.COLOR_CODE.RESET },
                    playerData.role.name,
                    { text: SYSTEMS.COLOR_CODE.RESET },
                ],
            },
        };
        actionBarRawMessage.rawtext.push(roleName, lineBreak);
        // スキルクールタイム表示
        const skillCTs = [];
        playerData.skillStates.forEach((skillState, skillId) => {
            const cooldown = skillState.cooldownRemaining > 0
                ? { text: `${skillState.cooldownRemaining}s` }
                : {
                    translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_SKILL_READY,
                };
            skillCTs.push(skillState.name, { text: ": " }, cooldown, lineBreak);
        });
        actionBarRawMessage.rawtext.push(...skillCTs);
        // 制限時間表示
        actionBarRawMessage.rawtext.push(lineBreak);
        const remainingTicks = this.gameManager.getRemainingTicks();
        const remainingTimeSeconds = Math.ceil(remainingTicks / 20);
        const remainingTimeMessage = {
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_REMAINING_TIME,
            with: [remainingTimeSeconds.toString()],
        };
        actionBarRawMessage.rawtext.push(remainingTimeMessage, lineBreak);
        player.onScreenDisplay.setActionBar(actionBarRawMessage);
    }
}
