import { ButtonInteraction, Client, Collection, Guild } from 'discord.js';
import { Connection } from 'mysql';
import { buttonsInputData } from './dist/typings/buttons';
import { embedsInputData } from './dist/typings/embeds';
import { giveaway as Giveaway, giveawayInput } from './dist/typings/giveaway';
export { embedsInputData } from './dist/typings/embeds';
export { buttonsInputData } from './dist/typings/buttons';
export { giveawayInput, giveaway as Giveaway } from './dist/typings/giveaway';
import { ManagerEvents } from './dist/typings/managerEvents';

export class GiveawayManager {
    public readonly client: Client;
    public database: Connection;
    private cache: Collection<string, Giveaway>;
    private ended: Collection<string, Giveaway>;
    private embeds: embedsInputData;
    private buttons: buttonsInputData;
    private sendMessages: boolean;

    public constructor(
        client: Client,
        db: Connection,
        options?: {
            embeds?: embedsInputData;
            buttons?: buttonsInputData;
            sendMessages?: boolean;
        },
    );

    
    public get list(): { ended: Giveaway[], giveaways: Giveaway[] };
    public get map(): { ended: Map<string, Giveaway>, giveaways: Map<string, Giveaway> };
    public get collection(): { ended: Collection<string, Giveaway>, giveaways: Collection<string, Giveaway> };

    public on<K extends keyof ManagerEvents>(event: K, run: (...args: ManagerEvents[K]) => void | unknown): void;
    public start(): void;
    public createGiveaway(input: giveawayInput): Promise<Giveaway>;
    public fetchGiveaway(input: string, force?: boolean): Giveaway | undefined;
    public endGiveaway(input: string): Promise<string[] | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public reroll(
        input: string
    ): Promise<string[] | 'not ended' | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public deleteGiveaway(
        input: string
    ): Promise<Giveaway | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;

    private roll(giveaway: Giveaway, guild: Guild): Promise<string[]>;
    private registerParticipation(interaction: ButtonInteraction<'cached'>): void;
    private unregisterParticipation(interaction: ButtonInteraction<'cached'>): void;
    private setOnInteraction(): void;
    private getUrl(input: { guild_id: string; channel_id: string; message_id: string }): string;
    private makeQuery(data: any, exists?: boolean): string;
    private getValue(x: string | string[]): string;
    private toObj(x: any): Giveaway;
    private fillCache(): Promise<void>;
    private query<R = any>(search: string): Promise<R[]>;
}
