import { type Player, type RawMessage } from "@minecraft/server";
import type { GameManager } from "../GameManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { SYSTEMS } from "../../../../constants/systems";

export class ActionBarManager {
    private constructor(private readonly gameManager: GameManager) {}
    public static create(gameManager: GameManager): ActionBarManager {
        return new ActionBarManager(gameManager);
    }

    public showActionBarToPlayers(players: Player[]) {
        players.forEach((player) => {
            this.showActionBarToPlayer(player);
        });
    }

    private showActionBarToPlayer(player: Player) {
        const actionBarRawMessage: RawMessage = { rawtext: [] };
        if (!actionBarRawMessage.rawtext) return;

        const playerData = this.gameManager.getPlayerData(player.id);
        if (!playerData) return;
        if (!playerData.role) return;

        // 改行用変数
        const lineBreak = { text: "\n" };

        // 役職表示
        const roleName: RawMessage = {
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
