//! Fey campaign (12 SRD 5.2.1 creatures, hero remedies, Large+ tree maps,
//! and `ember-gen-v4` schema + encoder bug fixes).

use std::sync::Arc;

use ember_rs::content::{ContentPool, Dice, Dmg, OnHit, SpellId};
use ember_rs::encode::{Obs, Objective, Version, CELLS, F_A_V4, F_C_V4, F_G_V4, MAP_C_V4, N, R, S};
use ember_rs::engine::{Act, Fight, St};
use ember_rs::env::{Controller, Env};
use ember_rs::map::Grid;
use ember_rs::tape::Placement;
use ember_rs::trace::Trace;

const EXT: Controller = Controller::External;
const NAT: Controller = Controller::Native;

fn placements(list: &[(&str, i32, i32)]) -> (Vec<String>, Vec<Placement>) {
    (
        list.iter().map(|(id, _, _)| id.to_string()).collect(),
        list.iter().map(|&(id, x, y)| Placement { id: id.into(), x, y }).collect(),
    )
}

fn grove() -> Arc<Grid> {
    let rows: Vec<String> = [
        "HHHHHHHHHHHHHH",
        "H............H",
        "H............H",
        "H..T......T..H",
        "H............H",
        "H.....TT.....H",
        "H............H",
        "H..T......T..H",
        "H............H",
        "HHHHHHHHHHHHHH",
    ]
    .iter()
    .map(|s| s.to_string())
    .collect();
    Arc::new(Grid::from_rows(&rows).unwrap())
}

fn open_room() -> Arc<Grid> {
    let mut rows = vec!["H".repeat(14)];
    rows.extend((0..8).map(|_| format!("H{}H", ".".repeat(12))));
    rows.push("H".repeat(14));
    Arc::new(Grid::from_rows(&rows).unwrap())
}

fn env_on(grid: Arc<Grid>, units: &[(&str, i32, i32)], seed: u64, ctrls: [Controller; 2]) -> Env {
    let (ids, pl) = placements(units);
    Env::from_units(ContentPool::global(), grid, &ids, &pl, 30, seed, ctrls, true).unwrap()
}

fn unit(f: &Fight, id: &str) -> usize {
    f.units.iter().position(|u| u.id == id).unwrap()
}

