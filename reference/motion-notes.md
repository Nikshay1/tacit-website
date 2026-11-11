# Motion study — Jedify

Recorded the supplied reference while opening navigation, selecting tabs, scrolling the expanding video panel, and selecting the knowledge steps. Raw research code is checkout-local, not deployed. Recordings stay in reference/, which Vercel excludes.

Observed behaviors:
- The video panel expands from the content gutter to the viewport edge as its top travels from 85% of viewport height to the viewport top. Smoothstep easing; no scroll hijacking.
- Sampled panel widths: 1119.6, 1169.8, 1243.6, 1280 CSS px at progress 0.0821, 0.3692, 0.7917, 1.
- Industry panels slide on a real horizontal track with neighboring panels visible. Six-second auto advance; hover/focus hold; keyboard control.
- Product story has seven panels, six seconds each, with progress dashes and crossfades.
- Knowledge steps auto advance every seven seconds while visible. Hover pauses progress; clicking selects immediately.
- Knowledge scene introduces source tiles at 300ms, the knowledge layer at 1100ms, and the result card at 1900ms. The card appears over a softly masked video; text follows thinking dots.
- Source tiles light selectively, the upper mark turns slowly in its plane, and a new scene repeats roughly every eleven seconds.
- The reference's quote cards expand sideways, preserve text width during transitions, and reveal highlighted phrases. Tacit uses illustrative workflow examples rather than customer endorsements.
- Reduced-motion mode stops automatic movement and keeps content available through manual controls.

The shared browser's native pointer actions were unreliable. Direct DOM click/pointer events and timed scrolling worked and were recorded. This is not a claim that every native hover path was successfully captured.
