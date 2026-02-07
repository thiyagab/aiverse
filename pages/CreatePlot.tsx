import React, { useState } from 'react';
import { PlotDraft, Character, Genre, WritingStyle, EpisodeLength, RoleArchetype } from '../types';
import { generateDefaultCharacters, generateNextEpisode, generatePlotDetails, refinePlot } from '../services/apiClient';
import { savePlot, getUserId } from '../services/storageService';
import { Button, Input, TextArea, Select, Card, Badge } from '../components/UI';
import { Loader2, Wand2, Trash2, Save, ArrowLeft, ArrowRight, Plus, Sparkles, Zap } from 'lucide-react';

interface CreatePlotProps {
  onNavigate: (route: string, params?: any) => void;
}

const GENRES: Genre[] = [
  'Action', 'Adventure', 'Alternate History', 'Anthology', 'Coming of Age', 'Comedy', 
  'Cozy Mystery', 'Crime / Detective', 'Cyberpunk', 'Dark Comedy', 'Drama', 'Dystopian', 
  'Epic', 'Experimental / Avant-Garde', 'Fantasy', 'Folklore', 'Found Footage (Text Style)', 
  'Gothic', 'Heist', 'Historical Fiction', 'Horror', 'Interactive Fiction', 'Legal Drama', 
  'Legends & Sagas', 'Magical Realism', 'Mystery', 'Mythology', 'Noir', 'Paranormal', 
  'Political Drama', 'Post-Apocalyptic', 'Psychological Thriller', 'Romance', 'Satire', 
  'Science Fiction (Sci-Fi)', 'Slice of Life', 'Spy / Espionage', 'Steampunk', 'Superhero', 
  'Survival', 'Techno-Thriller', 'Thriller', 'Time Travel', 'Urban Fantasy', 'War / Military', 
  'Western', 'Other'
];

const WRITING_STYLES: WritingStyle[] = ['Novel', 'Plain English', 'Casual', 'Literary', 'South Indian English', 'North Indian English'];
const LENGTHS: EpisodeLength[] = [300, 600, 900, 1000, 1200];
const ROLES: RoleArchetype[] = ['Hero', 'Villain', 'Mentor', 'Sidekick', 'Rival', 'Antihero', 'Trickster', 'Narrator'];

