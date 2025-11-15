import type { Player } from "@minecraft/server";
import type { SystemManager } from "../game/SystemManager";
import { ModalFormData } from "@minecraft/server-ui";
export class HostManager {
    #settingsUI = new ModalFormData().title("");
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): HostManager {
        return new HostManager(systemManager);
    }
    public showSettingsMenu(player: Player) {
        this.#settingsUI.show(player).then((re) => {
            const { formValues, canceled, cancelationReason } = re;
        });
    }
    public host() {}
}
