# Wayfarer's Chronicle

A fully offline solo fantasy adventure web app.

## Run it

For the service worker and installable offline mode to work, serve the folder through a small local web server.

### Windows
Open Command Prompt in this folder and run:

    py -m http.server 8080

Then open:

    http://localhost:8080

### Mac or Linux

    python3 -m http.server 8080

Then open:

    http://localhost:8080

The game itself uses no external libraries, fonts, APIs, or internet assets.

## Included systems

- Adventure setup prompts
- Seeded procedural story generation
- Character creation with six classes and six ancestries
- Standard-array ability score assignment
- Skills, backgrounds, armour class, hit points, class resources, inventory and XP
- Animated on-screen dice
- Skill checks and difficulty classes
- Initiative and turn-based combat
- Critical hits
- Healing, class abilities, death saving throws and levelling
- Local save/load and autosave
- Installable Progressive Web App support
- Responsive desktop and mobile layout

## Important design note

This project uses original setting text and a 5e-compatible rules structure. It does not copy proprietary adventure text, character art, or non-open rulebook content.
