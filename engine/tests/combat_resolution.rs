use ember_rs::content::{ContentPool, SpellId};
use ember_rs::effects::ObjKind;
use ember_rs::engine::{Act, Fight};
use ember_rs::map::{Grid, Pos};
use ember_rs::spells::{Cast, Mm};
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;
use ember_rs::web_events::WebEv;

fn encounter(rows: &[&str], roster: &[(&str, Pos)], seed: u64) -> Fight {
    let units: Vec<_> = roster.iter().map(|(name, _)| name.to_string()).collect();
    let placements: Vec<_> = roster.iter().map(|&(name, (x, y))| Placement { id: name.into(), x, y }).collect();
    let mut fight = Fight::on_map(ContentPool::global(), Grid::shared(rows).unwrap(), &units, &placements,
                                  30, Trace::recording(seed)).unwrap();
    fight.start();
    fight.web_events = Some(Vec::new());
    fight
}

const ROOM: &[&str] = &["............"; 8];

fn cast(spell: SpellId, at_level: i32) -> Cast {
    Cast { spell, at_level, free: false, targets: vec![], multi: false, point: None, mm: None, dt: None }
}

#[test]
fn sight_and_spell_areas_respect_the_same_wall_in_both_directions() {
    let rows = [".....", "..H..", "....."];
    let fight = encounter(&rows, &[("curogana", (1, 1)), ("zombie-1", (3, 2))], 4);
    for a in 0..fight.grid.cells() {
        for b in 0..fight.grid.cells() {
            let (a, b) = (fight.grid.pos_of(a), fight.grid.pos_of(b));
            assert_eq!(fight.grid.los(a, b), fight.grid.los(b, a));
        }
    }
    let area = fight.cube_squares((1, 1), (2, 1), 3);
    assert!(!area.contains(&(3, 2)) && !area.contains(&(2, 1)));
    assert!(area.contains(&(2, 0)));
}

#[test]
fn one_bite_checks_concentration_once_and_lethal_bites_end_it_directly() {
    for hp in [1, 100] {
        let mut saw_hit = false;
        for seed in 0..32 {
            let mut f = encounter(ROOM, &[("elion", (2, 2)), ("ghoul-1", (3, 2))], seed);
            f.units[0].hp = hp;
            let bless = f.new_obj(SpellId::Bless, ObjKind::Spell, 0, vec![0], false);
            f.units[0].concentration = Some(bless);
            f.turn_idx = f.order.iter().position(|&u| u == 1).unwrap();
            f.execute(Act::Attack { atk: 0, target: 0, reaction: false });
            let events = f.web_events.as_ref().unwrap();
            if !events.iter().any(|e| matches!(e, WebEv::RiderDamage { .. })) { continue; }
            let saves = events.iter().filter(|e| matches!(e, WebEv::ConcentrationSave { .. })).count();
            let ended = events.iter().filter(|e| matches!(e, WebEv::ConcentrationEnded { .. })).count();
            assert_eq!((saves, ended), if hp == 1 { (0, 1) } else { (1, 0) });
            saw_hit = true;
            break;
        }
        assert!(saw_hit);
    }
}

#[test]
fn lethal_reaction_leaves_the_body_at_the_departure_square() {
    let mut saw_hit = false;
    for seed in 0..32 {
        let mut f = encounter(ROOM, &[("mara", (4, 2)), ("skeleton-1", (1, 3))], seed);
        f.units[1].hp = 1;
        f.units[1].movement = 30;
        f.units[0].reaction = 1;
        f.turn_idx = f.order.iter().position(|&u| u == 1).unwrap();
        f.execute(Act::Move(vec![(1, 3), (2, 3), (3, 3), (3, 4)]));
        if f.units[1].dead() {
            assert_eq!(f.units[1].pos, (3, 3));
            assert_eq!(f.token_at((3, 3)), Some(1));
            assert_eq!(f.token_at((1, 3)), None);
            assert!(f.web_events.as_ref().unwrap().iter().any(|e| matches!(e,
                WebEv::AttackOutcome { reaction: true, tgt_pos: (3, 3), .. })));
            saw_hit = true;
            break;
        }
    }
    assert!(saw_hit);
}

