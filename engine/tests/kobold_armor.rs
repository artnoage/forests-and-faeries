//! Directed SRD 5.2.1 cases shared with the rules oracle.
use std::sync::Arc;

use ember_rs::content::{ContentPool, SpellId, Template};
use ember_rs::engine::{Act, Fight, St};
use ember_rs::map::Grid;
use ember_rs::spells::Cast;
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;

fn fight(rows: &[&str], roster: &[(&str, i32, i32)]) -> Fight {
    let rows: Vec<String> = rows.iter().map(|s| s.to_string()).collect();
    let ids: Vec<String> = roster.iter().map(|&(id, _, _)| id.to_owned()).collect();
    let placed: Vec<Placement> = roster.iter().map(|&(id, x, y)| Placement { id: id.to_owned(), x, y }).collect();
    Fight::on_map(ContentPool::global(), Arc::new(Grid::from_rows(&rows).unwrap()),
                  &ids, &placed, 20, Trace::free(11)).unwrap()
}

#[test]
fn kobold_thrown_dagger_pack_tactics_requires_a_capable_ally() {
    let mut f = fight(&["HHHHHHHH", "H......H", "H......H", "H......H", "HHHHHHHH"],
                      &[("mara", 4, 2), ("kobold_warrior-1", 1, 2), ("kobold_warrior-2", 4, 3)]);
    let kobold = f.units[1].t;
    assert!(kobold.pack_tactics);
    let dagger = kobold.attacks.iter().find(|a| a.thrown).unwrap();
    assert_eq!((dagger.range, dagger.range_max), (20, 60));
    assert_eq!(kobold.inventory, vec![("dagger", 3)]);
    assert_eq!(f.advantage(1, 0, dagger), (true, false));
    f.units[2].statuses.push(St::Incapacitated);
    assert_eq!(f.advantage(1, 0, dagger), (false, false));
}

#[test]
fn armor_blindsight_obeys_range_and_total_cover() {
    for (lane, x, visible) in [("H..............H", 13, true), ("H....H.........H", 13, false),
                               ("H..............H", 14, false)] {
        let mut f = fight(&["HHHHHHHHHHHHHHHH", "H..............H", lane, "H..............H", "HHHHHHHHHHHHHHHH"],
                          &[("mara", x, 2), ("animated_armor-1", 1, 2)]);
        let armor = f.units[1].t;
        assert_eq!((armor.init_bonus, armor.blindsight, armor.max_hp, armor.ac), (2, 60, 33, 18));
        f.units[0].hidden_stealth = Some(25);
        assert_eq!(f.can_see(1, 0), visible);
    }
}

#[test]
fn blur_scores_and_attack_rolls_use_the_attackers_sense() {
    let pool = ContentPool::global();
    let armor = pool.template(pool.tid("animated_armor").unwrap());
    let truesight = Box::leak(Box::new(Template { blindsight: 0, truesight: 60, ..armor.clone() }));
    let blur = Cast { spell: SpellId::Blur, at_level: 2, free: false, targets: vec![0],
                      multi: false, point: None, mm: None, dt: None };
    for observer in [armor, truesight] {
        for (lane, x, valuable, disadvantage) in [
            ("H..............H", 4, false, false),
            ("H..............H", 13, false, false), // exactly 60 feet
            ("H..............H", 14, false, true),  // outside sense and melee threat range
            ("H.H............H", 4, true, true),    // wall blocks the sense
        ] {
            let mut f = fight(&["HHHHHHHHHHHHHHHH", "H..............H", lane, "H..............H", "HHHHHHHHHHHHHHHH"],
                              &[("curogana", x, 2), ("animated_armor-1", 1, 2)]);
            f.units[1].t = observer;
            assert_eq!(f.spell_ai_value(0, &blur) > 0.0, valuable);
            f.do_spell(0, &blur);
            assert_eq!(f.advantage(1, 0, &observer.attacks[0]).1, disadvantage);
        }
    }
    let mut f = fight(&["HHHHHHH", "H.....H", "HHHHHHH"], &[("curogana", 3, 1), ("ghoul-1", 2, 1)]);
    assert!(f.spell_ai_value(0, &blur) > 0.0);
    f.do_spell(0, &blur);
    assert!(f.advantage(1, 0, &f.units[1].t.attacks[0]).1);
}

