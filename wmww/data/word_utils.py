import argparse

def _meta_files(filename):
    import json

    v = None
    with open(filename, "r") as f:
        v = sorted([x.strip() for x in f.readlines()])
    lengths = {}
    for wl in set([len(x) for x in v]):
        print(f"{wl}...", end=None)
        a = [x for x in v if len(x) == wl]
        lengths[f"{wl}"] = len(a)
        with open(f"{wl:02d}.txt", "w") as f:
            f.writelines([f"{v.index(x)}\n" for x in a])
        
    print("")
    with open("WordMeta.json", "w") as f:
        json.dump(lengths, f)
    

def main():
    p = argparse.ArgumentParser(description="perform meta operations on wordlist")
    p.add_argument("filename", type=str, help="word list")
    a, u = p.parse_known_args()
    _meta_files(a.filename)
    

if __name__ == "__main__":
    main()
