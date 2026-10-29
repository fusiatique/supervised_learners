# Brain visual redesign

The detailed human anatomy is shared by Videos 3.5–8, including cross-scene handoffs. Videos 1–2 use the compact illustration, now drawn from the same cortical geometry. Video 3 has no anatomical brain drawing to replace. Video 7's rodent brain retains its species-specific smooth cortex, orientation and prelimbic activation.

## Preserved animation contract

No scene durations, time-remapping functions, title text, camera movements, label coordinates or activation windows were changed. The canonical orientation remains anterior/PFC left and cerebellum/brainstem right. All original region center coordinates and cubic pathway endpoints are unchanged. Deep structures are projected onto a medial-view schematic, rather than claimed to occupy one cutting plane.

- VTA: (512, 467), yellow; NAc: (398, 418), green; PFC: (205, 275), blue.
- Mesolimbic signals remain independently animated from VTA to NAc, now green.
- Mesocortical signals remain independently animated from VTA to PFC, now blue.
- Independent VTA projections to amygdala and hippocampus remain present.
- Existing pulsing, brief emphasis scaling, drawing reveals, partial opacity, reverse seeking and cross-video handoffs continue to use their existing frame inputs.
- Striatal context uses shared caudate/putamen paths, muted purple. NAc remains a separately controllable ventral target.

Existing narration emphasis windows (local source frames; each scene's existing remapping remains authoritative): Video 4 VTA/NAc and mesolimbic 750–899; Video 5 VTA bridge 60–600, NAc introduction 330–700, input targets 2160–2400; Video 6 VTA 270–570, PFC 390–1290 and 1720–1800; Video 7 PFC 60–1380 and rodent prelimbic 1440–1800; Video 8 NAc/PFC 1530–1830. No narration file is retimed.

## Artwork

`BrainSurface.tsx` supplies layered cortical shading, white matter, ventricular negative space, contrasting sulci and fine folds. `BrainAnatomy.tsx` retains independent anatomy, target, projection and annotation groups. Supporting structures have restrained tissue shading and cerebellar folia. SVG gradients/clip IDs are instance-specific to support multiple simultaneous brains.

Reproduce the eight-state anatomy/activation preview with `scripts/preview-brain.tsx` (bundle with esbuild, run with Node, open `/private/tmp/neuroai-brain-review.html`). It includes neutral anatomy, VTA, NAc, PFC, both moving pathways, compact human brain and rodent brain. The screenshot is `brain-visual-review.png` alongside this document.

## Anatomical references

- [UTHealth Neuroanatomy Online: caudate nucleus](https://nba.uth.tmc.edu/neuroanatomy/L10/Lab10p06_index.html): head/body/tail and ventricular arc.
- [MR Anatomy of Deep Brain Nuclei](https://pmc.ncbi.nlm.nih.gov/articles/PMC4202840/): caudate, putamen and internal-capsule relationships.
- [NCBI: basal ganglia](https://www.ncbi.nlm.nih.gov/books/NBK537141/): ventral striatum and NAc; VTA input relationships.

The anatomy remains an educational projection, not a patient-specific atlas segmentation.

## Validation

- TypeScript compilation and anatomy, independent-activation, moving-signal and reverse-seeking checks pass.
- Scene checks pass for 01, 02, 03, 3.5, 04, 05, 07 and 08.
- Comparison against pre-redesign Git HEAD confirms all 69 existing nonvisual scene/geometry declarations are identical, including every timing map and camera/state function.
- The existing Scene 06 check expects `scene06ContentFrame(599) === 479`; the unchanged implementation returns `546.7472222222223`. This predates the visual redesign. Its timeline was preserved rather than changed to satisfy an outdated assertion.
- All nine HTML bundles and MP4s are rebuilt; the final sync audit verifies composition, duration, frame count, resolution, frame rate and current HTML cache hashes.