#[test]
fn native_dash_needs_an_affordable_step_towards_a_known_enemy() {
    let mut f = fight(&["HHHHHHHH", "H......H", "HHHHHHHH"],
                      &[("guy", 1, 1), ("animated_armor-1", 5, 1)]);
    f.units[1].action = 1;
    f.units[1].movement = 0;
    let choice = f.external_decision(1, true, 0);
    assert!(matches!(choice.legal[choice.native_choice.unwrap()], Act::Dash));
    f.units[1].movement = 25;
    let choice = f.external_decision(1, true, 0);
    assert!(matches!(&choice.legal[choice.native_choice.unwrap()], Act::Move(path) if path.last() == Some(&(4, 1))));

    let mut crossing = fight(&["HHHHHHHH", "H......H", "HHHHHHHH"],
                             &[("guy", 1, 1), ("animated_armor-1", 5, 1), ("skeleton-1", 4, 1)]);
    crossing.units[2].hp = 0;
    crossing.units[2].statuses.push(St::Dead);
    crossing.units[1].action = 1;
    crossing.units[1].movement = 25;
    let d = crossing.external_decision(1, true, 0);
    assert!(matches!(&d.legal[d.native_choice.unwrap()], Act::Move(path) if path.contains(&(4, 1)) && path.last().unwrap().0 < 4));

    let mut trapped = fight(&["HHHHHHHH", "H...H..H", "HHHHHHHH"],
                            &[("guy", 1, 1), ("animated_armor-1", 5, 1)]);
    trapped.units[1].action = 1;
    trapped.units[1].movement = 25;
    let d = trapped.external_decision(1, true, 0);
    assert!(matches!(d.legal[d.native_choice.unwrap()], Act::Dodge));
    assert!(d.legal.iter().any(|a| matches!(a, Act::Dash)));
    trapped.units[1].action = 0;
    let d = trapped.external_decision(1, true, 0);
    assert!(matches!(d.legal[d.native_choice.unwrap()], Act::EndTurn));
}

#[test]
fn last_wick_ranges_and_reactions_are_versioned() {
    let rows = ["HHHHHHHHHHHHH", "H...........H", "H...........H", "H...........H",
                "H...........H", "H...........H", "H...........H", "H...........H", "HHHHHHHHHHHHH"];
    let mut f = fight(&rows, &[("elion_l2", 11, 2), ("wight-1", 5, 7), ("wight-2", 6, 7)]);
    assert_eq!((f.feet(0, 1), f.feet(0, 2)), (30, 25));
    assert!(f.units.iter().all(|u| u.has_reaction()));
    f.set_rule_version(5);
    assert_eq!((f.feet(0, 1), f.feet(0, 2)), (35, 35));
    assert!(f.units.iter().all(|u| !u.has_reaction()));
}

#[test]
fn disengage_protects_a_hero_and_native_reactors_spare_turned_creatures() {
    let mut f = fight(&["HHHHHHHH", "H......H", "H......H", "HHHHHHHH"],
                      &[("guy", 3, 1), ("elion_l2", 2, 1), ("ghoul-1", 4, 1)]);
    let path = [(3, 1), (2, 2), (1, 2)];
    let hero = 0;
    f.units[hero].action = 1;
    f.units[hero].bonus = 1;
    assert!(!f.opportunity_attacks(hero, &path).is_empty());
    let d = f.external_decision(hero, true, 0);
    assert!(d.legal.iter().any(|act| matches!(act, Act::Disengage)));
    f.order = vec![hero, 1, 2];
    f.execute(Act::Disengage);
    assert_eq!((f.units[hero].action, f.units[hero].bonus), (0, 1));
    assert!(f.opportunity_attacks(hero, &path).is_empty());
    f.units[2].turned_by.push((1, 600, true));
    assert!(f.opportunity_attack_listener(hero, 2).is_none());
    assert!(f.units[hero].has_reaction());
}