#[test]
fn fey_roster_content() {
    let pool = ContentPool::global();
    let expected = [
        ("violet_fungus", 5, 18, 5, "medium"),
        ("giant_wasp", 13, 22, 50, "medium"),
        ("satyr", 13, 31, 40, "medium"),
        ("steam_mephit", 10, 17, 30, "small"),
        ("blink_dog", 13, 22, 40, "medium"),
        ("sprite", 15, 10, 40, "tiny"),
        ("green_hag", 17, 82, 30, "medium"),
        ("bugbear_warrior", 14, 33, 30, "medium"),
        ("dryad", 16, 22, 30, "medium"),
        ("harpy", 11, 38, 40, "medium"),
        ("sea_hag", 14, 52, 30, "medium"),
        ("will_o_wisp", 19, 27, 50, "tiny"),
    ];
    for (id, ac, hp, spd, size) in expected {
        let tid = pool.tid(id).unwrap_or_else(|| panic!("missing creature {id}"));
        let t = pool.template(tid);
        assert_eq!((t.ac, t.max_hp, t.speed, t.size), (ac, hp, spd, size), "{id}");
    }

    let vf = pool.template(pool.tid("violet_fungus").unwrap());
    assert_eq!(vf.blindsight, 30);
    assert_eq!(vf.multiattack, vec![vec!["rotting_touch", "rotting_touch"]]);

    let gw = pool.template(pool.tid("giant_wasp").unwrap());
    assert!(gw.fly && gw.flyby);

    let sat = pool.template(pool.tid("satyr").unwrap());
    assert!(sat.magic_resistance && sat.fey);
    assert!(sat.attacks.iter().any(|a| a.name == "hooves" && a.on_hit.iter().any(|o| matches!(o, OnHit::Push { feet: 10, .. }))));

    let sm = pool.template(pool.tid("steam_mephit").unwrap());
    assert!(sm.fly && sm.blurred_form && sm.death_burst.is_some());
    assert_eq!(sm.area_abilities.len(), 1);
    assert_eq!(sm.area_abilities[0].recharge, Some(6));
    assert_eq!(sm.area_abilities[0].speed_penalty, Some(10));

    let bd = pool.template(pool.tid("blink_dog").unwrap());
    assert_eq!(bd.teleports.len(), 1);
    assert_eq!(bd.teleports[0].recharge, Some(4));
    assert_eq!(bd.teleports[0].range, 40);

    let sp = pool.template(pool.tid("sprite").unwrap());
    assert!(sp.fly && sp.size == "tiny");
    assert!(sp.caster.as_ref().unwrap().at_will.contains(&SpellId::Invisibility));
    assert!(sp.attacks.iter().any(|a| a.name == "enchanting_bow" && a.on_hit.iter().any(|o| matches!(o, OnHit::Charm { .. }))));

    let gh = pool.template(pool.tid("green_hag").unwrap());
    let gh_c = gh.caster.as_ref().unwrap();
    assert!(gh_c.at_will.contains(&SpellId::Invisibility));
    assert!(gh_c.at_will.contains(&SpellId::RayOfSickness));
    assert!(gh_c.spell_levels.contains(&(SpellId::RayOfSickness, 3)));

    let bb = pool.template(pool.tid("bugbear_warrior").unwrap());
    assert!(bb.abduct);
    assert!(bb.attacks.iter().any(|a| a.name == "grab" && a.on_hit.iter().any(|o| matches!(o, OnHit::Grapple { escape_dc: 12, .. }))));

    let dr = pool.template(pool.tid("dryad").unwrap());
    assert!(dr.magic_resistance && dr.teleports.len() == 1 && dr.teleports[0].tree_stride);
    assert!(dr.caster.as_ref().unwrap().at_will.contains(&SpellId::CharmMonster));
    assert!(dr.caster.as_ref().unwrap().free_casts.contains(&SpellId::Entangle));

    let hp = pool.template(pool.tid("harpy").unwrap());
    assert!(hp.fly && hp.luring_song.is_some());
    assert_eq!(hp.luring_song.unwrap().dc, 11);

    let sh = pool.template(pool.tid("sea_hag").unwrap());
    assert!(sh.vile_appearance.is_some());
    assert!(sh.attacks.iter().any(|a| a.name == "death_glare" && a.drop_to_zero_hp_lte == Some(20) && a.recharge == Some(5)));

    let ww = pool.template(pool.tid("will_o_wisp").unwrap());
    assert!(ww.fly && ww.incorporeal && ww.vanish.is_some());
    assert!(ww.immune & Dmg::Lightning.bit() != 0);
    assert!(ww.attacks.iter().any(|a| a.name == "consume_life" && a.bonus_action && a.breaks_invisibility));
    assert_eq!(ww.attacks[0].damage, Dice::new(2, 8, 2));

    // Elf heroes carry Fey Ancestry
    let curogana = pool.template(pool.tid("curogana").unwrap());
    assert!(curogana.elf && curogana.fey_ancestry);
}

