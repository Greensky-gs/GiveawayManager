import { Embed, EmbedBuilder } from 'discord.js';
import { giveaway, giveawayInput } from './giveaway';

export type embedsInputData = {
    giveaway?: (data: giveawayInput & { participants?: string[] }) => Embed | EmbedBuilder;
    ended?: (data: giveaway, winners: string[]) => Embed | EmbedBuilder;
    hasDeniedRoles?: (deniedRoles: string[], url: string) => Embed | EmbedBuilder;
    missingRequiredRoles?: (requiredRoles: string[], url: string) => Embed | EmbedBuilder;
    /**
     *
     * @param url URL of the giveaway
     * @returns An ambed
     * @deprecated Use `participationRegistered` instead
     */
    entryAllowed?: (url: string) => Embed | EmbedBuilder;
    alreadyParticipate?: (url: string) => Embed | EmbedBuilder;
    notParticipated?: (url: string) => Embed | EmbedBuilder;
    removeParticipation?: (url: string) => Embed | EmbedBuilder;
    winners?: (winners: string[], data: giveaway, url: string) => Embed | EmbedBuilder;
    noEntries?: (url: string) => Embed | EmbedBuilder;
    participationRegistered?: (url: string) => Embed | EmbedBuilder;
};
