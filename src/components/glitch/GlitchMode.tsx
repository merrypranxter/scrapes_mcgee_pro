import React, { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
  Upload,
  Play,
  Download,
  Trash2,
  Loader2,
  Zap,
  Settings,
  Plus,
  X,
  ChevronRight,
  GripVertical,
  ArrowDown,
  Check,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '../../lib/utils';

interface VideoFile {
  id: string;
  file: File;
  url: string;
  duration: number;
  thumbnail?: string;
  trimStart: number;
  trimEnd: number;
}

interface Transition {
  id: string;
  fromVideoId: string;
  toVideoId: string;
  mode: 'iframe' | 'pixelblend';
  intensity: number;
  delta: number;
  gop: number;
  quality: 'low' | 'med' | 'high';
  overlapFrames: number;
}

type ExportMode = 'final' | 'all_stages';

export default function GlitchMode() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<ExportMode>('final');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load FFmpeg on mount
  React.useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    setLoading(true);
    const ffmpegInstance = new FFmpeg();
    
    ffmpegInstance.on('log', ({ message }) => {
      console.log(message);
    });
    
    ffmpegInstance.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpeg(ffmpegInstance);
    } catch (error) {
      console.error('FFmpeg load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      if (!file.type.startsWith('video/')) continue;
      
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const newVideo: VideoFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            url,
            duration: video.duration,
            trimStart: 0,
            trimEnd: video.duration,
          };
          
          setVideos(prev => {
            const updated = [...prev, newVideo];
            // Auto-create transitions when adding videos
            if (updated.length > 1) {
              createTransitionsForVideos(updated);
            }
            return updated;
          });
          resolve(null);
        };
      });
    }
  };

  const createTransitionsForVideos = (videoList: VideoFile[]) => {
    const newTransitions: Transition[] = [];
    for (let i = 0; i < videoList.length - 1; i++) {
      const existing = transitions.find(
        t => t.fromVideoId === videoList[i].id && t.toVideoId === videoList[i + 1].id
      );
      
      if (!existing) {
        newTransitions.push({
          id: Math.random().toString(36).substr(2, 9),
          fromVideoId: videoList[i].id,
          toVideoId: videoList[i + 1].id,
          mode: 'iframe',
          intensity: 70,
          delta: 5,
          gop: 12,
          quality: 'med',
          overlapFrames: 15,
        });
      }
    }
    
    if (newTransitions.length > 0) {
      setTransitions(prev => [...prev, ...newTransitions]);
    }
  };

  const updateTransition = (id: string, updates: Partial<Transition>) => {
    setTransitions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => {
      const updated = prev.filter(v => v.id !== id);
      // Rebuild transitions after deleting
      setTransitions([]);
      if (updated.length > 1) {
        createTransitionsForVideos(updated);
      }
      return updated;
    });
  };

  const processCascade = async () => {
    if (!ffmpeg || videos.length === 0) return;
    
    setProcessing(true);
    setProgress(0);
    const outputFiles: { name: string; data: Uint8Array }[] = [];

    try {
      // Write all input videos to FFmpeg
      for (let i = 0; i < videos.length; i++) {
        setProcessingStage(`Loading video ${i + 1}/${videos.length}...`);
        await ffmpeg.writeFile(`input_${i}.mp4`, await fetchFile(videos[i].file));
      }

      let currentOutput = 'input_0.mp4';
      
      // Process each transition
      for (let i = 0; i < transitions.length; i++) {
        const transition = transitions[i];
        const fromIdx = videos.findIndex(v => v.id === transition.fromVideoId);
        const toIdx = videos.findIndex(v => v.id === transition.toVideoId);
        
        setProcessingStage(`Datamoshing ${fromIdx + 1}→${toIdx + 1}...`);
        
        const nextInput = `input_${toIdx}.mp4`;
        const outputName = `cascade_${i}.mp4`;
        
        if (transition.mode === 'iframe') {
          // I-frame replacement datamosh
          const qualityMap = { low: '100k', med: '500k', high: '2M' };
          
          // Extract last frames from current output
          const lastFramesOutput = `last_frames_${i}.mp4`;
          await ffmpeg.exec([
            '-i', currentOutput,
            '-vf', `select='gte(n\\,${transition.overlapFrames})'`,
            '-vsync', '0',
            '-c:v', 'libx264',
            '-g', transition.gop.toString(),
            '-b:v', qualityMap[transition.quality],
            lastFramesOutput
          ]);
          
          // Extract frames from next input without I-frames
          const noIframesOutput = `no_iframes_${i}.mp4`;
          await ffmpeg.exec([
            '-i', nextInput,
            '-vf', `select='not(mod(n\\,${transition.delta}))'`,
            '-vsync', '0',
            '-c:v', 'libx264',
            '-g', '999', // Huge GOP to minimize I-frames
            '-b:v', qualityMap[transition.quality],
            noIframesOutput
          ]);
          
          // Concatenate
          const concatList = `file '${lastFramesOutput}'\nfile '${noIframesOutput}'`;
          await ffmpeg.writeFile(`concat_${i}.txt`, concatList);
          
          await ffmpeg.exec([
            '-f', 'concat',
            '-safe', '0',
            '-i', `concat_${i}.txt`,
            '-c', 'copy',
            outputName
          ]);
          
        } else {
          // Pixel blend mode
          const qualityMap = { low: '100k', med: '500k', high: '2M' };
          const blendDuration = transition.overlapFrames / 25; // Assuming 25fps
          
          await ffmpeg.exec([
            '-i', currentOutput,
            '-i', nextInput,
            '-filter_complex',
            `[0:v][1:v]xfade=transition=fade:duration=${blendDuration}:offset=0[v]`,
            '-map', '[v]',
            '-c:v', 'libx264',
            '-g', transition.gop.toString(),
            '-b:v', qualityMap[transition.quality],
            outputName
          ]);
        }
        
        // Save stage if export mode is all_stages
        if (exportMode === 'all_stages') {
          const stageData = await ffmpeg.readFile(outputName);
          outputFiles.push({
            name: `stage_${i + 1}_${videos[fromIdx].file.name}_into_${videos[toIdx].file.name}.mp4`,
            data: stageData as Uint8Array
          });
        }
        
        currentOutput = outputName;
      }
      
      // Read final output
      setProcessingStage('Finalizing...');
      const finalData = await ffmpeg.readFile(currentOutput);
      outputFiles.push({
        name: `datamosh_cascade_final_${Date.now()}.mp4`,
        data: finalData as Uint8Array
      });
      
      // Download all files
      for (const output of outputFiles) {
        const blob = new Blob([output.data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = output.name;
        a.click();
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing cascade. Check console for details.');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00ff88] via-[#00ddff] to-[#ff00ff] bg-clip-text text-transparent mb-2">
            DATAMOSH CASCADE
          </h1>
          <p className="text-zinc-400">Chain unlimited videos with no bullshit limitations</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 p-12 bg-[#18181b] border border-zinc-800 rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#00ff88]" />
            <span className="text-zinc-400">Loading FFmpeg engine...</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Video Queue */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-[#00ff88] mb-4 flex items-center gap-2">
                  <Upload size={16} />
                  CASCADE CHAIN
                </h2>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-700 hover:border-[#00ff88] rounded-xl p-6 transition-colors cursor-pointer group mb-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6 text-zinc-600 group-hover:text-[#00ff88] transition-colors" />
                    <span className="text-xs text-zinc-500 group-hover:text-[#00ff88] transition-colors">
                      Add Videos
                    </span>
                  </div>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Video Queue */}
                <div className="space-y-2">
                  <Reorder.Group axis="y" values={videos} onReorder={setVideos}>
                    {videos.map((video, idx) => (
                      <Reorder.Item key={video.id} value={video}>
                        <div className="mb-3">
                          {/* Video Card */}
                          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                            <div className="flex items-center gap-3">
                              <GripVertical size={16} className="text-zinc-600 cursor-grab active:cursor-grabbing" />
                              <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-[#00ff88]">{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{video.file.name}</p>
                                <p className="text-[10px] text-zinc-500">{video.duration.toFixed(1)}s</p>
                              </div>
                              <button
                                onClick={() => deleteVideo(video.id)}
                                className="p-1 hover:bg-zinc-800 rounded"
                              >
                                <Trash2 size={12} className="text-zinc-500" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Transition Arrow */}
                          {idx < videos.length - 1 && (
                            <div className="flex justify-center my-1">
                              <ArrowDown size={16} className="text-[#00ddff]" />
                            </div>
                          )}
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                  
                  {videos.length === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-8">
                      Upload videos to start chaining
                    </p>
                  )}
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-zinc-400 mb-3">EXPORT</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setExportMode('final')}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between",
                      exportMode === 'final'
                        ? "bg-[#00ff88] text-black"
                        : "bg-zinc-900 text-zinc-400"
                    )}
                  >
                    <span>Final Only</span>
                    {exportMode === 'final' && <Check size={12} />}
                  </button>
                  <button
                    onClick={() => setExportMode('all_stages')}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between",
                      exportMode === 'all_stages'
                        ? "bg-[#00ff88] text-black"
                        : "bg-zinc-900 text-zinc-400"
                    )}
                  >
                    <span>All Stages</span>
                    {exportMode === 'all_stages' && <Check size={12} />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 mt-2">
                  {exportMode === 'final' 
                    ? 'Download only the final cascade result'
                    : 'Download each stage: A, A→B, A→B→C, etc.'}
                </p>
              </div>
            </div>

            {/* Right: Transition Settings */}
            <div className="lg:col-span-2 space-y-4">
              {transitions.length > 0 ? (
                <>
                  <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4">
                    <h2 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                      <Link2 size={16} />
                      TRANSITIONS ({transitions.length})
                    </h2>
                    
                    <div className="space-y-3">
                      {transitions.map((transition, idx) => {
                        const fromVideo = videos.find(v => v.id === transition.fromVideoId);
                        const toVideo = videos.find(v => v.id === transition.toVideoId);
                        const isSelected = selectedTransition === transition.id;
                        
                        return (
                          <div key={transition.id} className="space-y-3">
                            {/* Transition Header */}
                            <button
                              onClick={() => setSelectedTransition(isSelected ? null : transition.id)}
                              className={cn(
                                "w-full p-3 rounded-lg border transition-all text-left",
                                isSelected
                                  ? "bg-[#00ddff]/10 border-[#00ddff]"
                                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                    <ChevronRight size={14} className="text-[#00ddff]" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">
                                      Transition {idx + 1}
                                    </p>
                                    <p className="text-[10px] text-zinc-500">
                                      {fromVideo?.file.name.slice(0, 15)} → {toVideo?.file.name.slice(0, 15)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {transition.mode === 'iframe' ? 'I-Frame Strip' : 'Pixel Blend'}
                                </div>
                              </div>
                            </button>

                            {/* Transition Settings */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-zinc-900 rounded-lg p-4 space-y-4"
                                >
                                  {/* Mode */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">Mode</label>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateTransition(transition.id, { mode: 'iframe' })}
                                        className={cn(
                                          "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                                          transition.mode === 'iframe'
                                            ? "bg-[#00ff88] text-black"
                                            : "bg-zinc-800 text-zinc-400"
                                        )}
                                      >
                                        I-Frame Strip
                                      </button>
                                      <button
                                        onClick={() => updateTransition(transition.id, { mode: 'pixelblend' })}
                                        className={cn(
                                          "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                                          transition.mode === 'pixelblend'
                                            ? "bg-[#ff00ff] text-black"
                                            : "bg-zinc-800 text-zinc-400"
                                        )}
                                      >
                                        Pixel Blend
                                      </button>
                                    </div>
                                  </div>

                                  {/* Intensity */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">
                                      Intensity: {transition.intensity}%
                                    </label>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={transition.intensity}
                                      onChange={(e) => updateTransition(transition.id, { intensity: parseInt(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>

                                  {/* Delta */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">
                                      Delta: {transition.delta} frames
                                    </label>
                                    <input
                                      type="range"
                                      min={1}
                                      max={30}
                                      value={transition.delta}
                                      onChange={(e) => updateTransition(transition.id, { delta: parseInt(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>

                                  {/* GOP */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">
                                      GOP Size: {transition.gop} frames
                                    </label>
                                    <input
                                      type="range"
                                      min={5}
                                      max={60}
                                      value={transition.gop}
                                      onChange={(e) => updateTransition(transition.id, { gop: parseInt(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>

                                  {/* Quality */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">Quality</label>
                                    <div className="flex gap-2">
                                      {(['low', 'med', 'high'] as const).map((q) => (
                                        <button
                                          key={q}
                                          onClick={() => updateTransition(transition.id, { quality: q })}
                                          className={cn(
                                            "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                                            transition.quality === q
                                              ? "bg-[#00ddff] text-black"
                                              : "bg-zinc-800 text-zinc-400"
                                          )}
                                        >
                                          {q.toUpperCase()}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Overlap Frames */}
                                  <div>
                                    <label className="text-xs text-zinc-500 mb-2 block">
                                      Overlap: {transition.overlapFrames} frames
                                    </label>
                                    <input
                                      type="range"
                                      min={5}
                                      max={60}
                                      value={transition.overlapFrames}
                                      onChange={(e) => updateTransition(transition.id, { overlapFrames: parseInt(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={processCascade}
                    disabled={processing}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-lg transition-all",
                      processing
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#00ff88] to-[#ff00ff] text-black hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {processing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {processingStage}
                        </div>
                        <div className="text-sm">Progress: {progress}%</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Download size={20} />
                        PROCESS CASCADE
                      </div>
                    )}
                  </button>
                </>
              ) : (
                <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-12 text-center">
                  <Upload className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 mb-2">Upload 2+ videos to create a cascade</p>
                  <p className="text-xs text-zinc-600">Drag to reorder • Click transitions to customize</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
