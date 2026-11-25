# RAG2RICH — native Android / Godot rebuild

This directory is the start of the native Godot project. The original React/Vite game remains untouched.

## Source of truth
The original gameplay, copy, balance values and visual assets are defined in the existing web project. This Godot port must reproduce that experience rather than redesign it.

## Current implementation
- Godot 4 project configuration and portrait mobile viewport.
- Initial scene and UI shell.
- Five original navigation destinations: Unbox, Closet, Studio, Market, Shop.
- First-pass bale purchase and clothing reveal loop.

## Important
The current GDScript is only a scaffold to prove the native project structure. It is NOT feature-complete and must not be treated as the final art/UI implementation. Original image assets, typography, detailed layouts, full game economy, persistence, ads/consent and Android packaging remain to be ported and tested.
