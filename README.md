# TruthCart

TruthCart is an AI-powered product trustworthiness analyzer.

## Deployment Instructions

1.  **Deploy Serverless Function**
    *   Deploy `api/analyze.js` to Vercel (or a compatible serverless platform).
    *   Set the environment variable `API_KEY` (or `GCP_API_KEY`) to your Google Gemini API Key.

2.  **Configure Content Script**
    *   Open `content.js`.
    *   Replace `const SERVERLESS_URL = "http://localhost:3000/api/analyze";` with your deployed function URL (e.g., `https://your-project.vercel.app/api/analyze`).

3.  **Build Extension**
    *   Ensure the following files are in the extension folder:
        *   `manifest.json`
        *   `content.js`
        *   `styles.css`
        *   `popup.html`
        *   `privacy.html`
        *   Icons (if any)

4.  **Install Extension**
    *   Open Chrome and go to `chrome://extensions/`.
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the extension folder.

5.  **Usage**
    *   Visit a product page (e.g., Amazon, AliExpress).
    *   Click the "Fast Scan" or "Deep Research" button on the TruthCart widget.
