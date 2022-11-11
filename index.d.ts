import { ButtonInteraction, Client, Collection, Guild } from 'discord.js';
import { Connection } from 'mysql';
import { buttonsInputData } from './src/typings/buttons';
import { embedsInputData } from './src/typings/embeds';
import { giveaway as Giveaway, giveawayInput } from './src/typings/giveaway';
export { embedsInputData } from './src/typings/embeds';
export { buttonsInputData } from './src/typings/buttons';
export { giveawayInput, giveaway as Giveaway } from './src/typings/giveaway';

export class GiveawayManager {
    public readonly client: Client;
    public database: Connection;
    private cache: Collection<string, Giveaway>;
    private ended: Collection<string, Giveaway>;
    private embeds: embedsInputData;
    private buttons: buttonsInputData;

    public constructor(
        client: Client,
        db: Connection,
        options?: {
            embeds?: embedsInputData;
            buttons?: buttonsInputData;
        }
    );

    public get list(): Giveaway[];
    public get map(): Map<string, Giveaway>;
    public get collection(): Collection<string, Giveaway>;

    public start: () => void;
    public createGiveaway: (input: giveawayInput) => Promise<Giveaway>;
    public fetchGiveaway: (input: string, force?: boolean) => Giveaway | undefined;
    public endGiveaway: (input: string) => Promise<string[] | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public reroll: (
        input: string
    ) => Promise<string[] | 'not ended' | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public deleteGiveaway: (
        input: string
    ) => Promise<Giveaway | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;

    private roll: (giveaway: Giveaway, guild: Guild) => Promise<string[]>;
    private registerParticipation: (interaction: ButtonInteraction<'cached'>) => void;
    private unregisterParticipation: (interaction: ButtonInteraction<'cached'>) => void;
    private setOnInteraction: () => void;
    private getUrl: (input: { guild_id: string; channel_id: string; message_id: string }) => string;
    private makeQuery: (data: any, exists?: boolean) => string;
    private getValue: (x: string | string[]) => string;
    private toObj: (x: any) => Giveaway;
    private fillCache: () => Promise<void>;
    private query: <R = any>(search: string) => Promise<R[]>;
}
