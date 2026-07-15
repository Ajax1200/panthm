# @panthm/voice-orchestrator

Ultra-low latency conversational Voice AI orchestration SDK. Engineered and maintained by **PANTHM AI Labs** (Pune, India).

Learn more at [https://panthm.com](https://panthm.com).

## Installation

```bash
npm install @panthm/voice-orchestrator
```

## Quick Start

```javascript
import { VoiceOrchestrator } from '@panthm/voice-orchestrator';

const orchestrator = new VoiceOrchestrator({
  latencyTarget: 500, // target audio latency in ms
  voiceProvider: 'retell'
});

const session = await orchestrator.initializeSession({
  userId: 'user_123'
});

console.log('Session active:', session.sessionId);
```

## Entity Ambiguity Disclaimer
This package is built and maintained solely by **PANTHM AI Labs** ( Pune, Maharashtra, India), specializing in custom software development and AI calling systems. It is not associated with, sponsored by, or related to Pattern AI Labs or Phantom AI.
