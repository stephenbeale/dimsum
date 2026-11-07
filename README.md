# Dimsum

Measurement photos for Vinted and eBay listings.

Photograph a garment laid flat (front, back and label), type in the measurements you took with a tape, and Dimsum draws the dimension lines on the photos. Save them in portrait (Vinted) or square (eBay) at 1600 px wide, with an optional measurements list under the photo, and copy the measurements into your listing description.

**Live:** https://stephenbeale.github.io/dimsum/

## What it does

- **Several photos per garment.** Front, back, label, detail or worn. Measurements belong to the garment; each photo chooses which lines it shows.
- **Templates** for coats, shirts, knitwear, trousers, skirts and dresses, with standard flat-measuring guidance for each line (pit to pit, sleeve, inseam, rise…).
- **Face blurring.** A face finder runs on the device (MediaPipe, loaded from jsDelivr the first time), so photos don't leave the phone for this. You can also draw blur boxes by hand. Blurring is applied to the saved listing photos; the original photo is kept as taken.
- **Claude (optional).** With your own Anthropic API key, Claude places the measurement lines on the seams and double-checks for faces the on-device finder missed. The key is stored only in the browser's localStorage and sent only to api.anthropic.com, along with the one photo you ask about.
- **Estimate without a tape.** Put a bank card or A4 sheet beside the garment and Dimsum can estimate lengths from the photo. Typed values always win.
- **Sharing.** On a phone, saving opens the share sheet (Save to Photos, or straight into the Vinted or eBay app). On a desktop it downloads the JPEGs.

## Stack

One HTML file: plain JavaScript and CSS, no framework, no build step. An installable PWA (manifest and home-screen icons), hosted on GitHub Pages.

| Layer | What's used |
|---|---|
| Storage | IndexedDB on the device, photos included. Nothing is uploaded. |
| Drawing | Canvas for the editor, the magnifier, pixelated blurs and the exported photos. |
| Faces | `@mediapipe/tasks-vision` 0.10.14 face detector (BlazeFace short range), run on the whole photo plus four overlapping tiles so smaller faces are found. |
| AI | Claude Opus 5.5 via the Messages API, called straight from the browser with the user's key, with structured JSON output. |

On iPhone, add it to your Home Screen (Share, then Add to Home Screen) and use it from there: Safari deletes a website's saved data after 7 days without a visit, but Home Screen apps keep theirs.