#[test]
fn thunderwave_pushes_both_failed_targets_through_the_vacated_lane() {
    let mut saw_two_failures = false;
    for seed in 0..64 {
        let mut f = encounter(ROOM, &[("curogana", (4, 5)), ("shadow-1", (4, 4)), ("zombie-1", (4, 3))], seed);
        let mut wave = cast(SpellId::Thunderwave, 1);
        wave.point = Some((4, 4));
        f.do_spell(0, &wave);
        let failed = f.web_events.as_ref().unwrap().iter().filter(|e| matches!(e,
            WebEv::AttackOutcome { save: Some(ember_rs::web_events::SaveOutcome::Failed), .. })).count();
        if failed == 2 {
            assert_eq!(f.units[2].pos, (4, 1));
            assert_eq!(f.units[1].pos, (4, 2));
            saw_two_failures = true;
            break;
        }
    }
    assert!(saw_two_failures);
}

#[test]
fn empowered_spends_exactly_when_a_reroll_is_drawn() {
    for spell in [SpellId::BurningHands, SpellId::ChromaticOrb] {
        let mut observed = [false; 2];
        for seed in 0..64 {
            let mut f = encounter(ROOM, &[("curogana", (1, 2)), ("zombie-1", (3, 2))], seed);
            let mut c = cast(spell, 1);
            c.mm = Some(Mm::Empowered);
            if spell == SpellId::BurningHands { c.point = Some((3, 2)); } else { c.targets.push(1); }
            f.units[0].sorcery_points = 1;
            f.do_spell(0, &c);
            let rolled = f.trace.recorded().iter().any(|ev| matches!(ev,
                ember_rs::tape::Ev::Draw { tag, .. } if tag.contains("empowered_spell")));
            assert_eq!(f.units[0].sorcery_points, i32::from(!rolled));
            observed[usize::from(rolled)] = true;
            if observed == [true, true] { break; }
        }
        assert_eq!(observed, [true, true]);
    }
}

#[test]
fn a_weapon_without_a_strike_can_move_four_squares_once() {
    let mut f = encounter(ROOM, &[("elion", (1, 2)), ("zombie-1", (10, 2))], 4);
    let force = f.new_obj(SpellId::SpiritualWeapon, ObjKind::Force {
        level: 2, pos: (1, 2), modifier: 3, cast_turn: (-1, 0), last_attack_turn: None, expires_at: 1000
    }, 0, Vec::new(), true);
    f.units[0].concentration = Some(force);
    f.units[0].bonus = 1;
    let mut rows = Vec::new();
    f.feature_candidates(0, &mut rows);
    let step = Act::SpiritualWeaponMove { to: (5, 2) };
    assert!(rows.contains(&step));
    assert!(!rows.contains(&Act::SpiritualWeaponMove { to: (6, 2) }));
    let original_slots = f.units[0].slots;
    f.do_feature(0, &step);
    assert_eq!(f.units[0].bonus, 0);
    assert_eq!(f.units[0].slots, original_slots);
    assert!(matches!(f.objs[force as usize].kind, ObjKind::Force { pos: (5, 2), .. }));
    f.units[0].bonus = 1;
    rows.clear();
    f.feature_candidates(0, &mut rows);
    assert!(!rows.iter().any(|a| matches!(a, Act::SpiritualWeaponAttack { .. } | Act::SpiritualWeaponMove { .. })));
}

