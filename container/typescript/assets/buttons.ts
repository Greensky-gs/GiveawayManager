import { ButtonBuilder, ActionRowBuilder, ButtonStyle, AnyComponentBuilder } from 'discord.js';

export const participate = () => {
    const button = new ButtonBuilder()
        .setCustomId('gw-participate')
        .setStyle(ButtonStyle.Success)
        .setLabel('Participate')
        .setEmoji('🎉');

    return button;
};
export const cancelParticipation = () => {
    const button = new ButtonBuilder()
        .setCustomId('gw-unparticipate')
        .setLabel('Unparticipate')
        .setStyle(ButtonStyle.Danger);

    return button;
};
export const getAsRow = <T extends AnyComponentBuilder>(components: T[]) => {
    const row = new ActionRowBuilder().addComponents(components);
    return row as ActionRowBuilder<T>;
};
