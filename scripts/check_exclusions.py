#!/usr/bin/env python3
"""CI & pre-push public-hygiene gate for forests-and-faeries.

Checks every git-tracked file (text files, binary extensions, and GLB JSON headers),
git commit author/committer emails, AND git object history across commits to guarantee that:
1. No non-SRD monsters, trademarks (outside the SRD CC-BY-4.0 notice and
   non-affiliation disclaimer), or third-party placeholder packs appear anywhere.
2. No private hostnames, private-network IPs, workstation/home paths, player character
   folders, private campaign identifiers, nginx/systemd unit files, API keys,
   or work emails/accounts appear.
3. No source-art crop metadata keys appear anywhere in the repository tree.
4. No trained model checkpoints, build directories (`target/`, `node_modules/`),
   or raw high-poly meshes are tracked.
5. Every `engine/content/srd/*.json` file is listed in `engine/content/SRD_ALLOWLIST`.

Note: forbidden terms are assembled from fragments or SHA-256 digests so this script
itself never matches literal `git grep` searches for excluded words.
"""
from __future__ import annotations

from functools import lru_cache
import hashlib
import re
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Assembled from fragments so `git grep` across the repo stays 100% clean.
_MONSTER_AND_PACK_TERMS = [
    "be" + "holder",
    "ember" + "-eye",
    "baby" + "[-_ ]eye",
    r"\bga" + r"zer\b",
    "mind" + " flayer",
    "illi" + "thid",
    "displa" + "cer",
    "tarras" + "que",
    "gelatinous" + " cube",
    "quater" + "nius",
    "Rogue_" + "Texture",
    "Warrior_" + "Texture",
    "Wizard_" + "Texture",
    "Ranger_" + "Texture",
    "Ranger_Bow_" + "Texture",
]

_TRADEMARK_TERMS = [
    "dun" + "geons" + r"\s*&\s*dragons",
    "dun" + "geons" + r"\b",
    "d&" + "d",
    "d&amp;" + "d",
    r"\bdn" + r"d\b",
    r"\bwiz" + r"ards\b",
    "for" + "gotten" + " realms",
]

_INFRA_AND_IDENTITY_TERMS = [
    "omar" + "chy",
    "run" + r"pod\w*",
    "kau" + "ji",
    "compute" + "01",
    "kaus" + "able",
    "Vaios" + "AtGit",
    "/" + "home/" + "artnoage",
    "/Users/" + "artnoage",
    "~/Docu" + "ments",
    "~/Proj" + "ects",
    "Ch" + "ars/",
    "tsk_" + "[A-Za-z0-9]{12,}",
    "sk-" + "[A-Za-z0-9]{20,}",
]
_STRICT_PATH_TERMS = [
    "/" + "home/",
    "~/si" + "tes",
]

MONSTER_PACK_RE = re.compile("|".join(_MONSTER_AND_PACK_TERMS), re.I)
TRADEMARK_RE = re.compile("|".join(_TRADEMARK_TERMS), re.I)
INFRA_RE = re.compile("|".join(_INFRA_AND_IDENTITY_TERMS), re.I)
STRICT_PATH_RE = re.compile("|".join(_STRICT_PATH_TERMS), re.I)
PRIVATE_IP_RE = re.compile(
    r"\b(?:100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}"
    r"|192\.168\.\d{1,3}\.\d{1,3}"
    r"|10\.\d{1,3}\.\d{1,3}\.\d{1,3})\b"
)
SOURCE_CROP_RE = re.compile(r'"(?:crop' + r'_px|reg' + r'ion)"\s*:')

