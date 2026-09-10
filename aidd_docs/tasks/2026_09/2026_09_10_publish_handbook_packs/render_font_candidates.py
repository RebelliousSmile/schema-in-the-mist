import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CANDIDATES = Path(sys.argv[1])
OUTPUT = Path(__file__).with_name("font-candidates.png")
ROOT = Path(__file__).resolve().parents[4]
REFERENCE = ROOT / "handbook" / "legend-in-the-mist" / "assets" / "fonts" / "pragroman.ttf"

fonts = [("PragRoman — référence", REFERENCE)]
fonts.extend((path.stem, path) for path in sorted(CANDIDATES.glob("*.ttf")))

width = 1800
row_height = 172
image = Image.new("RGB", (width, 70 + row_height * len(fonts)), "#f3efe7")
draw = ImageDraw.Draw(image)
label_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
note_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)

draw.text((40, 20), "Comparaison à taille nominale identique — fontes OFL", font=label_font, fill="#655c54")
for index, (name, path) in enumerate(fonts):
    y = 70 + index * row_height
    font = ImageFont.truetype(path, 64)
    draw.line((30, y, width - 30, y), fill="#d4ccc1", width=1)
    draw.text((40, y + 18), name, font=note_font, fill="#756a61")
    draw.text((350, y + 2), "LEGEND IN THE MIST", font=font, fill="#171310")
    draw.text((350, y + 82), "La Couronne brisée — Aa Gg Qq Rr Ww", font=font, fill="#171310")

image.save(OUTPUT)
print(OUTPUT)
