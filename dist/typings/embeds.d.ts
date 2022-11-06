import { Embed, EmbedBuilder } from "discord.js";
import { giveaway, giveawayInput } from "./giveaway";
export declare type embedsInputData = {
    giveaway?: (data: giveawayInput) => Embed | EmbedBuilder;
    ended?: (data: giveaway, winners: string[]) => Embed | EmbedBuilder;
    hasDeniedRoles?: (deniedRoles: string[], url: string) => Embed | EmbedBuilder;
    missingRequiredRoles?: (requiredRoles: string[], url: string) => Embed | EmbedBuilder;
    entryAllowed?: (url: string) => Embed | EmbedBuilder;
    alreadyParticipate?: (url: string) => Embed | EmbedBuilder;
    notParticipated?: (url: string) => Embed | EmbedBuilder;
    removeParticipation?: (url: string) => Embed | EmbedBuilder;
    winners?: (winners: string[], url: string) => Embed | EmbedBuilder;
};
