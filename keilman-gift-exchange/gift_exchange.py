import random


def flatten(arr):
    return [x for y in arr for x in y]


def random_base62(length):
    BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    return "".join([random.choice(BASE62_CHARS) for _ in range(length)]) 


def random_exchanges(elements, inclusions=None, exclusions=None):
    """From the given list, retruns a list of pairs of random elements
    where each element appears in each position once and only once, and
    never in both positions of a single pair. Consider a gift exchange where each person draws a
    name not their own to give to.

    Args:
        elements (list): elements to pair
        inclusions (list): require these pairings
        exclusions (list): exclude these pairings
    """
    
    def _first(exchs):
        return [x[0] for x in exchs]
    
    def _second(exchs):
        return [x[1] for x in exchs]
    
    # an exchange is valid if:
    # - the first element differs from the second
    # - the second element has not been selected
    # - the exchange is not forbidden by the exclusions
    def _valid_exchanges(el, els, exchs, ex):
        return [x for x in els if x != el and x not in _second(exchs) and (el, x) not in ex]
    
    def _validate(exchs):
        i0 = _first(exchs)
        i1 = _second(exchs)
        return len(set(i0)) == len(i0) and len(set(i1)) == len(i1)
    

    n = len(elements)
    if n < 2:
        raise ValueError(f"cannot make pairs from {n} elements")

    incl = inclusions or []
    excl = exclusions or []

    # an element cannot exchange with itself
    if any([x[0] == x[1] for x in incl]):
        raise ValueError(f"an element cannot exchange with itself: {incl}")

    # an element can appear at most once in each position of the inclusions
    if not _validate(incl):
         raise ValueError(f"elements must appear at most once in each position: {incl}")

    # naturally inclusions and exclusions may not share any elements
    intx = set(incl).intersection(set(flatten([[x, x[::-1]] for x in excl])))
    if intx:
        raise ValueError(f"inclusions and exclusions cannot share elements: {intx}")

    # there are n(n - 1) / 2 possible exchanges, and each exclusion removes 2, so
    # check if enough remain to pair (at least n pairings)
    if (n * (n - 1) // 2) - 2 * len(excl) < n:
        raise ValueError(f"can exclude no more than {n * (n - 2) // 2} pairs")

    # randomize the elements so any forced assignment is not always the same
    random.shuffle(elements)
    
    # accomodate the inclusions first, then exclusions, then the rest
    exchanges = incl[:]

    # unique excluded elements
    excluded_elements = list(set(_first(excl)))

    # go through exclusions first; otherwise they may not be pairable
    eeee = excluded_elements + [x for x in elements if x not in excluded_elements]
    for i, e in enumerate(eeee):
        # already added by inclusions
        if e in _first(incl):
            continue

        # if we're down to the last 2 elements and the last element has not
        # already been selected, select it now - otherwise it will not be paired
        if i == len(eeee) - 2 and eeee[-1] not in _second(exchanges):
            exchanges.append((e, eeee[-1]))
            continue

        exchanges.append((e, random.choice(_valid_exchanges(e, elements, exchanges, excl))))

    assert _validate(exchanges)
    return exchanges


def main():
    import argparse
    import json

    def _to_tuples(e):
        return [tuple(x) for x in e]

    def _input_participants(d):
        while True:
            p = input("Participant: ")
            if not p:
                break
            d["participants"][p] = {
                "code": "",
                "name": p,
                "giftee": "",
            }

    def _input_inclusions(d):
        _input_exchange("Inclusion: ", "inclusions", d)

    def _input_exclusions(d):
         _input_exchange("Exclusion: ", "exclusions", d)

    def _input_exchange(prompt, key, d):
        i = []
        while True:
            p = input(prompt)
            if not p:
                break
            p1, p2 = p.split(",")
            assert p1 in d["participants"] and p2 in d["participants"]
            i.append([p1, p2])
        d[key] = i


    p = argparse.ArgumentParser(description="run AdventOfCode for the given year and day")
    p.add_argument("year", type=int, help="year to run")
    p.add_argument(
        "--new",
        action=argparse.BooleanOptionalAction,
        default=False,
        dest="new",
    )
    p.add_argument(
        "--regen-codes",
        action=argparse.BooleanOptionalAction,
        default=False,
        dest="regen_codes",
    )
    p.add_argument(
        "--regift",
        action=argparse.BooleanOptionalAction,
        default=True,
        dest="regift",
    )
    a, _ = p.parse_known_args()

    data_dict = None
    data_filename = f"./data/{a.year}.json"

    if a.new:
        data_dict = {
            "participants": {},
            "inclusions": [],
            "exclusions": [],
        }
        _input_participants(data_dict)

    else:
        with open(data_filename, "r") as f:
            data_dict = json.loads(f.read())
    
    # always collect in/exclusions
    _input_inclusions(data_dict)
    _input_exclusions(data_dict)
    
    participants = data_dict["participants"]
    k = participants.keys()
    for p in k:
        if a.regen_codes or not participants[p]["code"]:
            participants[p]["code"] = random_base62(10)

    exchs = random_exchanges(
        list(k),
        inclusions=_to_tuples(data_dict.get("inclusions", [])),
        exclusions=_to_tuples(data_dict.get("exclusions", []))
    )
    for a in exchs:
        participants[a[0]]["giftee"] = a[1]

    print(data_dict)


    #e = ["Mike", "John", "Joe", "Thomb", "Patrick", "Jerry", "Sari", "Erin"]
    #exc = [("Jerry", "Sari"), ("Sari", "Jerry"), ("Erin", "Joe"), ("Joe", "Erin")]
    #inc = [("Erin", "Sari")]
    #random_exchanges(e, inclusions=inc, exclusions=exc)


if __name__ == "__main__":
    main()

