//! G8a: the level-2 heroes Mara (Fighter 2) and Ilyra (Wizard 2) and their
//! mechanics (docs/GENERAL_ENV.md, "G8a Rust mirror"): content as natural20
//! derives it, thrown daggers leaving the hand and the quarterstaff going
//! two-handed, Mage Armor's AC, Sap markers, and fail-closed loading. Exact
//! parity with natural20 is checked by the fixture tapes (`tests/fixtures.rs`).

use ember_rs::content::{embedded_files, AtkAbility, ContentPool, Dice, SpellId};
use ember_rs::effects::{EffKey, ObjKind};
use ember_rs::engine::{Act, Fight, WeaponKind};
use ember_rs::map::Grid;
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;

fn placements(list: &[(&str, i32, i32)]) -> (Vec<String>, Vec<Placement>) {
    (
        list.iter().map(|(id, _, _)| id.to_string()).collect(),
        list.iter().map(|&(id, x, y)| Placement { id: id.into(), x, y }).collect(),
    )
}

fn fight(units: &[(&str, i32, i32)], seed: u64) -> Fight {
    let (ids, pl) = placements(units);
    Fight::on_map(ContentPool::global(), Grid::ember_vault(), &ids, &pl, 50, Trace::free(seed)).unwrap()
}

#[test]
fn level2_heroes_content() {
    let pool = ContentPool::global();
    let mara = pool.template(pool.tid("mara").unwrap());
    assert_eq!((mara.ac, mara.max_hp, mara.init_bonus, mara.wearing_armor), (19, 20, 4, true));
    let sword = &mara.attacks[0];
    assert_eq!((sword.name, sword.to_hit, sword.damage), ("longsword", 5, Dice::new(1, 8, 3)));
    assert!(sword.sap && sword.savage && !sword.gwf && sword.graze.is_none());
    assert_eq!(sword.versatile, Some(Dice::new(1, 10, 0)));
    assert_eq!((mara.second_wind_uses, mara.second_wind_die, mara.action_surge_uses), (2, Dice::new(1, 10, 2), 1));

    let ilyra = pool.template(pool.tid("ilyra").unwrap());
    assert_eq!((ilyra.ac, ilyra.max_hp, ilyra.init_bonus, ilyra.wearing_armor), (12, 14, 4, false));
    let rows: Vec<(&str, bool, i32, i32, i32)> =
        ilyra.attacks.iter().map(|a| (a.name, a.thrown, a.range, a.range_max, a.to_hit)).collect();
    assert_eq!(
        rows,
        vec![
            ("quarterstaff", false, 5, 5, 1),
            ("dagger", false, 5, 5, 4),
            ("dagger", true, 20, 60, 4),
            ("unarmed_attack", false, 5, 5, 1),
        ]
    );
    let thrown = &ilyra.attacks[2];
    assert!(thrown.ranged && thrown.melee_type && thrown.ability == AtkAbility::Finesse);
    assert_eq!(thrown.item, Some(1));
    assert_eq!(
        ilyra.gear.iter().map(|(s, h)| (s.as_ref(), *h)).collect::<Vec<_>>(),
        vec![("quarterstaff", 1.0), ("dagger", 0.5)]
    );
    assert_eq!(ilyra.spares, vec![(1, 1)]);
    let c = ilyra.caster.as_ref().unwrap();
    assert_eq!((c.spell_attack, c.dc, c.slots), (5, 13, [0, 3, 0]));
    assert!(c.spells.contains(&SpellId::MageArmor) && c.reaction_spells == vec![SpellId::Shield]);
    assert_eq!(c.free_casts, vec![SpellId::MagicMissile]);
}

