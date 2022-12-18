import { ButtonInteraction, Client, Collection, Guild } from 'discord.js';
import { Connection } from 'mysql';
import { giveaway as giveawayType, giveawayInput } from './typings/giveaway';
import { embedsInputData } from './typings/embeds';
import { buttonsInputData } from './typings/buttons';

export class GiveawayManager {
    public readonly client: Client;
    public database: Connection;
    private cache: Collection<string, giveawayType>;
    private ended: Collection<string, giveawayType>;
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

    public get list(): giveawayType[];
    public get map(): Map<string, giveawayType>;
    public get collection(): Collection<string, giveawayType>;

    public start: () => void;
    public createGiveaway: (input: giveawayInput) => Promise<giveawayType>;
    public fetchGiveaway: (input: string, force?: boolean) => giveawayType | undefined;
    public endGiveaway: (input: string) => Promise<string[] | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public reroll: (
        input: string
    ) => Promise<string[] | 'not ended' | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;
    public deleteGiveaway: (
        input: string
    ) => Promise<giveawayType | 'no giveaway' | 'no guild' | 'no channel' | 'no message'>;

    private roll: (giveaway: giveawayType, guild: Guild) => Promise<string[]>;
    private registerParticipation: (interaction: ButtonInteraction<'cached'>) => void;
    private unregisterParticipation: (interaction: ButtonInteraction<'cached'>) => void;
    private setOnInteraction: () => void;
    private getUrl: (input: { guild_id: string; channel_id: string; message_id: string }) => string;
    private makeQuery: (data: any, exists?: boolean) => string;
    private getValue: (x: string | string[]) => string;
    private toObj: (x: any) => giveawayType;
    private fillCache: () => Promise<void>;
    private query: <R = any>(search: string) => Promise<R[]>;
}
