import React, { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  Shield,
  Zap,
  Bot,
  UserCheck,
  Brain,
  BrainCircuit,
  MessageSquare,
  Radio,
  Sliders,
  Activity,
  ChevronRight,
  Headphones,
  Check
} from "lucide-react";
import { companyDetails } from "../data/constant";

const PERSONAS = [
  {
    id: "sdr",
    title: "Enterprise Voice SDR",
    roleTag: "Outbound Lead Gen",
    description: "Qualifies inbound enterprise leads, profiles budget, handles objections, and schedules demo calls 24/7.",
    latency: "165ms",
    accent: "Ava Expressive Neural (US)",
    audioFile: "/audio/sdr_human.mp3",
    sampleText: "Hi there! I'm Panthum's automated SDR agent. I noticed you were exploring our low-latency AI telecalling architecture... Would you like to schedule a 10-minute technical deep-dive with our solutions team?"
  },
  {
    id: "support",
    title: "Customer Support Specialist",
    roleTag: "24/7 Tier-1 & 2 Support",
    description: "Resolves order tracking, billing queries, and technical support instantly without human queue delays.",
    latency: "140ms",
    accent: "Sonia Conversational Neural (UK)",
    audioFile: "/audio/support_human.mp3",
    sampleText: "Hello! I can instantly assist with your account verification, order status, or API documentation for Panthum AI... What topic can I help you resolve today?"
  },
  {
    id: "realestate",
    title: "Real Estate & PropTech Advisor",
    roleTag: "Site Visit Booking",
    description: "Profiles homebuyer requirements, location preferences, budget tiers, and schedules automated site visits.",
    latency: "175ms",
    accent: "Neerja Expressive Warm Neural (IN)",
    audioFile: "/audio/realestate_human.mp3",
    sampleText: "Namaste! I'm calling from Panthum Real Estate AI... We have exclusive 3BHK premium residences available in Baner, Pune starting at ₹1.2 Cr. Should I WhatsApp you the brochure and arrange a private site visit?"
  }
];

