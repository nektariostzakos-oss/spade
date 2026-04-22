import json
import os
import shutil
import zipfile
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "demo"

DEMO_ZIP = ROOT / "spade-nextjs.zip"
DEMO_TGZ = ROOT / "spade-nextjs.tar.gz"
CLEAN_ZIP = ROOT / "spade-nextjs-clean.zip"
CLEAN_TGZ = ROOT / "spade-nextjs-clean.tar.gz"

INCLUDE_FILES = [
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "next-env.d.ts",
    "DEPLOY.md",
    "README.md",
]

# Blank defaults for a clean-install data folder.
CLEAN_DATA = {
    "bookings.json": [],
    "orders.json": [],
    "products.json": [],
    "users.json": [],
    "content.json": {},
    "settings.json": {"onboarded": False},
    "emails.log.json": [],
    "clients.json": [],
    "views.json": [],
    "audit.json": [],
    "waitlist.json": [],
    "reviews.json": [],
    "coupons.json": [],
    "pages.json": [],
    "blog-categories.json": [],
    "services.json": [],
    "staff.json": [],
    "holidays.json": [],
    "install-stats.json": {"total": 0, "recent": []},
}


def reset(stage: Path):
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir()


def copy_code(stage: Path):
    # src + config files
    shutil.copytree(SRC / "src", stage / "src")
    for name in INCLUDE_FILES:
        src = SRC / name
        if src.exists():
            shutil.copy2(src, stage / name)
    # public minus uploads
    pub_dst = stage / "public"
    pub_dst.mkdir()
    for child in (SRC / "public").iterdir():
        if child.name == "uploads":
            continue
        if child.is_dir():
            shutil.copytree(child, pub_dst / child.name)
        else:
            shutil.copy2(child, pub_dst / child.name)
    (pub_dst / "uploads").mkdir()
    (pub_dst / "uploads" / ".gitkeep").write_text("Uploaded images land here.\n")
    # demos bundle — template definitions used by the setup wizard
    demos_src = SRC / "demos"
    if demos_src.exists():
        shutil.copytree(demos_src, stage / "demos")


def write_clean_data(stage: Path):
    d = stage / "data"
    d.mkdir()
    for name, value in CLEAN_DATA.items():
        (d / name).write_text(json.dumps(value, indent=2, ensure_ascii=False))


def write_demo_data(stage: Path):
    """
    Demo ZIP = CLEAN defaults + canonical showcase overlay from
    demos/barber/data/. Single source of truth: the wizard reads from the
    same folder when you pick "demo" mode, so the ZIP you download and the
    wizard's demo option produce identical seeded sites.
    """
    d = stage / "data"
    d.mkdir()
    for name, value in CLEAN_DATA.items():
        (d / name).write_text(json.dumps(value, indent=2, ensure_ascii=False))

    showcase = SRC / "demos" / "barber" / "data"
    if showcase.exists():
        for child in showcase.iterdir():
            if child.is_file() and child.suffix == ".json":
                shutil.copy2(child, d / child.name)


def build_zip(stage: Path, out: Path):
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(stage):
            rel_dir = Path(dirpath).relative_to(stage)
            for dn in dirnames:
                arc = (rel_dir / dn).as_posix() + "/"
                info = zipfile.ZipInfo(arc)
                info.external_attr = (0o40755 << 16) | 0x10
                zf.writestr(info, "")
            for fn in filenames:
                full = Path(dirpath) / fn
                arc = (rel_dir / fn).as_posix()
                info = zipfile.ZipInfo(arc)
                info.external_attr = 0o100644 << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(info, full.read_bytes())


def build_tgz(stage: Path, out: Path):
    if out.exists():
        out.unlink()
    def _filter(ti):
        ti.mode = 0o755 if ti.isdir() else 0o644
        ti.uid = 0
        ti.gid = 0
        ti.uname = ""
        ti.gname = ""
        return ti
    with tarfile.open(out, "w:gz") as tf:
        for child in sorted(stage.iterdir()):
            tf.add(child, arcname=child.name, filter=_filter)


# Demo variant — clean base + canonical showcase overlay (single source of
# truth: demo/demos/barber/data/, which is also what the wizard reads from
# in demo mode).
demo_stage = ROOT / ".zip-stage-demo"
reset(demo_stage)
copy_code(demo_stage)
write_demo_data(demo_stage)
build_zip(demo_stage, DEMO_ZIP)
build_tgz(demo_stage, DEMO_TGZ)
shutil.rmtree(demo_stage)
print(f"Built: {DEMO_ZIP.name}  {DEMO_ZIP.stat().st_size:>8} bytes  (showcase)")
print(f"Built: {DEMO_TGZ.name}  {DEMO_TGZ.stat().st_size:>8} bytes  (showcase)")

# Clean variant — same code, blank data → wizard runs on first /admin login
clean_stage = ROOT / ".zip-stage-clean"
reset(clean_stage)
copy_code(clean_stage)
write_clean_data(clean_stage)
build_zip(clean_stage, CLEAN_ZIP)
build_tgz(clean_stage, CLEAN_TGZ)
shutil.rmtree(clean_stage)
print(f"Built: {CLEAN_ZIP.name}  {CLEAN_ZIP.stat().st_size:>8} bytes  (clean install)")
print(f"Built: {CLEAN_TGZ.name}  {CLEAN_TGZ.stat().st_size:>8} bytes  (clean install)")
