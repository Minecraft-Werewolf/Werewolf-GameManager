import { SYSTEMS } from "../../../../constants/systems";
import { BaseInterval } from "./BaseInterval";
export class SecondInterval extends BaseInterval {
    constructor(intervalManager) {
        super(SYSTEMS.INTERVAL_EVERY_SECOND);
        this.intervalManager = intervalManager;
    }
}
