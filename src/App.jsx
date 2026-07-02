import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import MapApp from './pages/MapApp';
import Vision from './pages/Vision';

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 },
};

export default function App() {
  const [screen, setScreen] = useState('landing');
  return (
    <AnimatePresence mode="wait">
      {screen === 'landing' && (
        <motion.div key="landing" {...fade}>
          <Landing onOpen={() => setScreen('map')} onVision={() => setScreen('vision')} />
        </motion.div>
      )}
      {screen === 'map' && (
        <motion.div key="map" {...fade} className="h-screen">
          <MapApp onHome={() => setScreen('landing')} onVision={() => setScreen('vision')} />
        </motion.div>
      )}
      {screen === 'vision' && (
        <motion.div key="vision" {...fade}>
          <Vision onBack={() => setScreen('map')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
