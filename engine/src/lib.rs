//! ember-rs: a fast Rust mirror of the natural20 5e SRD engine, checked
//! against natural20 by exact dice-tape replay. Creatures are data exported
//! from natural20 (`content/`, see `content.rs`); maps are natural20 map
//! rows up to 32x32 (`map.rs`).
//!
//! natural20 is MIT licensed (Copyright (c) 2024 Joseph Dayo); this crate
//! mirrors its rules and keeps that notice (see LICENSE-natural20 and NOTICE). Creature data is
//! SRD 5.2.1 content under CC-BY-4.0 (see `content.rs` and NOTICE).

pub mod ai;
pub mod balance;
pub mod barbarian;
pub mod batch;
pub mod catalog;
pub mod content;
pub mod dice;
pub mod dump;
pub mod effects;
pub mod encode;
pub mod engine;
pub mod env;
pub mod layout;
pub mod map;
pub mod mapgen;
pub mod npz;
pub mod path;
pub mod present;
pub mod present_text;
pub mod replay;
pub mod spells;
pub mod sorcerer;
pub mod spec;
pub mod tape;
pub mod trace;
pub mod web_events;
