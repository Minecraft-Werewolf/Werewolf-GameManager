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
        const root = this.gameSettingManager.getRoot();
        const stack: SettingCategoryNode[] = [root];
        this.openNode(player, stack);
    }

    private async openNode(player: Player, stack: SettingCategoryNode[]): Promise<void> {
        const node = stack[stack.length - 1];
        if (node === undefined) return;

        const form = new ActionFormData();
        form.title(node.title);

        const sortedChildren = [...node.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (const child of sortedChildren) {
            form.button(child.title, child.iconPath);
        }

        const { selection, canceled } = await form.show(player);

        if (canceled) {
            stack.pop();

            if (stack.length > 0) {
                this.openNode(player, stack);
            }
            return;
        }

        if (selection === undefined) return;

        const selected = sortedChildren[selection];
        if (!selected) return;

        if (selected.type === "category") {
            stack.push(selected);
            this.openNode(player, stack);
        } else {
            system.sendScriptEvent(
                `${SCRIPT_EVENT_ID_PREFIX}:${selected.command.addonId}`,
                JSON.stringify(selected.command),
            );
        }
    }
}
