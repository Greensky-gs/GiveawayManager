import { ButtonBuilder } from 'discord.js';

export type buttonsInputData = {
    participate?: (customId: string) => ButtonBuilder;
    cancelParticipation?: (customId: string) => ButtonBuilder;
};
