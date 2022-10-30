import { giveaway as gw, giveawayInput } from '../typings/giveaway';

const { EmbedBuilder } = require('discord.js');

export const giveaway = (data: giveawayInput) => {
    const embed = new EmbedBuilder().setTitle('🎉 Giveaway 🎉').setColor('#00ff00').setDescription(`**${data.reward}**
Hosted by <@${data.hoster_id}>
**${data.winnerCount}** winner${data.winnerCount > 1 ? 's' : ''}
Entries : ${data.winnerCount ? data.winnerCount : '0'}

Ends <t:${((data.time + Date.now()) / 1000).toFixed(0)}:R>`);

    if (data.bonus_roles && data.bonus_roles.length > 0) {
        embed.addFields({
            name: 'Bonus roles',
            value: data.bonus_roles.map((rId) => `<@&${rId}>`).join(' '),
            inline: false
        });
    }
    if (data.required_roles && data.required_roles.length > 0) {
        embed.addFields({
            name: 'Required roles',
            value: data.required_roles.map((rId) => `<@&${rId}>`).join(' '),
            inline: false
        });
    }
    if (data.denied_roles && data.denied_roles.length > 0) {
        embed.addFields({
            name: 'Denied roles',
            value: data.denied_roles.map((rId) => `<@&${rId}>`).join(' '),
            inline: false
        });
    }

    return embed;
};
export const ended = (data: gw, winners: string[]) => {
    const embed = new EmbedBuilder().setTitle('🎉 Giveaway ended 🎉').setColor('#ff0000').setDescription(`**${
        data.reward
    }**
Hosted by <@${data.hoster_id}>
${
    winners.length > 0
        ? `Winner${data.winnerCount > 1 ? 's' : ''} : ${winners.map((x) => `<@${x}>`).join(' ')}`
        : 'No winner'
}
Entries: ${data.participants.length}

Ended <t:${(Date.now() / 1000).toFixed(0)}:R>`);

    return embed;
};
export const hasDeniedRoles = (deniedRoles: string[], url: string) => {
    return new EmbedBuilder()
        .setTitle('🚫 Access denied')
        .setDescription(
            `The access to [**this giveaway**](${url}) is denied for **you** because you have one of theses roles :\n${deniedRoles
                .map((x) => `<@&${x}>`)
                .join(' ')}`
        )
        .setColor('#ff0000');
};
export const missingRequiredRoles = (requiredRoles: string[], url: string) => {
    return new EmbedBuilder()
        .setTitle('🚫 Access denied')
        .setDescription(
            `The access to [**this giveaway**](${url}) is denied for **you** because you don't have all theses roles :\n${requiredRoles
                .map((x) => `<@&${x}>`)
                .join(' ')}`
        )
        .setColor('#ff0000');
};
export const entryAllowed = (url: string) => {
    return new EmbedBuilder()
        .setTitle('🎉 Entry Allowed')
        .setColor('#00ff00')
        .setDescription(`The entry to [**this giveaway**](${url}) is allowed.\nGood luck !`);
};
export const alreadyParticipate = (url: string) => {
    return new EmbedBuilder()
        .setTitle('🚫 Already participated')
        .setDescription(`You already participate to [**this giveaway**](${url}).`)
        .setColor('#ff0000');
};
export const notParticipated = (url: string) => {
    return new EmbedBuilder()
        .setTitle('🚫 Not participed')
        .setDescription(`You have not participated to [**this giveaway**](${url})`)
        .setColor('#ff0000');
};
export const removeParticipation = (url: string) => {
    return new EmbedBuilder()
        .setTitle('❌ Entry removed')
        .setDescription(`I removed your entry to [**this giveaway**](${url}).`)
        .setColor('#00ff00');
};
export const winners = (winners: string[], url: string) => {
    return new EmbedBuilder()
        .setTitle('🎉 Winners')
        .setDescription(
            `The winner${winners.length > 1 ? 's' : ''} of [**this giveaway**](${url}) ${
                winners.length > 1 ? 'are' : 'is'
            } ${winners.map((x) => `<@${x}>`).join(' ')}`
        )
        .setColor('#00ff00');
};
