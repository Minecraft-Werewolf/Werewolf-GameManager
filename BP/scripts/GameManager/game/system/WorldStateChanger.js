import { GameWorldState } from "../SystemManager";
export class WorldStateChanger {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.isInitialized = false;
    }
    static create(systemManager) {
        return new WorldStateChanger(systemManager);
    }
    change(next) {
        const current = this.systemManager.getWorldState();
        if (current === next)
            return;
        switch (next) {
            case GameWorldState.InGame:
                this.toInGame();
                break;
            case GameWorldState.OutGame:
                this.toOutGame();
                break;
        }
        if (!this.isInitialized)
            this.isInitialized = true;
        else
            this.systemManager.broadcastWorldStateChange(next);
    }
    toInGame() {
        this.systemManager.getOutGameManager()?.getOutGameEventManager().unsubscribeAll();
        this.systemManager.setOutGameManager(null);
        const InGameManager = this.systemManager.createInGameManager();
        InGameManager.getInGameEventManager().subscribeAll();
        this.systemManager.setInGameManager(InGameManager);
        this.systemManager.setWorldState(GameWorldState.InGame);
    }
    toOutGame() {
        this.systemManager.getInGameManager()?.getInGameEventManager().unsubscribeAll();
        this.systemManager.setInGameManager(null);
        const OutGameManager = this.systemManager.createOutGameManager();
        OutGameManager.getOutGameEventManager().subscribeAll();
        this.systemManager.setOutGameManager(OutGameManager);
        this.systemManager.setWorldState(GameWorldState.OutGame);
    }
}
