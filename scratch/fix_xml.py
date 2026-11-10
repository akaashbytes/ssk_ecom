# Script to fix unescaped XML in scratch parts
import sys

def fix_all():
    # Fix pdf_part1_to_6.py
    with open('R:/SSG/website/scratch/pdf_part1_to_6.py', 'r', encoding='utf-8') as f:
        t1 = f.read()
    t1 = t1.replace("(<Link to='/...'> or useNavigate())", "(&lt;Link to='/...'&gt; or useNavigate())")
    with open('R:/SSG/website/scratch/pdf_part1_to_6.py', 'w', encoding='utf-8') as f:
        f.write(t1)
    print("Fixed pdf_part1_to_6.py")

    # Fix pdf_part13_to_18.py
    with open('R:/SSG/website/scratch/pdf_part13_to_18.py', 'r', encoding='utf-8') as f:
        t2 = f.read()
    t2 = t2.replace("<Route path='/my-new-page' element={<MyNewPage />} /> inside AppRoutes", "&lt;Route path='/my-new-page' element={&lt;MyNewPage /&gt;} /&gt; inside AppRoutes")
    t2 = t2.replace("taskkill /PID <PID> /F", "taskkill /PID &lt;PID&gt; /F")
    with open('R:/SSG/website/scratch/pdf_part13_to_18.py', 'w', encoding='utf-8') as f:
        f.write(t2)
    print("Fixed pdf_part13_to_18.py")

    # Fix pdf_part19_to_24.py
    with open('R:/SSG/website/scratch/pdf_part19_to_24.py', 'r', encoding='utf-8') as f:
        t3 = f.read()
    t3 = t3.replace("<Link> tags", "&lt;Link&gt; tags")
    with open('R:/SSG/website/scratch/pdf_part19_to_24.py', 'w', encoding='utf-8') as f:
        f.write(t3)
    print("Fixed pdf_part19_to_24.py")

if __name__ == "__main__":
    fix_all()
