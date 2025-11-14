/**
 * scripts/properties から manifest.jsonを自動生成する
 * propertiesは、アドオン間通信においても、識別などに利用する
 */
/**
 * 文末に # が記述されている箇所を適宜修正して使用します。
 * Modify and use where # is written at the end of the sentence as appropriate
 */
export const properties = {
    id: "werewolf-gamemanager", // a-z & 0-9 - _
    metadata: {
        /** 製作者の名前 */
        authors: ["shizuku86"],
    },
    header: {
        name: "Werewolf-GameManager",
        description: "functions as the central GameManager for the Werewolf game.",
        version: {
            major: 1,
            minor: 0,
            patch: 0,
            prerelease: "dev.1",
            // build: "abc123",
        },
        min_engine_version: [1, 21, 100],
        uuid: "f5610c00-9981-4818-8995-fb8589cd4002",
    },
    resourcepack: {
        name: "Use BP Name",
        description: "Use BP Description",
        uuid: "5bfda9c4-e577-46d0-a5ea-3ed417e687e2",
        module_uuid: "d0b64a65-62d5-40f6-89b4-f8534a7340e2",
    },
    modules: [
        {
            type: "script",
            language: "javascript",
            entry: "scripts/index.js",
            version: "header.version",
            uuid: "22edc901-d92a-4e4a-827e-edf8b459c8f9",
        },
    ],
    dependencies: [
        {
            module_name: "@minecraft/server",
            version: "2.1.0",
        },
        {
            module_name: "@minecraft/server-ui",
            version: "2.0.0",
        },
    ],
    /** 前提アドオン */
    requiredAddons: {
        kairo: "1.0.0-dev.1", // "kairo": "1.0.0"
        "kairo-datavault": "1.0.0-dev.1",
    },
    tags: ["official", "stable"],
};
/**
 * "official" を非公式に付与することは許可されていません。
 * 公認のアドオンには "approved" を付与します。
 * It is not allowed to assign "official" unofficially.
 * For approved addons, assign "approved".
 *
 */
export const supportedTags = ["official", "approved", "stable", "experimental"];
