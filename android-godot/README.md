# RAG2RICH — native Android / Godot rebuild

This directory contains the native Godot port. The original React/Vite game remains untouched.

## Source of truth

The original gameplay, copy, balance values and visual assets are defined in the existing web project. This Godot port reproduces that experience rather than redesigning it.

## Current implementation

- Godot 4 project configuration and portrait mobile viewport.
- Five original navigation destinations: Unbox, Closet, Studio, Market and Shop.
- Bale purchase and tap-to-reveal loop with original clothing images.
- Closet item selection, wash/iron timing games, photo backdrops and equipment upgrades.
- Marketplace listings, fees, sale rolls, reputation, gifts and webshop unlock.
- Local save/load for gameplay state, plus the original 60-piece designer catalog.

## Remaining work

Rewarded ads, EEA consent, designer awards, final visual fidelity and Android packaging/device validation remain. See [PORT_STATUS.md](PORT_STATUS.md) for module percentages and verification notes.
