//! Directed SRD 5.2.1 cases shared with the rules oracle.
use std::sync::Arc;

use ember_rs::content::{ContentPool, SpellId, Template};
use ember_rs::engine::{Fight, St};
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
