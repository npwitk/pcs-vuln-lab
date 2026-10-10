const app = require('./app');
const PORT = process.env.PORT || 4000;

// Demo robustness: a single bad input (e.g. a non-integer id in a URL) must
// never take the whole API down mid-demo. Log and keep serving.
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err && err.message));
process.on('uncaughtException',  (err) => console.error('[uncaughtException]', err && err.message));

app.listen(PORT, () => console.log(`[peanut-dev-api] VULNERABLE LAB listening on :${PORT}`));
