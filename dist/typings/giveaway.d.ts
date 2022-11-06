import { TextChannel } from 'discord.js';
export declare type giveaway = {
    guild_id: string;
    channel_id: string;
    message_id: string;
    hoster_id: string;
    reward: string;
    winnerCount: number;
    endsAt: number;
    participants: string[];
    required_roles: string[];
    denied_roles: string[];
    bonus_roles: string[];
    winners: string[];
    ended: boolean;
};
export declare type gwSql = giveaway & {
    denied_roles: string;
    bonus_roles: string;
    winners: string;
    participants: string;
    required_roles: string;
};
export declare type giveawayInput = {
    guild_id: string;
    channel: TextChannel;
    hoster_id: string;
    reward: string;
    winnerCount: number;
    time: number;
    required_roles?: string[];
    denied_roles?: string[];
    bonus_roles?: string[];
};