#[test]
fn breath_cast_offers_five_human_elements_and_one_native_recipient_row() {
    use ember_rs::present::{LevelInput, WebArena};
    use serde_json::json;
    let roster = [("curogana", (1, 2)), ("zombie-1", (9, 3))];
    let level = LevelInput {
        encounter_id: "breath".into(), preset_id: "test".into(), theme: "ossuary".into(),
        map_name: "room".into(), rows: ROOM.iter().map(|r| r.to_string()).collect(),
        scene: json!({"props": []}), level_view: json!({"id": "breath", "preset": "test"}),
        heroes: vec!["curogana".into()], monsters: vec![("zombie-1".into(), "zombie".into(), "Zombie".into())],
        suggested_placements: roster.iter().map(|&(id, (x, y))| Placement { id: id.into(), x, y }).collect(),
    };
    let mut arena = WebArena::new(level, 2, 0, "csrf".into(), "enc".into()).unwrap();
    let mut state = arena.start().unwrap();
    while state["turn_id"] != "curogana" { state = arena.advance(true).unwrap(); }
    let actions: Vec<_> = state["actions"].as_array().unwrap().iter().filter(|a|
        a["label"].as_str().is_some_and(|name| name.starts_with("Dragon's Breath ("))).collect();
    assert_eq!(actions.len(), 5);
    for element in ["acid", "cold", "fire", "lightning", "poison"] {
        assert!(actions.iter().any(|a| a["label"].as_str().unwrap().ends_with(&format!("({element})"))));
    }
    let chosen = actions.iter().find(|a| a["label"].as_str().unwrap().ends_with("(cold)")).unwrap();
    arena.perform(chosen["id"].as_str().unwrap()).unwrap();
    let mut f = encounter(ROOM, &roster, 2);
    while f.current() != 0 {
        f.advance();
    }
    let mut native = Vec::new();
    f.spell_candidates(0, &mut native);
    assert_eq!(native.iter().filter(|a| matches!(a, Act::Spell(c) if c.spell == SpellId::DragonsBreath)).count(), 1);
    let mut breath = cast(SpellId::DragonsBreath, 2);
    breath.targets.push(0);
    breath.dt = Some(ember_rs::content::Dmg::Cold);
    f.do_spell(0, &breath);
    assert!(matches!(f.objs[f.active_breath(0).unwrap() as usize].kind, ObjKind::Breath { dt: ember_rs::content::Dmg::Cold, .. }));
}

#[test]
fn rage_resists_the_advantage_die_even_when_base_damage_would_drop_the_target() {
    use ember_rs::tape::{DrawVal, Ev};
    for seed in 0..64 {
        let mut f = encounter(ROOM, &[("chruna", (2, 2)), ("goblin_warrior-1", (7, 2))], seed);
        f.units[0].hp = 3;
        f.units[0].raging = true;
        f.units[1].statuses.push(ember_rs::engine::St::Hidden);
        f.units[1].hidden_stealth = Some(30);
        f.turn_idx = f.order.iter().position(|&u| u == 1).unwrap();
        let atk = f.units[1].t.attacks.iter().position(|w| w.name == "shortbow").unwrap();
        f.execute(Act::Attack { atk, target: 0, reaction: false });
        let events = f.web_events.as_ref().unwrap();
        let Some((base, applied)) = events.iter().find_map(|e| match e {
            WebEv::AttackOutcome { raw_damage, applied_damage, hit: true, crit: false, .. } => Some((*raw_damage, *applied_damage)),
            _ => None,
        }) else { continue };
        if applied < 3 { continue; }
        let extra = events.iter().find_map(|e| match e {
            WebEv::RiderDamage { applied_damage, advantage_roll: Some(_), .. } => Some(*applied_damage),
            _ => None,
        }).unwrap();
        let die = f.trace.recorded().into_iter().find_map(|e| match e {
            Ev::Draw { tag, v: DrawVal::One(n), .. } if tag == "additional_damage" => Some(n),
            _ => None,
        }).unwrap();
        assert_eq!(applied + extra, (base + die) / 2);
        assert_eq!(f.units[0].hp, 0);
        return;
    }
    panic!("expected a noncritical arrow with a lethal base roll");
}
