import type { Player } from "@minecraft/server";
import type { SystemManager } from "../game/SystemManager";
import { ModalFormData } from "@minecraft/server-ui";

const settingsUI = new ModalFormData().title("");

export class HostManager {
    private constructor(public readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): HostManager {
        return new HostManager(systemManager);
    }
    public showSettingsMenu(player: Player) {
        settingsUI.show(player).then((re) => {
            const { formValues, canceled, cancelationReason } = re;
        });
    }
    public host() {}
}
