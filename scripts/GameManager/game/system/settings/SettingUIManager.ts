import { Player, system } from "@minecraft/server";
import type { SettingCategoryNode } from "../../../data/settings";
import { ActionFormData } from "@minecraft/server-ui";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
import type { GameSettingManager } from "./GameSettingManager";

export class SettingUIManager {
    private constructor(private readonly gameSettingManager: GameSettingManager) {}
    public static create(gameSettingManager: GameSettingManager): SettingUIManager {
        return new SettingUIManager(gameSettingManager);
    }

    public open(player: Player): void {
        this.openNode(player, this.gameSettingManager.getRoot());
    }

    private async openNode(player: Player, node: SettingCategoryNode): Promise<void> {
        const form = new ActionFormData();
        form.title(node.title);

        const sortedChildren = [...node.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        for (const child of sortedChildren) {
            form.button(child.title, child.iconPath);
        }

        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled || selection === undefined) return;
        const selected = sortedChildren[selection];
        if (!selected) return;

        if (selected.type === "category") {
            this.openNode(player, selected);
        } else {
            system.sendScriptEvent(
                `${SCRIPT_EVENT_ID_PREFIX}:${selected.command.addonId}`,
                JSON.stringify(selected.command),
            );
        }
    }
}
