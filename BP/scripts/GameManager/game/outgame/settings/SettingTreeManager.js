export class SettingTreeManager {
    constructor(root) {
        this.root = root;
    }
    /**
     * 指定した parentId の階層に node を追加する。
     * 同階層に同じ ID が存在する場合は false を返す。
     */
    addNode(parentId, node) {
        const parent = this.findCategoryNode(parentId, this.root);
        if (!parent)
            return false;
        // 同階層 ID 重複チェック
        if (parent.children.some((c) => c.id === node.id)) {
            console.warn(`[SettingTree] Duplicate ID on same level: '${node.id}' under parent '${parentId}'`);
            return false;
        }
        parent.children.push(node);
        this.sortChildren(parent);
        return true;
    }
    /**
     * 指定階層（その親の下）から ID を持つノードを検索する。
     * 同階層 ID チェックや操作に使う。
     */
    findNodeUnderParent(parentId, id) {
        const parent = this.findCategoryNode(parentId, this.root);
        if (!parent)
            return null;
        return parent.children.find((c) => c.id === id) ?? null;
    }
    /**
     * カテゴリノードを ID で検索する（再帰）
     * ※ "同階層のみ重複禁止" なので、検索は「最初に見つかったカテゴリ」を返す。
     */
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
    /**
     * 子供を order 順に並び替える
     */
    sortChildren(category) {
        category.children.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
}
