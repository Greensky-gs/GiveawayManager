import { Client, Collection } from 'discord.js';
import { giveaway as gwT, giveawayInput } from '../typings/giveaway';
import { Connection } from 'mysql';
export declare class GiveawayManager {
    readonly client: Client;
    database: Connection;
    private cache;
    private ended;
    constructor(client: Client, db: Connection);
    /**
     * @description Get the list of all the giveaways in JSON format.
     * Use `map` to get it as a map, and `collection` to get it as a Discord collection
     */
    get list(): {
        ended: gwT[];
        giveaways: gwT[];
    };
    /**
     * @description Get the list of all the giveaways in a map
     * Use `list` to get it as a JSON array, or `collection` to get it as a Discord collection
     */
    get map(): {
        ended: Map<string, gwT>;
        giveaways: Map<string, gwT>;
    };
    /**
     * @description Get the list of all the giveaways in a Discord collection
     * Use `list` to get it as a JSON array, or `map` to get it as a map
     */
    get collection(): {
        ended: Collection<string, gwT>;
        giveaways: Collection<string, gwT>;
    };
    start(): void;
    /**
     * @description Create a giveaway in a server with the data that you specified
     * @param input Giveaway datas
     */
    createGiveaway(input: giveawayInput): Promise<gwT>;
    /**
     * @description Use it to fetch a giveaway. You can use the message ID, the channel ID or the guild ID.
     * In the case of the channel ID, it will return the last launched giveaway in the channel.
     * In the case of the guild ID, it will return the last launched giveaway of the server
     * @param input The search you want to do. You can use message, channel or guild ID
     * @param force This parameter makes the function searching giveaways even the ended ones.
     * Default value is false
     */
    fetchGiveaway(input: string, force?: boolean): gwT | undefined;
    /**
     * @description End a giveaway and return an array with the winners
     * @param input ID of the message of the giveaway you want to end
     * You can use only the message ID
     * @returns The promise is always resolved.
     * Be aware, it can return an ampty array or string values
     */
    endGiveaway(input: string): Promise<string[] | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    /**
     * @description Reroll a giveaway by it's ID and return an array with the new winners
     * @param input ID of the message of the giveaway you want to reroll
     * You can use only the message ID
     * @returns The promise is always resolved.
     * Be aware, it can return an empty array or string values
     */
    reroll(input: string): Promise<string[] | 'not ended' | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    /**
     * @description Delete a giveaway. You can delete a finished or a current giveaway.
     * Suppress the message, erase it from the database and returns the values of the giveaway
     * @param input Message ID of the giveaway you want to delete.
     * You can use only the message ID
     * @returns Returns the values stored for the giveaway.
     */
    deleteGiveaway(input: string): Promise<gwT | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    private registerParticipation;
    private unregisterParticipation;
    private setOnInteraction;
    private getUrl;
    private roll;
    private makeQuery;
    private getValue;
    private toObj;
    private fillCache;
    private query;
}
