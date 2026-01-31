import { KairoUtils } from "../../../../../Kairo/utils/KairoUtils";
import { PlayersDataManager } from "./PlayersDataManager";
export class WerewolfGameDataManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this._remainingTicks = 0;
        this._remainingTicks = 12000; // 後から設定をいじれるような仕組みを作った時に、ここでそれを使って初期化するようにする
        this.playersDataManager = PlayersDataManager.create(this);
    }
    static create(inGameManager) {
        return new WerewolfGameDataManager(inGameManager);
    }
    getWerewolfGameDataDTO() {
        return KairoUtils.buildKairoResponse(this.buildWerewolfGameData());
    }
    getInGameManager() {
        return this.inGameManager;
    }
    getPlayersDataManager() {
        return this.playersDataManager;
    }
    getPlayerData(playerId) {
        return this.playersDataManager.get(playerId);
    }
    getPlayersData() {
        return this.playersDataManager.getPlayersData();
    }
    get remainingTicks() {
        return this._remainingTicks;
    }
    updateRemainingTicks() {
        if (this._remainingTicks > 0) {
            this._remainingTicks--;
        }
    }
    buildWerewolfGameData() {
        const playersDataDTO = this.getPlayersData().map((playerData) => ({
            player: {
                id: playerData.player.id,
                name: playerData.player.name,
            },
            role: playerData.role,
            isAlive: playerData.isAlive,
            isVictory: playerData.isVictory,
        }));
        return {
            remainingTicks: this._remainingTicks,
            playersData: playersDataDTO,
        };
    }
}