#[test]
fn tree_map_and_dryad_tree_stride() {
    let g = grove();
    assert_eq!(g.trees().len(), 6);
    assert!(g.is_tree(3, 3) && g.is_wall(3, 3));
    assert!(!g.is_tree(0, 0) && g.is_wall(0, 0));

    let (ids, pl) = placements(&[("guy", 8, 5), ("dryad-1", 3, 2)]);
    let f = Fight::on_map(ContentPool::global(), Arc::clone(&g), &ids, &pl, 30, Trace::free(1)).unwrap();
    let d = unit(&f, "dryad-1");
    let dests = f.npc_teleport_destinations(d, 0);
    // Dryad at (3, 2) is adjacent to tree (3, 3), which is within 60 ft of all other trees!
    assert!(!dests.is_empty(), "dryad adjacent to tree must have Tree Stride destinations");
    assert!(dests.contains(&(10, 2)), "should reach square adjacent to tree at (10, 3): {dests:?}");
    assert!(!dests.contains(&(3, 2)), "cannot teleport to current square");
    assert!(!dests.contains(&(3, 3)), "cannot teleport into a tree");

    // V4 map channel 17 marks all trees
    let env = env_on(Arc::clone(&g), &[("guy", 8, 5), ("dryad-1", 3, 2)], 1, [EXT, EXT]);
    let obs = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V4).unwrap();
    assert_eq!(obs.map.len(), MAP_C_V4 * CELLS);
    let tree_ch = &obs.map[17 * CELLS..18 * CELLS];
    for &(tx, ty) in g.trees() {
        assert_eq!(tree_ch[ty as usize * S + tx as usize], 1, "missing tree at ({tx}, {ty})");
    }
    assert_eq!(tree_ch[0], 0, "wall (0,0) is not a tree");
}

