export class SettingTreeManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new SettingTreeManager(gameSettingManager);
    }
    addNode(parentId, node) {
        const parent = this.findCategoryNode(parentId, this.gameSettingManager.getRoot());
        if (!parent)
            return false;
        if (parent.children.some((c) => c.id === node.id)) {
            console.warn(`[SettingTree] Duplicate ID on same level: '${node.id}' under parent '${parentId}'`);
            return false;
        }
        parent.children.push(node);
        this.sortChildren(parent);
        return true;
    }
    findNodeUnderParent(parentId, id) {
        const parent = this.findCategoryNode(parentId, this.gameSettingManager.getRoot());
        if (!parent)
            return null;
        return parent.children.find((c) => c.id === id) ?? null;
    }
    findCategoryNode(id, current) {
        if (current.id === id && current.type === "category") {
            return current;
        }
        if (current.type === "category") {
            for (const child of current.children) {
                const found = this.findCategoryNode(id, child);
                if (found)
                    return found;
            }
        }
        return null;
    }
    sortChildren(category) {
        category.children.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
}