/// The spare dagger goes first, then the held one; without a dagger the
/// dagger rows are gone and the quarterstaff is two-handed (1d8-1).
#[test]
fn thrown_daggers_leave_and_the_staff_goes_two_handed() {
    let mut f = fight(&[("ilyra", 2, 6), ("mara", 3, 6), ("skeleton-1", 12, 4)], 0);
    let i = 0;
    assert_eq!(f.used_hand_slots(i), 1.5);
    assert_eq!(f.attack_numbers(i, 0), (1, Dice::new(1, 6, -1), None));
    assert_eq!(f.attack_numbers(i, 1), (4, Dice::new(1, 4, 2), None));
    assert!((0..4).all(|a| f.attack_available(i, a)));
    f.units[i].spares[0] = 0;
    f.units[i].gear_off |= 1 << 1;
    assert_eq!(f.used_hand_slots(i), 1.0);
    assert!(!f.attack_available(i, 1) && !f.attack_available(i, 2));
    assert_eq!(f.attack_numbers(i, 0), (1, Dice::new(1, 8, -1), None));
    // a scripted fight throws both daggers through the real resolve path
    let (mut spare, mut held, mut fights) = (0, 0, 0);
    for seed in 0..40u64 {
        let mut f = fight(&[("mara", 3, 7), ("ilyra", 2, 6), ("skeleton-1", 12, 2), ("zombie-1", 12, 6)], seed);
        f.prefer = vec!["ilyra:dagger".into()];
        f.run();
        spare += f.notes.thrown_spare;
        held += f.notes.thrown_held;
        if f.notes.thrown_held > 0 {
            fights += 1;
            assert_eq!(f.units[1].gear_off, 1 << 1, "the held dagger left after the spare");
            assert_eq!(f.units[1].spares, vec![0]);
        }
    }
    assert!(spare > 0 && held > 0 && fights > 0, "throws: {spare} spare, {held} held");
}

#[test]
fn mage_armor_sets_the_base_ac_and_only_on_the_unarmored() {
    let mut f = fight(&[("ilyra", 2, 6), ("mara", 3, 6), ("skeleton-1", 12, 4)], 1);
    let (i, m) = (0, 1);
    f.units[i].action = 1;
    let mut cands = Vec::new();
    f.spell_candidates(i, &mut cands);
    let targets: Vec<Vec<usize>> = cands
        .iter()
        .filter_map(|a| match a {
            Act::Spell(c) if c.spell == SpellId::MageArmor => Some(c.targets.clone()),
            _ => None,
        })
        .collect();
    assert_eq!(targets, vec![vec![i]], "Mara wears armor: not a target");
    assert_eq!(f.armor_class(i), 12);
    let obj = f.new_obj(SpellId::MageArmor, ObjKind::Spell, i, vec![i], false);
    f.register_effect(i, EffKey::AcOverride, obj, Some(28800));
    assert_eq!(f.armor_class(i), 15);
    let shield = f.new_obj(SpellId::Shield, ObjKind::Spell, i, vec![i], false);
    f.register_effect(i, EffKey::AcBonus, shield, Some(28800));
    assert_eq!(f.armor_class(i), 20);
    assert_eq!(f.armor_class(m), 19);
}

#[test]
fn sap_gives_disadvantage_to_the_creature_hit() {
    let mut f = fight(&[("mara", 3, 6), ("ilyra", 2, 6), ("skeleton-1", 4, 6)], 2);
    let (m, s) = (0, 2);
    assert_eq!(f.advantage_flags(s, m, WeaponKind::melee()), (false, false));
    f.units[s].sap = Some(m);
    assert_eq!(f.advantage_flags(s, m, WeaponKind::melee()), (false, true));
    assert_eq!(f.advantage_flags(s, 1, WeaponKind::melee()), (false, true), "whoever it attacks");
    // native fights: markers are set, spent by attack rolls and expire
    let mut notes = ember_rs::engine::Notes::default();
    for seed in 0..30u64 {
        let mut f = fight(&[("mara", 3, 7), ("ilyra", 2, 6), ("skeleton-1", 12, 2), ("ghoul-1", 12, 6)], seed);
        f.run();
        notes.add(&f.notes);
    }
    assert!(notes.sap_applied > 0 && notes.sap_spent > 0 && notes.sap_expired > 0, "{notes:?}");
}

#[test]
fn level2_mechanics_fail_closed() {
    let file = |p: &str| embedded_files().iter().find(|(q, _)| *q == p).unwrap().1;
    let vocab = vec![("vocab.json".to_string(), file("vocab.json").to_string())];
    for (id, from, to) in [
        ("mara", "\"sap\"", "\"topple\""),
        ("mara", "\"versatile\": \"1d10\"", "\"versatile\": \"1d10+1\""),
        ("ilyra", "\"ability\": \"finesse\"", "\"ability\": \"dex\""),
        ("ilyra", "\"item\": \"dagger\"", "\"item\": \"sling\""),
        ("ilyra", "\"wearing_armor\": false", "\"wearing_armor\": true"),
    ] {
        let path = format!("srd/{id}.json");
        let text = file(&path);
        let ok = ContentPool::from_sources(&[(path.clone(), text.to_string())], &vocab);
        assert!(ok.is_ok(), "{:?}", ok.err());
        let bad = text.replacen(from, to, 1);
        assert_ne!(bad, text, "pattern {from} not found");
        assert!(ContentPool::from_sources(&[(path, bad)], &vocab).is_err(), "{id}: {from} -> {to} loaded");
    }
}
