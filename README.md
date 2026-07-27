# Wayfarer’s Chronicle — Deliberate Choice Edition

A fully offline solo fantasy roleplaying web game.

## Core interaction rule

Every interaction now follows this sequence:

1. The player makes a choice.
2. Any required animated die roll completes.
3. A dedicated result page explains what physically happened.
4. Mechanical changes are listed explicitly.
5. The game pauses indefinitely for reading.
6. The player presses a clearly labelled button to continue or begin combat.

The game never advances a scene on a timer after a choice. Failed checks can still cost HP, position, trust, time, or opportunity, but the cause is described and the player always receives a meaningful consequence, partial clue, changed route, or new tactical situation.

## Run locally

Extract the folder. From inside it run:

    py -m http.server 8080

Then open:

    http://localhost:8080

Mac/Linux may use `python3 -m http.server 8080`.

No external library, API, font, or internet asset is required.
