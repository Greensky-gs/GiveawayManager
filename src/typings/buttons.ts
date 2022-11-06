import { ButtonBuilder } from "discord.js"

export type buttonsInputData = {
    participate?: () => ButtonBuilder;
    cancelParticipation?: () => ButtonBuilder
}