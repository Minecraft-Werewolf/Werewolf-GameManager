import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
export class SettingUIManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new SettingUIManager(gameSettingManager);
    }
    open(player) {
        const root = this.gameSettingManager.getRoot();
        const stack = [root];
        this.openNode(player, stack);
    }
    async openNode(player, stack) {
        const node = stack[stack.length - 1];
        if (node === undefined)
            return;
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
        if (selection === undefined)
            return;
        const selected = sortedChildren[selection];
        if (!selected)
            return;
        if (selected.type === "category") {
            stack.push(selected);
            this.openNode(player, stack);
        }
        else if (selected.type === "item") {
            KairoUtils.sendKairoCommand(selected.command.targetAddonId, selected.command.commandId, {
                playerId: player.id,
            });
        }
    }
}
