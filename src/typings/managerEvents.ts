import { TextChannel } from 'discord.js';
import { Giveaway } from '..';

export type ManagerEvents = {
    giveawayStarted: [giveaway: Giveaway, channel: TextChannel, user: string];
    giveawayRerolled: [giveaway: Giveaway, channel: TextChannel, oldWinners: string[], newWinners: string[]];
    giveawayEnded: [giveaway: Giveaway, channel: TextChannel, winners: string[]];
};
export type ManagerListeners<K extends keyof ManagerEvents> = {
    event: K;
    run: (...args: ManagerEvents[K]) => void | unknown;
};
