import { TextChannel } from "discord.js"
import { Giveaway } from ".."
import { Connection } from "mysql";
import EasyJsonDB from "easy-json-database";

export type ManagerEvents = {
    giveawayStarted: [ giveaway: Giveaway, channel: TextChannel, user: string ];
    giveawayRerolled: [ giveaway: Giveaway, channel: TextChannel, oldWinners: string[], newWinners: string[] ];
    giveawayEnded: [ giveaway: Giveaway, channel: TextChannel, winners: string[] ];
}
export type ManagerListeners<K extends keyof ManagerEvents> = {
    event: K; run: (...args: ManagerEvents[K]) => void | unknown
}
export type databaseMode = 'json' | 'mysql'
export type MySQLDatabase = {
    mode: 'mysql';
    connection: Connection;
};
export type JSONDatabase = {
    mode: 'json',
    path: `./${string}`,
    file: EasyJsonDB;
}

export type databaseOptions<Mode extends databaseMode> = {
    mode: Mode
} & ( Mode extends 'json' ? { path: `./${string}.json` } : Mode extends 'mysql' ? { connection: Connection } : {} );
export type Database<Mode extends databaseMode> = Mode extends 'json' ? JSONDatabase : MySQLDatabase;