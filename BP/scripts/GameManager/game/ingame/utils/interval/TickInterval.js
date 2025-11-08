import { SYSTEMS } from "../../../../constants/systems";
import { BaseInterval } from "./BaseInterval";
export class TickInterval extends BaseInterval {
    constructor(intervalManager) {
        super(SYSTEMS.INTERVAL_EVERY_TICK);
        this.intervalManager = intervalManager;
    }
}