#[test]
fn v4_schema_and_three_audit_fixes() {
    // 1. Check V4 dims & names strictly extend V2/V3
    let v2 = Version::V2.names();
    let v4 = Version::V4.names();
    assert_eq!((v4.creature.len(), v4.global.len(), v4.cand.len(), v4.map.len()), (F_C_V4, F_G_V4, F_A_V4, MAP_C_V4));
    assert_eq!(&v4.creature[..v2.creature.len()], v2.creature);
    assert_eq!(&v4.global[..v2.global.len()], v2.global);
    assert_eq!(&v4.cand[..v2.cand.len()], v2.cand);
    assert_eq!(&v4.map[..v2.map.len()], v2.map);

    let ci = |n: &str| v4.creature.iter().position(|&x| x == n).unwrap();

    // 2. Fix #1 (Diagonal BFS corner clearing: walls only for BOTH PCs and monsters)
    // Layout: Guy at (2, 2), ally Elion at (3, 2) -> in V2, NoCornerCut wrongly blocks
    // Guy from stepping diagonally to (3, 1) because (3, 2) is occupied by Elion (not a wall!).
    // And a wall at (2, 3): a monster at (3, 3) cannot cut around wall (2, 3) to (2, 4) in V4.
    let rows: Vec<String> = [
        "HHHHHHHH",
        "H......H",
        "H......H",
        "H.H....H",
        "H......H",
        "HHHHHHHH",
    ]
    .iter()
    .map(|s| s.to_string())
    .collect();
    let grid = Arc::new(Grid::from_rows(&rows).unwrap());
    let mut env = env_on(
        grid,
        &[("guy", 2, 2), ("elion", 3, 2), ("goblin_warrior-1", 3, 3)],
        7,
        [EXT, EXT],
    );
    // Advance until Guy acts
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        let k = env.decision().unwrap().legal.len();
        env.step(k - 1).unwrap();
    }
    let o_v2 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V2).unwrap();
    let o_v4 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V4).unwrap();
    let path_v2 = o_v2.map[13 * CELLS + 1 * S + 3];
    let path_v4 = o_v4.map[13 * CELLS + 1 * S + 3];
    assert_eq!(path_v2, 2, "V2 NoCornerCut takes 2 steps around ally Elion at (3,2)");
    assert_eq!(path_v4, 1, "V4 ClearWallCorner steps diagonally to (3,1) in 1 step (no wall at corner)");

    // Advance until goblin acts: wall at (2, 3), goblin at (3, 3) -> diagonal to (2, 4) cuts wall corner!
    while env.fight.units[env.decision().unwrap().actor].id != "goblin_warrior-1" {
        let k = env.decision().unwrap().legal.len();
        env.step(k - 1).unwrap();
    }
    let m_v2 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V2).unwrap();
    let m_v4 = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V4).unwrap();
    assert_eq!(m_v2.map[13 * CELLS + 4 * S + 2], 1, "V2 AnyDiagonal cut wall corner (2,3)");
    assert_eq!(m_v4.map[13 * CELLS + 4 * S + 2], 2, "V4 ClearWallCorner refuses to cut wall corner (2,3)");

    // 3. Fix #2 & Fix #3 (multiattack_left_div3 + attacks_per_action / dpr excluding non-damaging slots)
    // Dryad has multiattack [["vine_lash", "charm_monster"], ["thorn_burst", "charm_monster"]]:
    // - 2 slots in combo -> V4 multiattack_left_div3 = 2/3 (V2 read max group len = 3/3 because
    //   vine_lash, thorn_burst, and charm_monster all share group 1!)
    // - only 1 damaging slot -> V4 attacks_per_action_div3 = 1/3 (V2 read 2/3, doubling DPR!)
    let mut env_d = env_on(grove(), &[("guy", 6, 4), ("dryad-1", 4, 4)], 11, [EXT, EXT]);
    while env_d.fight.units[env_d.decision().unwrap().actor].id != "dryad-1" {
        let k = env_d.decision().unwrap().legal.len();
        env_d.step(k - 1).unwrap();
    }
    let di = unit(&env_d.fight, "dryad-1");
    let d_v2 = Obs::of_version(&env_d, None, (0, 0), &Objective::default(), Version::V2).unwrap();
    let d_v4 = Obs::of_version(&env_d, None, (0, 0), &Objective::default(), Version::V4).unwrap();
    let fc2 = Version::V2.creature();
    let fc4 = Version::V4.creature();
    let v2_ma_left = d_v2.creatures[di * fc2 + ci("multiattack_left_div3")];
    let v4_ma_left = d_v4.creatures[di * fc4 + ci("multiattack_left_div3")];
    assert!((v2_ma_left - 1.0).abs() < 1e-5, "V2 preserved overcount (3/3): {v2_ma_left}");
    assert!((v4_ma_left - 2.0 / 3.0).abs() < 1e-5, "V4 exact combo len (2/3): {v4_ma_left}");
    let v2_apa = d_v2.creatures[di * fc2 + ci("attacks_per_action_div3")];
    let v4_apa = d_v4.creatures[di * fc4 + ci("attacks_per_action_div3")];
    assert!((v2_apa - 2.0 / 3.0).abs() < 1e-5, "V2 preserved: {v2_apa}");
    assert!((v4_apa - 1.0 / 3.0).abs() < 1e-5, "V4 excludes non-damaging charm_monster: {v4_apa}");
    let v2_dpr = d_v2.creatures[di * fc2 + ci("dpr_vs_ac14_div20")];
    let v4_dpr = d_v4.creatures[di * fc4 + ci("dpr_vs_ac14_div20")];
    assert!(v4_dpr > 0.0 && (v2_dpr - 2.0 * v4_dpr).abs() < 1e-4, "V2={v2_dpr}, V4={v4_dpr}");

    // V4 traits on Dryad
    assert_eq!(d_v4.creatures[di * fc4 + ci("magic_resistance")], 1.0);
    assert_eq!(d_v4.creatures[di * fc4 + ci("size_tiny")], 0.0);
}

