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
        player.onScreenDisplay.setActionBar(actionBarRawMessage);
    }
}
