import Agenda from "agenda";
import { config } from "../config";
// Initialize Agenda with MongoDB connection and basic settings
export const agenda = new Agenda({
  db: { address: config.mongoUri, collection: "agendaJobs" },
  processEvery: "15 seconds", // Poll jobs every 15 seconds
  maxConcurrency: 5, // Max jobs running at once globally
  defaultConcurrency: 1, // Default max concurrent jobs per job type
});
//Starts the agenda scheduler
export async function startAgenda() {
  await agenda.start();
}
