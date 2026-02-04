import { ConsoleManager } from "../../../../@core/kairo/utils/ConsoleManager";
import { DefinitionManager, type DefinitionType } from "./DefinitionManager";

export class RegistrationResultNotifer {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new RegistrationResultNotifer(definitionManager);
    }

    public notifiy(
        isSuccessful: boolean,
        type: DefinitionType,
        addonId: string,
        defintionIds: string[],
    ) {
        if (isSuccessful) {
            ConsoleManager.log(
                `${type} definitions registration succeeded from ${addonId}: [ ${defintionIds.join(", ")} ]`,
            );
        } else {
            // 失敗したとき用のエラーメッセージも用意する
        }
    }
}
