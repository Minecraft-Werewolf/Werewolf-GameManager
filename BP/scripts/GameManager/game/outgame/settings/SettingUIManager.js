import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
export class SettingUIManager {
    constructor(root, scriptEventSender) {
        this.root = root;
        this.scriptEventSender = scriptEventSender;
    }
    open(player) {
        this.openNode(player, this.root);
    }
    async openNode(player, node) {
        const form = new ActionFormData();
        form.title(node.title);
        const sortedChildren = [...node.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (const child of sortedChildren) {
            form.button(child.title, child.iconPath);
        }
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled || selection === undefined)
            return;
        const selected = sortedChildren[selection];
        if (!selected)
            return;
        if (selected.type === "category") {
            this.openNode(player, selected);
        }
        else {
            this.scriptEventSender(`${SCRIPT_EVENT_ID_PREFIX}:${selected.command.addonId}`, JSON.stringify(selected.command));
        }
    }
}
