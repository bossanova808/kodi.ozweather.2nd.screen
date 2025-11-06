// ---------- LOGGER UTILITY ----------

// Generate a consistent, pleasant color per tag
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Factory to create a named logger
function createLogger(name = null) {
  const autoName = document.currentScript?.src?.split('/').pop() ?? 'unknown';
  const tag = name || autoName;
  const color = stringToColor(tag);

  const getFormat = () => [
    `%c[${new Date().toLocaleTimeString()}] %c[${tag}]%c`,
    'color: gray;',
    `color: ${color}; font-weight: bold;`,
    '',
  ];

  return {
    log: (...args) => console.log(...getFormat(), ...args),
    info: (...args) => console.info(...getFormat(), ...args),
    warn: (...args) => console.warn(...getFormat(), ...args),
    error: (...args) => console.error(...getFormat(), ...args),
  };
}

// ---------- GLOBAL SETUP ----------

// Add a global function for convenience
window.logger = (name) => createLogger(name);

// Add a default global `log()` that infers the current script name
window.log = (...args) => {
  const name = document.currentScript?.src?.split('/').pop() ?? 'global';
  const color = stringToColor(name);
  const prefix = [
    `%c[${new Date().toLocaleTimeString()}] %c[${name}]%c`,
    'color: gray;',
    `color: ${color}; font-weight: bold;`,
    '',
  ];
  console.log(...prefix, ...args);
};

// Optional: short aliases if you like
window.info = (...args) => window.log('[INFO]', ...args);
window.warn = (...args) => console.warn('[WARN]', ...args);
window.error = (...args) => console.error('[ERROR]', ...args);

console.info('%c✅ Global logger initialised', 'color: green; font-weight: bold;');
