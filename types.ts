export type Genre = string;
/** Complexity/style of language used in the story */
export type WritingStyle = 'Novel' | 'Plain English' | 'Casual' | 'Literary' | 'South Indian English' | 'North Indian English';
export type RoleArchetype = 'Hero' | 'Villain' | 'Mentor' | 'Sidekick' | 'Rival' | 'Antihero' | 'Trickster' | 'Narrator';
export type EpisodeLength = 300 | 600 | 900 | 1000 | 1200;

export interface Character {
  id: string;
  name: string;
  role: RoleArchetype;
  traits: string[]; // stored as comma separated string in UI, array in logic
  speakingStyle: string;
  motivation: string;
  secret?: string;
  relationships?: string;
  characterization: string;
  submittedBy: string;
  isDefault: boolean;
  joinedAtEpisode: number;
}

export interface Episode {
  id: string;
  plotId: string;
  episodeNumber: number;
  title: string;
  content: string;
  summary: string[]; // 5 bullet points
  charactersUsed: string[]; // Names of chars used
  createdAt: number;
}

export interface Plot {
  id: string;
  title: string;
  genre: Genre;
  writingStyle: string; // e.g. WritingStyle or user-defined
  setting: string;
  plot: string; // Story summary / refined plot
  rules: string;
  objective: string;
  episodeLength: EpisodeLength;
  characters: Character[];
  episodes: Episode[];
  storyMemory: string; // Running memory/summary for the AI
  createdAt: number;
  directorId: string; // Browser session ID
}

export interface PlotDraft {
  title: string;
  genre: Genre;
  writingStyle: string;
  setting: string;
  plot: string;
  rules: string;
  objective: string;
  episodeLength: EpisodeLength;
}