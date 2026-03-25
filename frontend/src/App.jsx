import { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

function App() {
  const [status, setStatus] = useState('idle');

  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      console.log('Connected to ElevenAgent');
    },
    onDisconnect: () => {
      setStatus('idle');
      console.log('Disconnected from ElevenAgent');
    },
    onError: (error) => {
      setStatus('error');
      console.error('ElevenAgent error:', error);
    },
    onMessage: (message) => {
      console.log('Agent message:', message);
    }
  });

  const handleToggle = useCallback(async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
    } else {
      setStatus('connecting');
      try {
        // Replace with your ElevenLabs Agent ID
        await conversation.startSession({
          agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        setStatus('error');
      }
    }
  }, [conversation]);

  const getButtonText = () => {
    switch (status) {
      case 'connected':
        return '🛑 Stop Roasting';
      case 'connecting':
        return '🔄 Connecting...';
      default:
        return '🔥 Start Roasting';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '🎤 Listening... Say "Roast [website URL]"';
      case 'connecting':
        return '⏳ Connecting to roast master...';
      case 'error':
        return '❌ Connection failed. Check your Agent ID.';
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="logo">🔥</div>
      <h1>Roast My Website</h1>
      <p className="tagline">AI-powered website roasts delivered with sass</p>

      <button
        className={`roast-button ${status === 'connected' ? 'active' : 'idle'}`}
        onClick={handleToggle}
        disabled={status === 'connecting'}
      >
        {getButtonText()}
      </button>

      {getStatusText() && (
        <div className={`status ${status}`}>
          {getStatusText()}
        </div>
      )}

      <div className="instructions">
        <h3>How it works</h3>
        <ol>
          <li>Click the button to connect</li>
          <li>Say <code>"Roast example.com"</code></li>
          <li>Watch AI analyze & roast the site</li>
          <li>Get brutally honest feedback!</li>
        </ol>
      </div>

      <p className="powered-by">
        Powered by{' '}
        <a href="https://elevenlabs.io" target="_blank" rel="noopener">ElevenLabs</a>
        {' + '}
        <a href="https://firecrawl.dev" target="_blank" rel="noopener">Firecrawl</a>
        {' | '}
        Built for #ElevenHacks
      </p>
    </div>
  );
}

export default App;
