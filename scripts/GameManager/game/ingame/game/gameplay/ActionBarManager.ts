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

        // スキルクールタイム表示
        const skillCTs: RawMessage[] = [];
        playerData.skillStates.forEach((skillState, skillId) => {
            const cooldown =
                skillState.cooldownRemaining > 0
                    ? { text: `${skillState.cooldownRemaining}s` }
                    : {
                          translate:
                              WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_SKILL_READY,
                      };

            skillCTs.push(skillState.name, { text: ": " }, cooldown, lineBreak);
        });

        actionBarRawMessage.rawtext.push(...skillCTs);

        // 制限時間表示
        actionBarRawMessage.rawtext.push(lineBreak);
        const remainingTicks = this.gameManager.getRemainingTicks();
        const remainingTimeSeconds = Math.ceil(remainingTicks / 20);
        const remainingTimeMessage: RawMessage = {
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_REMAINING_TIME,
            with: [remainingTimeSeconds.toString()],
        };
        actionBarRawMessage.rawtext.push(remainingTimeMessage, lineBreak);

        player.onScreenDisplay.setActionBar(actionBarRawMessage);
    }
}