#[test]
fn hero_remedies_and_flyby_and_abduct() {
    // FirstAid offered when ally is dying & adjacent
    let mut env = env_on(open_room(), &[("guy", 3, 4), ("chruna", 4, 4), ("violet_fungus-1", 10, 4)], 3, [EXT, EXT]);
    while env.fight.units[env.decision().unwrap().actor].id != "guy" {
        let k = env.decision().unwrap().legal.len();
        env.step(k - 1).unwrap();
    }
    let c = unit(&env.fight, "chruna");
    let g = unit(&env.fight, "guy");
    env.fight.units[c].hp = 0;
    env.fight.units[c].statuses.push(St::Unconscious);
    let rows = env.fight.clone().external_decision(g, false, 0).legal;
    assert!(rows.iter().any(|a| matches!(a, Act::FirstAid { target } if *target == c)), "Guy should see FirstAid for dying Chruna");

    // Giant Wasp Flyby: provokes 0 opportunity attacks when leaving Guy's reach
    let (ids, pl) = placements(&[("guy", 5, 5), ("giant_wasp-1", 6, 5)]);
    let f = Fight::on_map(ContentPool::global(), open_room(), &ids, &pl, 30, Trace::free(2)).unwrap();
    let w = unit(&f, "giant_wasp-1");
    assert!(f.opportunity_attacks(w, &[(6, 5), (7, 5)]).is_empty(), "Giant Wasp Flyby must not provoke OAs");

    // Bugbear Abduct: no drag penalty while grappling a Medium creature
    let mut env2 = env_on(open_room(), &[("guy", 5, 5), ("bugbear_warrior-1", 6, 5)], 2, [EXT, EXT]);
    while env2.fight.units[env2.decision().unwrap().actor].id != "guy" {
        let k = env2.decision().unwrap().legal.len();
        env2.step(k - 1).unwrap();
    }
    let g2 = unit(&env2.fight, "guy");
    let b2 = unit(&env2.fight, "bugbear_warrior-1");
    env2.fight.units[b2].grappling.push(g2);
    env2.fight.units[g2].grappled_by.push((b2, Some(12)));
    env2.fight.units[g2].statuses.push(St::Grappled);
    assert!(!env2.fight.drag_penalty(b2), "Bugbear Abduct has no drag penalty");
    let rows2 = env2.fight.clone().external_decision(g2, false, 0).legal;
    assert!(rows2.iter().any(|a| matches!(a, Act::EscapeGrapple { target } if *target == b2)), "Grappled Guy must see EscapeGrapple");
}

#[test]
fn native_fey_shakedown_all_twelve_creatures() {
    let rosters: &[&[&str]] = &[
        &["violet_fungus-1", "violet_fungus-2"],
        &["giant_wasp-1", "giant_wasp-2"],
        &["satyr-1", "satyr-2"],
        &["steam_mephit-1", "steam_mephit-2"],
        &["blink_dog-1", "blink_dog-2"],
        &["sprite-1", "sprite-2"],
        &["green_hag-1"],
        &["bugbear_warrior-1", "bugbear_warrior-2"],
        &["dryad-1", "dryad-2"],
        &["harpy-1", "harpy-2"],
        &["sea_hag-1", "will_o_wisp-1"],
        &["will_o_wisp-1", "will_o_wisp-2"],
    ];
    let g = grove();
    for (ri, monsters) in rosters.iter().enumerate() {
        for seed in 0..8u64 {
            let mut list: Vec<(&str, i32, i32)> = vec![("guy", 2, 4), ("elion", 2, 5), ("ilyra_l3", 2, 6)];
            for (mi, &m) in monsters.iter().enumerate() {
                list.push((m, 11, 3 + mi as i32 * 2));
            }
            let (ids, pl) = placements(&list);
            let mut env = Env::from_units(
                ContentPool::global(),
                Arc::clone(&g),
                &ids,
                &pl,
                30,
                1000 * ri as u64 + seed,
                [EXT, NAT],
                true,
            )
            .unwrap();
            let mut steps = 0;
            while let Some(d) = env.decision() {
                let obs = Obs::of_version(&env, None, (0, 0), &Objective::default(), Version::V4).unwrap();
                assert_eq!(obs.creatures.len(), N * F_C_V4);
                assert_eq!(obs.creature_rel.len(), N * N * R);
                assert!(obs.creatures.iter().all(|x| x.is_finite()), "non-finite creature feature");
                assert!(obs.global.iter().all(|x| x.is_finite()), "non-finite global feature");
                assert!(obs.cands.iter().all(|x| x.is_finite()), "non-finite cand feature");
                let act_i = d.native_choice.unwrap_or(d.legal.len() - 1);
                env.step(act_i).unwrap();
                steps += 1;
                assert!(steps < 600, "stuck loop on roster {ri} seed {seed}");
            }
        }
    }
}
