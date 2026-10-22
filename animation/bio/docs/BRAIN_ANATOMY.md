# Shared brain illustration

`../remotion/src/BrainAnatomy.tsx` renders a medial-view schematic with transparent projected deep structures. It is an anatomically informed teaching diagram, not an atlas segmentation or a strict midsagittal section. The NAc, amygdala and hippocampus are overlays rather than a claim that these structures share one cutting plane. The SVG includes an accessible description of this convention.

## Geometry and orientation

`brain-anatomy-geometry.ts` centralizes named structure contours, region anchors, cortical sulci, cerebellar folia and dopamine projection geometry. Canonical anterior is left; the default `anteriorRight` transform mirrors all anatomy and pathways together. Frontal cortex remains on screen-right and cerebellum on screen-left.

The established VTA, NAc, PFC, hippocampal and amygdala anchors are retained to preserve scene camera targets, magnified insets and label attachments. The NAc has a smaller irregular contour in the anterior ventral forebrain. The PFC highlight follows the anterior cortical contour. The VTA lies within the ventral midbrain, above the pons and medulla.

The cerebral contour and sulci distinguish frontal, paracentral, precuneal and posterior regions. The callosal band has a C-shaped profile above the thalamus; the hypothalamus lies anterior and inferior to the thalamus. Brainstem subdivisions and cerebellar folia have separate contours. Hippocampal and amygdala overlays have curved anatomical contours rather than generic circles.

The existing `vHPC` key and narration label are retained for the rodent circuitry discussion. In human anatomy, anterior hippocampus is the broad counterpart of rodent ventral hippocampus; this is not a precise cross-species anatomical registration.

## Animation controls

Existing position, uniform scale, drawing progress, opacity, cortex opacity and per-region controls remain available. `highlights` and `regionOpacity` accept every named structure, including `corpusCallosum`, `thalamus`, `hypothalamus`, `midbrain`, `pons`, `medulla` and `cerebellum`. `labels` remains opt-in. `BrainRegionLabel` uses the same central anchors, and custom screen-space label positions remain supported.

`detail` optionally controls finer sulci on a 0–1 scale. Its default increases smoothly with camera scale, retaining the major anatomy at small sizes. No frame-driven state is stored; drawing and activity remain deterministic when seeking backward.

The main `mesolimbic` projection connects VTA to NAc. `mesocortical` connects VTA to PFC. `mesoamygdala` and `mesohippocampal` are separate VTA-originating projections, not a serial route through several targets. The additional projections follow the main limbic drawing progress at subdued opacity by default and can be independently overridden through `pathwayProgress`, `pathwayOpacity` and `activity`. The NAc route remains most prominent. Yellow pulses sample the same cubic paths used for axon drawing; they represent neuronal activity, not freely traveling dopamine molecules. NAc input pathways also reference the centralized anchors.

## References and verification

- [Brain Circuits Activated by Rewarding Drugs, Basic Neurochemistry](https://www.ncbi.nlm.nih.gov/books/NBK28165/): VTA projections to limbic forebrain and frontal cortex.
- [Functional Anatomy of the Hypothalamus and Pituitary, Endotext](https://www.ncbi.nlm.nih.gov/books/NBK279126/): hypothalamic relationships to thalamus and neighboring structures.
- [Coenen et al., 2018](https://pubmed.ncbi.nlm.nih.gov/29845013/): human VTA connectivity with reward-associated subcortical and frontal regions.

Run `npm run check:anatomy`, `npm run typecheck`, and the existing scene checks. Anatomy checks cover relative landmark relationships, small NAc size, projection origins/targets, shared NAc input references, mirroring, per-structure opacity, label attachment and reverse seeking. Scene durations, narration timing, citations and character sequences remain controlled by the existing scenes. The component is used by Videos 3.5, 4, 5, 6, 7 and 8; inspect previews in all six when changing geometry.
