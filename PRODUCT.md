# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A private group of friends (the Prawnstars pod, about four people) who play Magic: The Gathering together. They mainly play Commander at a high power level (bracket 3 to 4) and sometimes try other formats. They play online from their own homes, talking over voice and webcam while they play. One member (Tal) runs the site and manages the pod's decks.

## Product Purpose

A private online table for the group: full rules-enforced Magic (the Forge engine) with voice chat and webcams built in, and every player's decks ready to play without importing. Success is the pod sitting down at a game night, opening one link, and playing without fiddling with setup.

## Positioning

It is the group's own table, not a public service: their decks are already loaded and synced (the pod deck shelf), voice and cameras live inside the game, and it runs on their own server. A public Magic client cannot have their decks waiting for them or their in-jokes in the name.

## Operating Context

- Game nights: several players join the same table from different homes, usually Commander pods of four.
- Players pick their name once per browser; their pod decks are copied into My Decks and stay synced when Tal updates the deck files (`yarn pod-deck`).
- Voice and webcams run peer to peer between players at a table; the relay only passes connection signals.
- Hosted on a private server (relay plus a game node running the Forge engine), planned on a custom domain over HTTPS, which browsers require for microphone and camera access.

## Capabilities and Constraints

Keep:

- Multiplayer tables in every format the engine supports, Commander first.
- Ready-made decks in every format, including Commander (the preset deck shelf), for trying new formats and decks.
- The pod deck shelf (each friend's own decks, synced).
- Voice chat and webcams at the table.
- Singleplayer games against the AI.
- Draft and sealed.
- Life tracker.
- Card search.
- Deck building and import (text lists, Moxfield, Archidekt).

Remove:

- Manabrew branding, name and links.
- Accounts and sign-up; replaced by one shared group password to enter the site, then picking your name.
- Community decks and other public, hosted, or account-only features (public relay, deck hub publishing).

Technical constraints:

- Fork of the open-source Manabrew client (React + Tailwind v4, Rust relay and engine, Java Forge harness). AGPL-3.0: the modified source must stay available to the people the site serves (the public GitHub fork covers this).
- Card images and data come from Scryfall.

Undecided:

- Where the private server runs (this PC or a cloud server) and the custom domain name.

## Brand Commitments

- Name: **Prawnstars MTG**.
- The logo is colorful and bright (Tal, 2026-11-26).
- Personal hobby for friends; not a business, no marketing claims.

## Evidence on Hand

- Five real Commander decks of Tal's on the pod shelf (`public/pod_decks/`).
- About 43 preset decks across formats (`public/preset_decks/`).
- No logo, testimonials, or other brand assets yet; do not invent any.

## Product Principles

1. Game night first: getting from link to playing should take as few steps as possible.
2. It is ours: everything a stranger would see on a public client (accounts, community, branding) gives way to the group's names, decks, and jokes.
3. Rules stay trustworthy: the engine decides; the interface never hides game state to look cleaner.
4. Talk is part of the game: voice and cameras sit with the table, never in the way of the board.

## Accessibility & Inclusion

No specific needs recorded. Keep keyboard access, readable contrast, and reduced-motion support the client already has.