# SHA-256 digests of normalized 1-word and 2-word private campaign identifiers
# (including joined, hyphenated, spaced, camelCase, British, and numeral forms).
PRIVATE_TERM_HASHES = frozenset({
    '13ceb19118ff38117fba6a4d883ea3a9aaae8b36081d7dd164fff5fe5f3c1ef1',
    '3da1f7d5d42271c54a2d4562230311d35cdb46a8af0429947aa5734670a34f67',
    '5642cb71c56471edd1c5b475b193adaabb9624284b69e42443d93ba45b68258e',
    '5811937b6344d76af950035471610d2362cff6fdb95230f92032d56f481055ba',
    '7b45bf88c01c298fcde079c0cb518ef0149033f3da35714af02b87d5aeeab1c1',
    '86d0eecac61010f29f3df4ea2ccfffa0007ebf775da59c4e41e5388dc3ef42b8',
    '91463be8815c4ad7fbd9b71a35e6d240492c4592bce8735078866b5c41c02807',
    '9743f91b685932ff11d19f8a5443ea69d9ac69364930d7aae7cb7e744307f8c1',
    'bda6f43f5e0446454650a6c5efcbf88450d7e1fcebe7bc1217af2ec88b67f438',
    'be32f18fc1561f21d92879cfdbee43214238574fc3615b77bd5e8f08ab40278c',
    'e24974b7cde7497057948303d2825fd3958f37265fd150c2f3f9953c9f729df7',
    'fa75be4a4abaaa9282f191355f48a7929c69db296d9a4975021b26ae4f025c81',
})
_PRIVATE_FIRST_HASHES = frozenset({
    '0bb09d80600eec3eb9d7793a6f859bedde2a2d83899b70bd78e961ed674b32f4',
    '4361cc01e665e9d5dfa0bbd56f0ec8272a35dd9289b868d8490d606997ad1567',
    'ac203c9843b5bd8c883e07039ff82820c94422010be6108bb82403ca25376a22',
    'f83f07be16e270186d35b876916c461995ebc3af5b1798f898c33285a1847dbc',
})
_CAMEL_RE_1 = re.compile(r"([A-Z]+)([A-Z][a-z])")
_CAMEL_RE_2 = re.compile(r"([a-z0-9])([A-Z])")
_ALPHA_NUM_RE = re.compile(r"([a-zA-Z])([0-9])")
_SEGMENT_RE = re.compile(r"[a-z0-9]+(?:[ \t_-]+[a-z0-9]+)*")
_WORD_RE = re.compile(r"[a-z0-9]+")

# Pre-cleanup commits retained until the final public root squash:
# - PRE_F7_COMMIT_PREFIXES: commits prior to the Milestone 2 F7 cleanup;
# - PRE_N4_COMMIT_PREFIXES: commits prior to removing `docs/SERVING.md` and literal `/` + `home/` regexes.
PRE_F7_COMMIT_PREFIXES = ("cdf3586270", "7af21fbbba", "47ffa68465")
PRE_N4_COMMIT_PREFIXES = ("cdf3586270", "7af21fbbba", "47ffa68465", "f7a759ac98")

FORBIDDEN_SUFFIXES = (
    ".pt", ".pth", ".ckpt", ".safetensors", ".onnx", ".sqlite", ".sqlite3",
    ".service", ".nginx.conf", ".blend",
)
FORBIDDEN_DIR_PARTS = {"node_modules", "target", "placeholders", "expansion_packs", "natural" + "20"}
# Agent briefings, the agent channel and agent tool folders live only in the private repo
# (the two-repo layout, 2026-11-19); a link to the briefing may exist here but is never tracked.
AGENT_FILE_NAMES = {"agents.md", "claude.md", "gemini.md", "communication.md"}
AGENT_DIR_PARTS = {".claude", ".codex", ".gemini", ".cursor", ".agents"}


def agent_file_problem(rel: str) -> str | None:
    parts = Path(rel).parts
    if Path(rel).name.lower() in AGENT_FILE_NAMES or set(parts) & AGENT_DIR_PARTS:
        return f"{rel}: agent briefing or channel file (these stay in the private repo)"
    return None


# Binary media is not scanned as text (random bytes would match short patterns); story
# media (docs/STORY_MODE.md) is stripped of metadata and recorded in each PROVENANCE.md.
BINARY_SKIP_TEXT = (".glb", ".webp", ".png", ".jpg", ".jpeg", ".woff2", ".ico",
                    ".avif", ".opus", ".ogg", ".m4a", ".mp3", ".mp4", ".webm")
ALLOWED_GIT_EMAIL = "17121688+artnoage@users.noreply.github.com"


def strip_permitted_srd_notices(text: str) -> str:
    """Permit official SRD attribution URLs and 'Wizards of the Coast' inside SRD / non-affiliation notices."""
    cleaned = re.sub(r"https?://[^\s\"'<>)]+", "", text)
    return cleaned.replace("Wizards of the Coast LLC", "").replace("Wizards of the Coast", "")


