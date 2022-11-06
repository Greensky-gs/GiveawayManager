import { ButtonBuilder, ActionRowBuilder, AnyComponentBuilder } from 'discord.js';
export declare const participate: () => ButtonBuilder;
export declare const cancelParticipation: () => ButtonBuilder;
export declare const getAsRow: <T extends AnyComponentBuilder>(components: T[]) => ActionRowBuilder<T>;