#[test]
fn dodge_and_prone_depend_on_perception_and_distance() {
    let mut f = fight(&["HHHHHHHH", "H......H", "H......H", "HHHHHHHH"],
                      &[("guy", 2, 1), ("skeleton-1", 6, 1)]);
    let bow = f.units[1].t.attacks.iter().find(|a| a.ranged).unwrap();
    f.units[0].dodge = true;
    assert_eq!(f.advantage(1, 0, bow), (false, true));
    f.units[1].hidden_stealth = Some(40);
    assert_eq!(f.advantage(1, 0, bow), (true, false));
    f.units[1].hidden_stealth = None;
    f.units[0].statuses.extend([St::Unconscious, St::Prone]);
    assert_eq!(f.advantage(1, 0, bow), (true, true));
}

#[test]
fn preserve_life_shares_healing_between_two_downed_allies() {
    let mut f = fight(&["HHHHHHHH", "H......H", "HHHHHHHH"],
                      &[("elion", 1, 1), ("guy", 2, 1), ("chruna", 3, 1), ("ghoul-1", 6, 1)]);
    for u in [1, 2] {
        f.units[u].hp = 0;
        f.units[u].statuses.push(St::Unconscious);
    }
    let mut splits = f.preserve_life_allocation(0);
    splits.sort_unstable();
    assert_eq!(splits.len(), 2);
    assert_eq!(splits[0].1 + splits[1].1, 15);
    assert!((splits[0].1 - splits[1].1).abs() <= 1);
}

#[test]
fn turned_creature_can_cross_a_plateau_on_its_way_to_safety() {
    let rows = ["HHHHHHHHH", "H.......H", "HH.HHHHHH", "HH.HHHHHH", "HH.HHHHHH", "HHHHHHHHH"];
    let mut f = fight(&rows, &[("elion_l2", 2, 4), ("ghoul-1", 4, 1)]);
    f.units[1].turned_by.push((0, 600, true));
    f.units[1].movement = 30;
    let retreat = f.flee_step(1).unwrap();
    assert_eq!(retreat[..2], [(4, 1), (5, 1)]);
    assert_eq!(retreat.last(), Some(&(7, 1)));
}

#[test]
fn native_pursues_heard_targets_around_cover() {
    let mut f = fight(&["HHHHHHHHH", "H.......H", "H..H....H", "H.......H", "HHHHHHHHH"],
                      &[("guy", 1, 2), ("ghoul-1", 6, 2)]);
    assert!(!f.can_see(1, 0));
    f.units[1].movement = 30;
    f.units[1].action = 1;
    let choice = f.external_decision(1, true, 0);
    assert!(matches!(choice.legal[choice.native_choice.unwrap()], Act::Move(_)));
    f.units[1].movement = 0;
    let choice = f.external_decision(1, true, 0);
    assert!(matches!(choice.legal[choice.native_choice.unwrap()], Act::Dash));
}

#[test]
fn diagonal_corners_follow_terrain_and_allow_an_adjacent_ally() {
    let rows = ["HHHHHHH", "H.....H", "H...H.H", "H.....H", "HHHHHHH"];
    let mut f = fight(&rows, &[("guy", 2, 2), ("elion", 3, 2), ("ghoul-1", 5, 3)]);
    let direct = [(2, 2), (3, 1)];
    assert_eq!(f.compute_actual_moves(0, &direct, 1).0, direct);
    f.units[0].movement = 30;
    let choices = f.external_decision(0, true, 0);
    assert!(choices.legal.iter().any(|a| matches!(a, Act::Move(path) if path.as_slice() == direct)));
    let by_wall = fight(&rows, &[("guy", 4, 3), ("ghoul-1", 5, 1)]);
    let around = [(4, 3), (5, 2)];
    assert_eq!(by_wall.compute_actual_moves(0, &around, 1).0, [around[0]]);
}
