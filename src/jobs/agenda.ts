import Agenda from "agenda";
import { config } from "../config";

export const agenda = new Agenda({
  db: { address: config.mongoUri, collection: "agendaJobs" },
  processEvery: "15 seconds",
  maxConcurrency: 5,
  defaultConcurrency: 1,
});

export async function startAgenda() {
  await agenda.start();
}
