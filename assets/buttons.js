const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    participate: () => {
        const button = new ButtonBuilder()
            .setCustomId('gw-participate')
            .setStyle(ButtonStyle.Success)
            .setLabel("Participate")
            .setEmoji('🎉')

        return button;
    },
    cancelParticipation: () => {
        const button = new ButtonBuilder()
            .setCustomId('gw-unparticipate')
            .setLabel("Unparticipate")
            .setStyle(ButtonStyle.Danger)
        
        return button
    },
    /**
     * @param {ButtonBuilder[]} components 
     */
    getAsRow: (components) => {
        const row = new ActionRowBuilder()
            .addComponents(components)
        
        return row;
    }
}