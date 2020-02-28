import { StateItem } from "./StateItem";
/**
 * Group link to several another states
 */
export interface GroupLink extends StateItem {
    /** Title of link */
    title: string;
    /** Ids of connected states */
    stateIds: string[];
}