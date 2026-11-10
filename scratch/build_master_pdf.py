# Master PDF Builder Script
import os
import sys

# Ensure local scratch directory is in python module path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate
from pdf_styles import NumberedCanvas, PAGE_CONTENT_WIDTH
from pdf_part1_to_6 import build_part1_to_6
from pdf_part7_to_12 import build_part7_to_12
from pdf_part13_to_18 import build_part13_to_18
from pdf_part19_to_24 import build_part19_to_24

def generate_complete_pdf():
    pdf_filename = "R:\\SSG\\website\\SSK_Natural_Gold_Complete_Project_Documentation.pdf"
    
    print("Initializing PDF document template...")
    # Letter size: 612 x 792. With leftMargin=42, rightMargin=42 -> content width = 528pt.
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=42,
        rightMargin=42,
        topMargin=54,
        bottomMargin=54
    )

    story = []
    
    print("Compiling Parts 1 to 6...")
    story.extend(build_part1_to_6())
    
    print("Compiling Parts 7 to 12...")
    story.extend(build_part7_to_12())
    
    print("Compiling Parts 13 to 18...")
    story.extend(build_part13_to_18())
    
    print("Compiling Parts 19 to 24 & Glossary...")
    story.extend(build_part19_to_24())

    print(f"Building master PDF document with {len(story)} flowable elements...")
    doc.build(story, canvasmaker=NumberedCanvas)
    
    file_size = os.path.getsize(pdf_filename)
    print(f"Master PDF generated successfully!")
    print(f"File Path: {pdf_filename}")
    print(f"File Size: {file_size / 1024:.2f} KB ({file_size} bytes)")

if __name__ == "__main__":
    generate_complete_pdf()
