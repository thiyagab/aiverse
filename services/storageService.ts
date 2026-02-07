import { Plot, Character, Episode } from '../types';

const STORAGE_KEY = 'storyverse_plots';
const USER_ID_KEY = 'storyverse_user_id';

// Generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get or create a session user ID
export const getUserId = (): string => {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
};

// Normalize legacy plots (theme/tone → plot/writingStyle)
const normalizePlot = (p: any): Plot => {
  if (!p) return p;
  const plot = { ...p };
  if (plot.theme !== undefined && plot.plot === undefined) plot.plot = plot.theme;
  if (plot.tone !== undefined && plot.writingStyle === undefined) plot.writingStyle = 'Plain English';
  return plot as Plot;
};

// Fetch all plots
export const getPlots = (): Plot[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const raw = data ? JSON.parse(data) : [];
  return Array.isArray(raw) ? raw.map(normalizePlot) : [];
};

// Get single plot
export const getPlot = (id: string): Plot | undefined => {
  const plots = getPlots(); // already normalized
  return plots.find(p => p.id === id);
};

// Save a new plot
export const savePlot = (plot: Plot): void => {
  const plots = getPlots();
  plots.unshift(plot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
};

// Update an existing plot
export const updatePlot = (updatedPlot: Plot): void => {
  const plots = getPlots();
  const index = plots.findIndex(p => p.id === updatedPlot.id);
  if (index !== -1) {
    plots[index] = updatedPlot;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  }
};

// Add a character to a plot
export const addCharacterToPlot = (plotId: string, character: Character): Plot | null => {
  const plots = getPlots();
  const index = plots.findIndex(p => p.id === plotId);
  if (index === -1) return null;

  const plot = plots[index];
  if (plot.characters.length >= 10) {
    throw new Error("Max characters reached (10)");
  }

  character.id = generateId();
  character.joinedAtEpisode = plot.episodes.length + 1;
  plot.characters.push(character);
  
  plots[index] = plot;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  return plot;
};

// Add an episode to a plot
export const addEpisodeToPlot = (plotId: string, episode: Episode, newMemory: string): Plot | null => {
  const plots = getPlots();
  const index = plots.findIndex(p => p.id === plotId);
  if (index === -1) return null;

  const plot = plots[index];
  plot.episodes.push(episode);
  plot.storyMemory = newMemory;

  plots[index] = plot;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  return plot;
};
