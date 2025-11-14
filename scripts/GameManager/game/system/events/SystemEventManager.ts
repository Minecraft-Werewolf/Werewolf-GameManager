import { BaseEventManager } from "../../events/BaseEventManager";
import type { SystemManager } from "../../SystemManager";

export class SystemEventManager extends BaseEventManager {
    private constructor(private readonly systemManager: SystemManager) {
        super();
    }

    public static create(systemManager: SystemManager): SystemEventManager {
        return new SystemEventManager(systemManager);
    }

    public override subscribeAll(): void {}

    public override unsubscribeAll(): void {}

    public getSystemManager(): SystemManager {
        return this.systemManager;
    }
}
