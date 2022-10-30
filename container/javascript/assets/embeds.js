const { EmbedBuilder } = require('discord.js');

module.exports = {
    /**
     * @param {{ reward: String, winnerCount: Number, hosterId: String, channel: TextChannel, time: Number, ?bonusRoles: String[], ?deniedRoles: String[], ?requiredRoles: String[] }} data
     */
    giveaway: (data) => {
        const embed = new EmbedBuilder().setTitle('🎉 Giveaway 🎉').setColor('#00ff00').setDescription(`**${
            data.reward
        }**
Hosted by <@${data.hosterId}>
**${data.winnerCount}** winner${data.winnerCount > 1 ? 's' : ''}
Entries : ${data.participants ? data.participants.length : '0'}

Ends <t:${((parseInt(data.time) + Date.now()) / 1000).toFixed(0)}:R>`);

        if (data.bonusRoles && data.bonusRoles.length > 0) {
            embed.addFields({
                name: 'Bonus roles',
                value: data.bonusRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        }
        if (data.requiredRoles && data.requiredRoles.length > 0) {
            embed.addFields({
                name: 'Required roles',
                value: data.requiredRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        }
        if (data.deniedRoles && data.deniedRoles.length > 0) {
            embed.addFields({
                name: 'Denied roles',
                value: data.deniedRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        }

        return embed;
    },
    ended: (data, winners) => {
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
    },
    hasDeniedRoles: (deniedRoles, url) => {
        return new EmbedBuilder()
            .setTitle('🚫 Access denied')
            .setDescription(
                `The access to [**this giveaway**](${url}) is denied for **you** because you have one of theses roles :\n${deniedRoles
                    .map((x) => `<@&${x}>`)
                    .join(' ')}`
            )
            .setColor('#ff0000');
    },
    missingRequiredRoles: (requiredRoles, url) => {
        return new EmbedBuilder()
            .setTitle('🚫 Access denied')
            .setDescription(
                `The access to [**this giveaway**](${url}) is denied for **you** because you don't have all theses roles :\n${requiredRoles
                    .map((x) => `<@&${x}>`)
                    .join(' ')}`
            )
            .setColor('#ff0000');
    },
    entryAllowed: (url) => {
        return new EmbedBuilder()
            .setTitle('🎉 Entry Allowed')
            .setColor('#00ff00')
            .setDescription(`The entry to [**this giveaway**](${url}) is allowed.\nGood luck !`);
    },
    alreadyParticipate: (url) => {
        return new EmbedBuilder()
            .setTitle('🚫 Already participated')
            .setDescription(`You already participate to [**this giveaway**](${url}).`)
            .setColor('#ff0000');
    },
    notParticipated: (url) => {
        return new EmbedBuilder()
            .setTitle('🚫 Not participed')
            .setDescription(`You have not participated to [**this giveaway**](${url})`)
            .setColor('#ff0000');
    },
    removeParticipation: (url) => {
        return new EmbedBuilder()
            .setTitle('❌ Entry removed')
            .setDescription(`I removed your entry to [**this giveaway**](${url}).`)
            .setColor('#00ff00');
    },
    winners: (winners, url) => {
        return new EmbedBuilder()
            .setTitle('🎉 Winners')
            .setDescription(
                `The winner${winners.length > 1 ? 's' : ''} of [**this giveaway**](${url}) ${
                    winners.length > 1 ? 'are' : 'is'
                } ${winners.map((x) => `<@${x}>`).join(' ')}`
            )
            .setColor('#00ff00');
    }
};
