import { ButtonBuilder, ActionRowBuilder, ButtonStyle, AnyComponentBuilder } from 'discord.js';

export const participate = (customId: string) => {
    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setStyle(ButtonStyle.Success)
        .setLabel('Participate')
        .setEmoji('🎉');

    return button;
};
export const cancelParticipation = (customId: string) => {
    const button = new ButtonBuilder().setCustomId(customId).setLabel('Unparticipate').setStyle(ButtonStyle.Danger);

    return button;
};
export const getAsRow = <T extends AnyComponentBuilder>(components: T[]) => {
    const row = new ActionRowBuilder().addComponents(components);
    return row as ActionRowBuilder<T>;
};