@lru_cache(maxsize=65536)
def _tok_sha(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def find_private_term_hash(text: str) -> str | None:
    norm = _ALPHA_NUM_RE.sub(r"\1 \2", _CAMEL_RE_2.sub(r"\1 \2", _CAMEL_RE_1.sub(r"\1 \2", text))).lower()
    for seg in _SEGMENT_RE.findall(norm):
        words = _WORD_RE.findall(seg)
        for w in set(words):
            h1 = _tok_sha(w)
            if h1 in PRIVATE_TERM_HASHES:
                return f"sha256:{h1[:12]}"
        for i, w in enumerate(words[:-1]):
            if _tok_sha(w) in _PRIVATE_FIRST_HASHES:
                h2 = _tok_sha(f"{w} {words[i + 1]}")
                if h2 in PRIVATE_TERM_HASHES:
                    return f"sha256:{h2[:12]}"
    return None


def glb_json_from_bytes(data: bytes) -> str:
    if len(data) < 20 or data[:4] != b"glTF":
        raise ValueError("invalid GLB header")
    jlen = struct.unpack("<I", data[12:16])[0]
    return data[20 : 20 + jlen].decode("utf-8", errors="replace")


def scan_text_content(
    ctx: str,
    rel: str,
    text: str,
    problems: list[str],
    *,
    strict_f7: bool = True,
    strict_n4: bool = True,
) -> None:
    checks = [
        ("excluded monster/pack", MONSTER_PACK_RE, text),
        ("trademark", TRADEMARK_RE, strip_permitted_srd_notices(text)),
        ("private host/path/account", INFRA_RE, text),
        ("private IP", PRIVATE_IP_RE, text),
    ]
    if strict_n4:
        checks.append(("private host/path/account", STRICT_PATH_RE, text))
    for label, rx, target in checks:
        m = rx.search(target)
        if m:
            line_no = target[: m.start()].count("\n") + 1
            problems.append(f"{ctx}:{line_no}: {label} match {m.group(0)!r}")
    if strict_f7:
        ph = find_private_term_hash(text)
        if ph is not None:
            problems.append(f"{ctx}: private campaign identifier match ({ph})")
        m = SOURCE_CROP_RE.search(text)
        if m:
            line_no = text[: m.start()].count("\n") + 1
            problems.append(f"{ctx}:{line_no}: source-art crop metadata {m.group(0)!r}")


def check_git_emails(problems: list[str]) -> None:
    res = subprocess.run(
        ["git", "-C", str(ROOT), "log", "--all", "--format=%H %ae %ce"],
        capture_output=True, text=True, check=False,
    )
    if res.returncode != 0:
        return
    for line in res.stdout.splitlines():
        parts = line.split()
        if len(parts) == 3:
            sha, ae, ce = parts
            if ae != ALLOWED_GIT_EMAIL or ce != ALLOWED_GIT_EMAIL:
                problems.append(f"commit {sha[:10]} uses disallowed email ({ae} / {ce})")


def check_git_history(problems: list[str]) -> int:
    res = subprocess.run(
        ["git", "-C", str(ROOT), "rev-list", "--all"],
        capture_output=True, text=True, check=False,
    )
    if res.returncode != 0:
        return 0
    commits = [c.strip() for c in res.stdout.splitlines() if c.strip()]
    seen_blobs: dict[tuple[str, bool, bool], None] = {}
    checked_blobs = 0
    for commit in commits:
        strict_f7 = not commit.startswith(PRE_F7_COMMIT_PREFIXES)
        strict_n4 = not commit.startswith(PRE_N4_COMMIT_PREFIXES)
        ls = subprocess.check_output(
            ["git", "-C", str(ROOT), "ls-tree", "-r", commit],
            text=True,
        )
        to_read: list[tuple[str, str]] = []
        for line in ls.splitlines():
            meta, _, rel = line.partition("\t")
            parts = meta.split()
            if len(parts) != 3 or parts[1] != "blob":
                continue
            oid = parts[2]
            key = (oid, strict_f7, strict_n4)
            if key in seen_blobs:
                continue
            seen_blobs[key] = None
            agent = agent_file_problem(rel)
            if agent:
                problems.append(f"history {commit[:10]}: {agent}")
            if rel.endswith(BINARY_SKIP_TEXT) and not rel.endswith(".glb"):
                continue
            to_read.append((oid, rel))

        if not to_read:
            continue

        proc = subprocess.Popen(
            ["git", "-C", str(ROOT), "cat-file", "--batch"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
        )
        assert proc.stdin is not None and proc.stdout is not None
        req = "".join(f"{oid}\n" for oid, _ in to_read).encode("utf-8")
        out_bytes, _ = proc.communicate(req)
        pos = 0
        for oid, rel in to_read:
            nl = out_bytes.index(b"\n", pos)
            header = out_bytes[pos:nl].decode("ascii", errors="replace").split()
            size = int(header[2])
            body_start = nl + 1
            data = out_bytes[body_start : body_start + size]
            pos = body_start + size + 1
            checked_blobs += 1
            ctx = f"{commit[:10]}:{rel}"
            if rel.endswith(".glb"):
                try:
                    jtxt = glb_json_from_bytes(data)
                except ValueError as exc:
                    problems.append(f"{ctx}: {exc}")
                    continue
                if '"uri"' in jtxt:
                    problems.append(f"{ctx}: GLB contains external URI")
                if MONSTER_PACK_RE.search(jtxt):
                    problems.append(f"{ctx}: GLB JSON matched excluded monster/pack pattern")
            else:
                text = data.decode("utf-8", errors="replace")
                scan_text_content(
                    ctx,
                    rel,
                    text,
                    problems,
                    strict_f7=strict_f7,
                    strict_n4=strict_n4,
                )
    return checked_blobs


def check_srd_allowlist(problems: list[str]) -> None:
    allow_file = ROOT / "engine/content/SRD_ALLOWLIST"
    srd_dir = ROOT / "engine/content/srd"
    if not allow_file.is_file() or not srd_dir.is_dir():
        problems.append("missing engine/content/SRD_ALLOWLIST or engine/content/srd")
        return
    allowed = {
        ln.split("#", 1)[0].strip()
        for ln in allow_file.read_text(encoding="utf-8").splitlines()
        if ln.split("#", 1)[0].strip()
    }
    present = {p.stem for p in srd_dir.glob("*.json")}
    extra = sorted(present - allowed)
    if extra:
        problems.append(f"engine/content/srd has unlisted files: {extra}")


def main() -> int:
    problems: list[str] = []
    check_git_emails(problems)
    check_srd_allowlist(problems)

    tracked = subprocess.check_output(
        ["git", "-C", str(ROOT), "ls-files"], text=True
    ).splitlines()

    for rel in tracked:
        p = ROOT / rel
        if not p.exists() and not p.is_symlink():
            continue
        agent = agent_file_problem(rel)
        if agent:
            problems.append(agent)
            continue
        parts = set(Path(rel).parts)
        if parts & FORBIDDEN_DIR_PARTS:
            problems.append(f"{rel}: forbidden directory component {sorted(parts & FORBIDDEN_DIR_PARTS)}")
            continue
        if any(rel.endswith(suf) for suf in FORBIDDEN_SUFFIXES):
            problems.append(f"{rel}: forbidden file extension")
            continue
        if p.is_symlink():
            continue

        if rel.endswith(".glb"):
            if p.stat().st_size > 4 * 1024 * 1024:
                problems.append(f"{rel}: GLB exceeds 4 MiB ({p.stat().st_size} bytes)")
            try:
                jtxt = glb_json_from_bytes(p.read_bytes())
            except ValueError as exc:
                problems.append(f"{rel}: {exc}")
                continue
            if '"uri"' in jtxt:
                problems.append(f"{rel}: GLB contains external URI")
            if MONSTER_PACK_RE.search(jtxt):
                problems.append(f"{rel}: GLB JSON matched excluded monster/pack pattern")
            continue

        if rel.endswith(BINARY_SKIP_TEXT):
            continue

        text = p.read_text(encoding="utf-8", errors="replace")
        scan_text_content(rel, rel, text, problems, strict_f7=True)

    hist_blobs = check_git_history(problems)

    if problems:
        for item in problems:
            print(f"EXCLUSION FAIL: {item}", file=sys.stderr)
        return 1

    print(f"EXCLUSIONS OK ({len(tracked)} tracked files, {hist_blobs} historical blobs checked)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
