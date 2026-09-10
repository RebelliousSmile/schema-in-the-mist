from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[4]
FONT = ROOT / "handbook" / "legend-in-the-mist" / "assets" / "fonts" / "pragroman.ttf"
OUTPUT = Path(__file__).with_name("pragroman-specimen.png")

image = Image.new("RGB", (1800, 1050), "#f3efe7")
draw = ImageDraw.Draw(image)
label = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
font_large = ImageFont.truetype(FONT, 116)
font_medium = ImageFont.truetype(FONT, 72)

draw.text((55, 35), "PragRoman — fichier actuellement publié", font=label, fill="#6c6259")
draw.text((55, 105), "LEGEND IN THE MIST", font=font_large, fill="#171310")
draw.text((55, 255), "LA COURONNE BRISÉE", font=font_large, fill="#171310")
draw.text((55, 430), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", font=font_medium, fill="#171310")
draw.text((55, 550), "abcdefghijklmnopqrstuvwxyz", font=font_medium, fill="#171310")
draw.text((55, 670), "Épreuves, Voyages & Grandeur — 0123456789", font=font_medium, fill="#171310")
draw.text((55, 805), "Aa Gg Jj Qq Rr Ss Ww", font=font_large, fill="#171310")

image.save(OUTPUT)
print(OUTPUT)
