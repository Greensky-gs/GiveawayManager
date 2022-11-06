"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsRow = exports.cancelParticipation = exports.participate = void 0;
const discord_js_1 = require("discord.js");
const participate = () => {
    const button = new discord_js_1.ButtonBuilder()
        .setCustomId('gw-participate')
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setLabel('Participate')
        .setEmoji('🎉');
    return button;
};
exports.participate = participate;
const cancelParticipation = () => {
    const button = new discord_js_1.ButtonBuilder()
        .setCustomId('gw-unparticipate')
        .setLabel('Unparticipate')
        .setStyle(discord_js_1.ButtonStyle.Danger);
    return button;
};
exports.cancelParticipation = cancelParticipation;
const getAsRow = (components) => {
    const row = new discord_js_1.ActionRowBuilder().addComponents(components);
    return row;
};
exports.getAsRow = getAsRow;
