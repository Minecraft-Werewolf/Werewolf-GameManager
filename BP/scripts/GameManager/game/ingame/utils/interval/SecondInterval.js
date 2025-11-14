import { SYSTEMS } from "../../../../constants/systems";
import { BaseInterval } from "./BaseInterval";
export class SecondInterval extends BaseInterval {
    constructor(intervalManager) {
        super(SYSTEMS.INTERVAL.EVERY_SECOND);
        this.intervalManager = intervalManager;
    }
}
