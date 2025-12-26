import os
import itertools
from xml.etree import ElementTree as ET
import json

folders = [
    "initial",  
    "medial",  
    "final",  
    "nn"  
]
output_dir = "output_hex_2"
viewbox = "0 0 180 180" 


os.makedirs(output_dir, exist_ok=True)

file_lists = []
for folder in folders:
    files = [f for f in os.listdir(folder) if f.lower().endswith('.svg')]
    if not files:
        print(f"'{folder}' no files")
    file_lists.append([os.path.join(folder, f) for f in files])

START_UNICODE = 0xE000
L2, L3, L4 = len(file_lists[1]), len(file_lists[2]), len(file_lists[3])
W1, W2, W3, W4 = L2 * L3 * L4, L3 * L4, L4, 1

def to_unicode(i, m, f, n) -> int:
    a = file_lists[0].index(i)
    b = file_lists[1].index(m)
    c = file_lists[2].index(f)
    d = file_lists[3].index(n)
    return START_UNICODE + W1 * a + W2 * b + W3 * c + W4 * d


combinations = list(itertools.product(*file_lists))

print(f"{len(combinations)} len")

mapper = dict()

for combo in combinations:
    unicode = 'u' + hex(to_unicode(*combo))[slice(2, None)].rjust(4,'0')
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    root = ET.Element("svg", xmlns=ns['svg'], viewBox=viewbox)
    group = ET.SubElement(root, "g")
    
    filenames = [os.path.splitext(os.path.basename(f))[0] for f in combo]
    
    output_filename = ("".join(filenames) + ".svg").replace('_', '')
    # !!!
    mapper[output_filename] = unicode
    output_filename = unicode + ".svg"

    output_path = os.path.join(output_dir, output_filename)
    

    for file_path in combo:
        tree = ET.parse(file_path)
        file_root = tree.getroot()
        
        file_group = ET.SubElement(group, "g")
        
        for path in file_root:
            if not path.tag.endswith("defs"):
                if path.get("style") != None and path.get("style").find("display:none") != -1:
                    continue
                new_path = ET.Element("path")
                for attr, value in path.attrib.items():
                    new_path.set(attr, value)
                file_group.append(new_path)
            
    try:
        tree = ET.ElementTree(root)
        tree.write(output_path, encoding="utf-8", xml_declaration=True)
        print(f"save: {output_path}")
    except Exception as e:
        print(f"{output_path}: {str(e)}")

with open(os.path.join(output_dir, "map.json"), "x") as f:
    json.dump(mapper, f)

print(f"done {len(combinations)}")