export default function CreatePlot({ onNavigate }: CreatePlotProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // New input method
  const [conceptInput, setConceptInput] = useState('');
  
  const [draft, setDraft] = useState<PlotDraft>({
    title: '',
    genre: '', 
    writingStyle: '',
    setting: '',
    plot: '',
    rules: '',
    objective: '',
    episodeLength: 1000
  });
  const [refiningPlot, setRefiningPlot] = useState(false);

  const [characters, setCharacters] = useState<Partial<Character>[]>([]);

  // --- Handlers ---

  const handleDraftChange = (field: keyof PlotDraft, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleImprovise = async () => {
    // Use either the text concept input OR the genre dropdown if text is empty
    const inputToUse = conceptInput.trim() || draft.genre;
    
    if (!inputToUse) {
        alert("Please enter a concept or select a genre!");
        return;
    }

    setLoading(true);
    setLoadingText('Dreaming up a universe...');
    
    try {
        const generatedDetails = await generatePlotDetails(inputToUse);
        setDraft(prev => ({
            ...prev,
            ...generatedDetails,
            writingStyle: generatedDetails.writingStyle?.trim() || 'Plain English'
        }));
    } catch (e) {
        alert("Failed to improvise details.");
    } finally {
        setLoading(false);
    }
  };

  const handleRefinePlot = async () => {
    const source = draft.plot?.trim() || conceptInput.trim();
    if (!source) {
      alert("Enter a plot above or type a concept in 'Start with an Idea' first.");
      return;
    }
    setRefiningPlot(true);
    try {
      const refined = await refinePlot(source);
      handleDraftChange('plot', refined);
    } catch (e) {
      alert("Failed to refine plot.");
    } finally {
      setRefiningPlot(false);
    }
  };

  const generateCharacters = async () => {
    setLoading(true);
    setLoadingText('Summoning characters...');
    try {
      const generated = await generateDefaultCharacters(draft);
      setCharacters(generated);
      setStep(2);
    } catch (e) {
      alert("Failed to generate characters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCharChange = (index: number, field: keyof Character, value: any) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const addCharacter = () => {
    if (characters.length >= 5) return;
    setCharacters([...characters, {
      name: 'New Character',
      role: 'Sidekick',
      traits: [],
      speakingStyle: '',
      motivation: '',
      characterization: '',
      submittedBy: 'Director',
      isDefault: false
    }]);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const publishPlot = async () => {
    setLoading(true);
    setLoadingText('Writing Episode 1...');
    
    try {
      const plotId = Math.random().toString(36).substr(2, 9);
      const timestamp = Date.now();
      
      const fullCharacters: Character[] = characters.map((c, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.name || 'Unknown',
        role: c.role as RoleArchetype,
        traits: c.traits || [],
        speakingStyle: c.speakingStyle || '',
        motivation: c.motivation || '',
        secret: c.secret || '',
        relationships: c.relationships || '',
        characterization: c.characterization || '',
        submittedBy: c.submittedBy || 'Director',
        isDefault: c.isDefault || false,
        joinedAtEpisode: 1
      }));

      const newPlot: any = {
        id: plotId,
        ...draft,
        characters: fullCharacters,
        episodes: [],
        storyMemory: '',
        createdAt: timestamp,
        directorId: getUserId()
      };

      // Generate Ep 1
      const ep1Data = await generateNextEpisode(newPlot);
      
      newPlot.episodes.push({
        id: Math.random().toString(36).substr(2, 9),
        plotId,
        episodeNumber: 1,
        title: ep1Data.title,
        content: ep1Data.text,
        summary: ep1Data.summary,
        charactersUsed: ep1Data.charactersUsed,
        createdAt: Date.now()
      });
      newPlot.storyMemory = ep1Data.memory;

      savePlot(newPlot);
      onNavigate('detail', { id: plotId });

    } catch (e) {
      console.error(e);
      alert("Failed to create plot.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-story-accent mb-4" size={48} />
        <h2 className="text-2xl font-bold">{loadingText}</h2>
        <p className="text-gray-400 mt-2">Consulting the AI muses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => step === 1 ? onNavigate('home') : setStep(1)}>
          <ArrowLeft size={18} /> Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Plot <span className="text-gray-500 text-base font-normal ml-2">Step {step}/2</span></h1>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* AI Improvise Section */}
          <Card className="col-span-1 md:col-span-2 border-story-accent/50 bg-gradient-to-br from-story-800 to-story-900">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-story-accent" size={20} /> 
                Start with an Idea
            </h2>
            <p className="text-gray-400 text-sm mb-4">
                Describe a rough concept, or just pick a genre. The AI will build the world for you.
            </p>
            
            <div className="space-y-4">
                <TextArea 
                    placeholder="e.g. A noir detective story set on a Mars colony where it never stops raining red dust..." 
                    value={conceptInput} 
                    onChange={(e:any) => setConceptInput(e.target.value)}
                    rows={3}
                />
                
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1">
                        <Select 
                            options={['Select a Genre (Optional)...', ...GENRES]} 
                            value={draft.genre} 
                            onChange={(e:any) => handleDraftChange('genre', e.target.value)} 
                            className="mb-0"
                        />
                    </div>
                </div>

                <Button 
                    onClick={handleImprovise} 
                    disabled={!conceptInput && !draft.genre}
                    className="w-full bg-gradient-to-r from-purple-600 to-story-accent border border-white/10"
                >
                    <Zap size={18} className="mr-2 fill-current" /> Improvise Plot Details
                </Button>
            </div>
          </Card>

          {/* Form Fields - Populated by AI */}
          <Card className="col-span-1 md:col-span-2">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-200">Plot Details</h2>
                 {draft.title && <Badge color="green">AI Generated</Badge>}
             </div>
             
             <datalist id="genre-options">{GENRES.map(g => <option key={g} value={g} />)}</datalist>
             <datalist id="writing-style-options">{WRITING_STYLES.map(s => <option key={s} value={s} />)}</datalist>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Title" placeholder="Story Title" value={draft.title} onChange={(e:any) => handleDraftChange('title', e.target.value)} />
                <Input label="Genre" placeholder="Select or type your own..." list="genre-options" value={draft.genre} onChange={(e:any) => handleDraftChange('genre', e.target.value)} />
                
                <Input label="Setting" placeholder="Time & Place" value={draft.setting} onChange={(e:any) => handleDraftChange('setting', e.target.value)} />
                <Input label="Writing style" placeholder="Select or type your own..." list="writing-style-options" value={draft.writingStyle} onChange={(e:any) => handleDraftChange('writingStyle', e.target.value)} />
                
                <div className="col-span-1 md:col-span-2 w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Plot</label>
                    <p className="text-xs text-gray-500 mb-2">Refine your raw idea here—AI can fill this from above, or type your own.</p>
                    <div className="w-full">
                        <TextArea
                            placeholder="e.g. A detective on a Mars colony must solve a murder before the next dust storm..."
                            value={draft.plot}
                            onChange={(e: any) => handleDraftChange('plot', e.target.value)}
                            rows={4}
                            className="w-full min-h-[100px]"
                        />
                        <div className="mt-2 flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleRefinePlot}
                                disabled={refiningPlot || (!draft.plot?.trim() && !conceptInput.trim())}
                                title="Refine with AI"
                            >
                                {refiningPlot ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Refine with AI
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                    <Select label="Episode Length" options={LENGTHS} value={draft.episodeLength} onChange={(e:any) => handleDraftChange('episodeLength', parseInt(e.target.value))} />
                </div>
             </div>
            
            <div className="flex justify-end mt-6">
                <Button onClick={generateCharacters} disabled={!draft.title}>
                    Next: Generate Characters <ArrowRight size={18} />
                </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Cast of Characters</h2>
                    <p className="text-gray-400 text-sm">Review the AI generated cast or add your own.</p>
                </div>
                <Button variant="secondary" onClick={addCharacter} disabled={characters.length >= 5}>
                    <Plus size={16} /> Add Character
                </Button>
            </div>

            <div className="space-y-6">
                {characters.map((char, idx) => (
                    <Card key={idx} className="relative group">
                        <div className="absolute top-4 right-4">
                            <button onClick={() => removeCharacter(idx)} className="text-gray-500 hover:text-red-400 p-1">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Name" value={char.name} onChange={(e:any) => handleCharChange(idx, 'name', e.target.value)} />
                            <Select label="Archetype" options={ROLES} value={char.role} onChange={(e:any) => handleCharChange(idx, 'role', e.target.value)} />
                            <div className="col-span-1 md:col-span-2">
                                <Input label="Traits (comma separated)" value={Array.isArray(char.traits) ? char.traits.join(', ') : char.traits} onChange={(e:any) => handleCharChange(idx, 'traits', e.target.value.split(',').map((s:string) => s.trim()))} />
                            </div>
                            <TextArea label="Motivation" value={char.motivation} onChange={(e:any) => handleCharChange(idx, 'motivation', e.target.value)} />
                            <TextArea label="Characterization (Prompt)" value={char.characterization} onChange={(e:any) => handleCharChange(idx, 'characterization', e.target.value)} />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={publishPlot}>
                    <Save size={18} /> Publish & Start Story
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}