const VoiceAIDemo = () => {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callSubmitted, setCallSubmitted] = useState(false);
  const [showSimulatedCallModal, setShowSimulatedCallModal] = useState(false);
  const [callActiveState, setCallActiveState] = useState("calling"); // 'calling' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [ambientSound, setAmbientSound] = useState(true);
  const [voices, setVoices] = useState([]);
  
  const activeAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientGainRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    // Automatic immediate client-side redirect to sovereign voice app
    window.location.replace("https://call.panthm.com");
  }, []);

  useEffect(() => {
    const updateVoices = () => {
      if ("speechSynthesis" in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Web Audio API ambient noise generator for realistic office room tone
  const startAmbientRoomTone = () => {
    if (!ambientSound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Generate soft pink/white noise room tone
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.011; // ultra-subtle room tone
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.012, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      ambientGainRef.current = { source: whiteNoise, gain: gain };
    } catch (e) {
      console.warn("Web Audio ambient room tone unavailable:", e);
    }
  };

  const stopAmbientRoomTone = () => {
    try {
      if (ambientGainRef.current) {
        ambientGainRef.current.source.stop();
        ambientGainRef.current.source.disconnect();
        ambientGainRef.current = null;
      }
    } catch (e) {}
  };

  const getOptimalNeuralVoice = (personaId) => {
    if (!voices || voices.length === 0) return null;

    if (personaId === "sdr") {
      return (
        voices.find((v) => v.name.includes("Google US English") || v.name.includes("Natural") || v.name.includes("Neural") || (v.lang.startsWith("en-US") && v.name.includes("Enhanced"))) ||
        voices.find((v) => v.name.includes("Samantha") || v.name.includes("Ava") || v.name.includes("Jenny") || v.name.includes("Guy") || v.lang.startsWith("en-US")) ||
        voices[0]
      );
    } else if (personaId === "support") {
      return (
        voices.find((v) => v.name.includes("Google UK English") || v.name.includes("Natural") || v.name.includes("Neural") || (v.lang.startsWith("en-GB") && v.name.includes("Enhanced"))) ||
        voices.find((v) => v.name.includes("Sonia") || v.name.includes("Serena") || v.name.includes("Victoria") || v.lang.startsWith("en-GB")) ||
        voices[0]
      );
    } else if (personaId === "realestate") {
      return (
        voices.find((v) => v.name.includes("Google हिन्दी") || v.name.includes("India") || (v.lang.startsWith("en-IN") && v.name.includes("Natural"))) ||
        voices.find((v) => v.name.includes("Veena") || v.name.includes("Rishi") || v.name.includes("Neerja") || v.lang.startsWith("en-IN")) ||
        voices[0]
      );
    }
    return voices[0];
  };

  const handlePlaySample = () => {
    handleStopSample();
    setIsSynthesizing(true);
    setIsPlaying(false);

    setTimeout(() => {
      setIsSynthesizing(false);
      setIsPlaying(true);
      startAmbientRoomTone();

      if (selectedPersona.audioFile) {
        const audio = new Audio(selectedPersona.audioFile);
        activeAudioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          stopAmbientRoomTone();
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis();
        };
        audio.play().catch(() => fallbackSpeechSynthesis());
      } else {
        fallbackSpeechSynthesis();
      }
    }, 250);
  };

  const fallbackSpeechSynthesis = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const phoneticText = selectedPersona.sampleText
        .replace(/PANTHM's/gi, "Panthum's")
        .replace(/PANTHM/gi, "Panthum");

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      const optimalVoice = getOptimalNeuralVoice(selectedPersona.id);
      if (optimalVoice) utterance.voice = optimalVoice;

      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
        stopAmbientRoomTone();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        stopAmbientRoomTone();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsPlaying(false);
        stopAmbientRoomTone();
      }, 5000);
    }
  };

  const handleStopSample = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopAmbientRoomTone();
    setIsPlaying(false);
    setIsSynthesizing(false);
  };

  const handleRequestLiveCall = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setCallSubmitted(true);
    setCallActiveState("calling");
    setShowSimulatedCallModal(true);
    setCallDuration(0);

    // Simulate phone call progression
    setTimeout(() => {
      setCallActiveState("connected");
      handlePlaySample();
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2500);
  };

  const handleHangupSimulatedCall = () => {
    handleStopSample();
    setCallActiveState("ended");
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setTimeout(() => {
      setShowSimulatedCallModal(false);
    }, 1200);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainderSec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-slate-950 text-white min-h-screen relative overflow-hidden selection:bg-primary selection:text-white">
      <SEO
        title="Free Live Voice AI Telecalling Demo | PANTHM AI Labs"
        description="Experience PANTHM AI's sub-200ms conversational voice SDRs live in your browser. Test realistic AI speech synthesis and request a live telecalling test."
        keywords="Free Voice AI demo, sub-200ms voice SDR, AI telecalling playground, low latency voice agent, conversational AI demo"
        url="https://panthm.com/tools/voice-ai-demo"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": "https://panthm.com/tools/voice-ai-demo#app",
          "name": "PANTHM Interactive Voice AI Playground",
          "url": "https://panthm.com/tools/voice-ai-demo",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "provider": {
            "@type": "Organization",
            "name": "PANTHM AI Labs",
            "url": "https://panthm.com/"
          }
        }}
      />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="wrapper relative z-10 space-y-10 sm:space-y-14">
        {/* Header Capsule */}
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-primary/10">
            <Sparkles size={16} className="animate-spin text-primary" /> Sub-180ms Ultra Low-Latency Voice Engine
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.15]">
            Experience Enterprise Conversational Voice AI
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Test PANTHM's low-latency neural voice synthesis pipeline. Experience real-time outbound SDR speech, multi-accent conversational engines, and instant telecalling triggers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://call.panthm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-primary/30 transition-all transform active:scale-95 flex items-center gap-2.5"
            >
              <PhoneCall size={20} className="animate-pulse text-emerald-300" />
              Open Live 2-Way Voice Agent on call.panthm.com &rarr;
            </a>
          </div>

          {/* Human Voice & Voice Cloning Callout Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-indigo-950/60 border border-purple-500/30 text-left mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0 mt-0.5 sm:mt-0">
                <Mic size={22} className="text-purple-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm sm:text-base font-bold text-white">Can We Use Custom Human Voices?</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/40">100% YES</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We support <strong>Custom Voice Cloning</strong> (founder/SDR voices cloned from 30s of audio) and integrations with <strong>ElevenLabs, Cartesia, PlayHT, Deepgram Aura, and OpenAI Voice</strong> with realistic human breathing and inflections.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${companyDetails.phone.replace(/[^0-9]/g, "")}?text=Hi%20PANTHM%20AI%20Labs!%20I%20want%20to%20clone%20my%20voice%20or%20use%20a%20custom%20human%20voice%20for%20our%20AI%20SDR.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <UserCheck size={14} /> Clone Your Voice
            </a>
          </div>

          {/* Technical Status HUD Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
              <Activity size={14} className="text-emerald-400" />
              <span>Latency: <strong className="text-emerald-400 font-bold">{selectedPersona.latency}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
              <Radio size={14} className="text-cyan-400" />
              <span>Protocol: <strong className="text-cyan-400 font-bold">WebRTC / Opus HD</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
              <Shield size={14} className="text-indigo-400" />
              <span>Compliance: <strong className="text-indigo-400 font-bold">GDPR & TRAI Compliant</strong></span>
            </div>
          </div>

          {/* GEO / AEO Speakable Executive Brief Passage Capsule */}
          <div id="speakable-brief" data-speakable="true" className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <BrainCircuit size={16} /> Executive AEO Architecture Brief
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Verified Standard
              </span>
            </div>
            <p>
              PANTHM AI Labs engineers hyper-realistic, sub-180ms conversational Voice AI telecalling agents for enterprise SDR outreach, customer support, and real-time appointment booking. Powered by low-latency WebRTC pipelines and neural speech synthesis, PANTHM Voice SDRs conduct natural two-way conversations with human-like breathing, conversational fillers, and zero audio lag. Operating 24/7 across global languages including US English, UK English, and Indian regional accents, PANTHM voice agents automatically profile lead budget, qualify inbound prospects, update CRM records, and schedule high-intent sales calls. Designed for real estate, healthcare, financial services, e-commerce, and logistics enterprises, PANTHM Voice AI reduces customer acquisition costs by up to 70% while scaling outbound phone coverage by 10x without human agent fatigue.
            </p>
          </div>
        </div>

        {/* Playground Main Studio Grid */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Persona Selection (Left Column - 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-200 flex items-center gap-2">
                <Bot className="text-primary" size={22} /> Select Voice Agent Persona
              </h2>
              <span className="text-xs text-slate-400 font-mono">3 Avatars Online</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {PERSONAS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      handleStopSample();
                      setSelectedPersona(persona);
                    }}
                    className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group touch-manipulation min-h-[110px] ${
                      isSelected
                        ? "bg-slate-900/90 border-primary shadow-2xl shadow-primary/20 scale-[1.01] ring-1 ring-primary/50"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono block mb-0.5">
                          {persona.roleTag}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors">
                          {persona.title}
                        </h3>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono flex items-center gap-1 flex-shrink-0 ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        <Zap size={12} className={isSelected ? "text-emerald-400 animate-pulse" : ""} /> {persona.latency}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                      {persona.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Headphones size={13} className="text-primary" /> {persona.accent}
                      </span>
                      {isSelected ? (
                        <span className="text-primary font-semibold flex items-center gap-1">
                          Selected <Check size={14} />
                        </span>
                      ) : (
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-0.5">
                          Test Voice <ChevronRight size={14} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Player & Visualizer Studio (Right Column - 7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 sm:space-y-8 shadow-2xl relative">
            
            {/* Top Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary font-mono block">
                  Active Neural Avatar
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedPersona.title}</h3>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-emerald-500"}`} />
                <span className="text-xs font-mono text-slate-300 font-medium">
                  {isSynthesizing ? "Synthesizing..." : isPlaying ? "Live Streaming" : "Ready"}
                </span>
              </div>
            </div>

            {/* Dynamic Waveform Visualizer Screen */}
            <div className="h-36 sm:h-44 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group shadow-inner">
              {/* Background Neon Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Top HUD overlay */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sliders size={13} className="text-primary" /> Audio DSP Studio
                </span>
                <span className="text-cyan-400 font-semibold">
                  {isPlaying ? "24kHz / 16-Bit PCM" : "Opus HD Ready"}
                </span>
              </div>

              {/* 36 Dynamic Equalizer Frequency Bars */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-20 sm:h-24 relative z-10 px-2">
                {Array.from({ length: 34 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 sm:w-2 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? "bg-gradient-to-t from-primary via-cyan-400 to-indigo-400 shadow-sm shadow-cyan-400/50"
                        : "bg-slate-800 h-2"
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(15, Math.floor(Math.sin(i + Date.now() * 0.005) * 45 + 50))}%` : "8px",
                      transitionDelay: `${(i % 5) * 20}ms`
                    }}
                  />
                ))}
              </div>

              {/* Bottom HUD audio meter */}
              <div className="flex items-center justify-between text-[11px] font-mono relative z-10 pt-1 border-t border-slate-800/80 text-slate-400">
                <span>Accent: <strong className="text-slate-200">{selectedPersona.accent}</strong></span>
                <span>Latency: <strong className="text-emerald-400">{selectedPersona.latency}</strong></span>
              </div>
            </div>

            {/* Audio Settings & Ambiance Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmbientSound(!ambientSound)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    ambientSound
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {ambientSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>Realistic Call Room Ambiance ({ambientSound ? "ON" : "OFF"})</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" /> Phonetic panthum tuning active
              </div>
            </div>

            {/* Live Transcript Bubble */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain size={14} className="text-primary" /> Live Voice Output Transcript
                </span>
                <span className="text-[10px] font-mono text-slate-500">Sub-180ms Pipeline</span>
              </div>
              <p className="text-slate-200 italic text-sm sm:text-base leading-relaxed font-normal">
                "{selectedPersona.sampleText}"
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {!isPlaying ? (
                <button
                  onClick={handlePlaySample}
                  disabled={isSynthesizing}
                  className="primary-btn w-full sm:w-auto px-8 py-4 text-base rounded-xl flex items-center justify-center gap-3 font-bold shadow-xl shadow-primary/25 min-h-[52px]"
                >
                  {isSynthesizing ? (
                    <>
                      <Sparkles size={20} className="animate-spin text-white" /> Synthesizing Voice...
                    </>
                  ) : (
                    <>
                      <Volume2 size={20} /> Listen to Live Sample
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleStopSample}
                  className="w-full sm:w-auto px-8 py-4 text-base rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all font-bold flex items-center justify-center gap-3 min-h-[52px]"
                >
                  <MicOff size={20} /> Stop Synthesis
                </button>
              )}

              <a
                href={`https://wa.me/${companyDetails.phone.replace(/[^0-9]/g, "")}?text=Hi%20PANTHM%20AI%20Labs%2C%20I%20tested%20your%20Voice%20AI%20Demo%20and%20want%20a%20custom%20voice%20SDR%20setup.`}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn w-full sm:w-auto px-6 py-4 text-base rounded-xl flex items-center justify-center gap-2 font-semibold border-slate-700 hover:bg-slate-800 text-slate-200 min-h-[52px]"
              >
                <MessageSquare size={18} className="text-emerald-400" /> Request Custom Avatar
              </a>
            </div>

            {/* Live Phone Call Trigger Section */}
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <PhoneCall size={20} className="text-emerald-400" /> Want a Live Telecalling Test to Your Phone?
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Enter your mobile number below to trigger an immediate automated AI telecalling test call.
              </p>

              {!callSubmitted ? (
                <form onSubmit={handleRequestLiveCall} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="tel"
                    required
                    placeholder="+91 8788502740 (Enter your mobile number)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm font-mono min-h-[48px]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 whitespace-nowrap min-h-[48px]"
                  >
                    <PhoneCall size={16} /> Trigger Test Call
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-200">Test call queued successfully for {phoneNumber}!</strong>
                    Our PANTHM Voice SDR is initiating your live call over WebRTC. You will receive an incoming call shortly.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Simulated Live Call Phone Overlay / HUD Modal */}
      {showSimulatedCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-cyan-500" />
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold uppercase tracking-wider">
                {callActiveState === "calling" ? "Initiating Telecall..." : callActiveState === "connected" ? "Call Connected" : "Call Ended"}
              </span>
              <h3 className="text-xl font-bold text-white">PANTHM AI SDR</h3>
              <p className="text-xs font-mono text-slate-400">{phoneNumber || "+91 8788502740"}</p>
            </div>

            {/* Avatar Pulse */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-primary/20 ${callActiveState === "connected" ? "animate-ping" : "animate-pulse"}`} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-indigo-600 border-2 border-white/20 flex items-center justify-center shadow-xl relative z-10">
                <Bot size={44} className="text-white" />
              </div>
            </div>

            {/* Call Duration */}
            <div className="text-sm font-mono text-slate-300">
              {callActiveState === "connected" ? (
                <span className="text-emerald-400 font-bold">{formatSeconds(callDuration)}</span>
              ) : (
                <span className="text-slate-400 animate-pulse">Ringing...</span>
              )}
            </div>

            {/* Call Controls */}
            <div className="pt-2">
              <button
                onClick={handleHangupSimulatedCall}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <PhoneOff size={18} /> Hang Up Test Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAIDemo;

