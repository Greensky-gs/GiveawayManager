// Class
export { GiveawayManager } from './structures/GiveawayManager';

// Typings
export { giveawayInput, giveaway as Giveaway, gwSql as GiveawaySQLData } from './typings/giveaway';

// Assets
export * as buttons from './assets/buttons';
export * as embeds from './assets/embeds';

// Module declaration

import { giveaway as Giveaway } from './typings/giveaway';
declare module 'discord.js' {
    interface ClientEvents {
        giveawayStarted: [ giveaway: Giveaway, channel: TextChannel, user: string ];
        giveawayRerolled: [ giveaway: Giveaway, channel: TextChannel, oldWinners: string[], newWinners: string[] ];
        giveawayEnded: [ giveaway: Giveaway, channel: TextChannel, winners: string[] ]
    }
}