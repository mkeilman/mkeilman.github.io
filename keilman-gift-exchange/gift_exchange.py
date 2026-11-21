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
    # (if only 1 pair (n == 2) and no exclusions, keep going)
    if n > 2 and (n * (n - 1) // 2) - 1 * len(excl) < n:
        raise ValueError(f"{n} elements can exclude no more than {(n * (n - 1) // 2) - 1 * len(excl)} pairs: {len(excl)}")

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
    import pathlib

    KEY_CODE = "code"
    KEY_EMAIL = "email"
    KEY_EXCLUSIONS = "exclusions"
    KEY_GIFTEE = "giftee"
    KEY_GIFTEE_CODE = "gifteeCode"
    KEY_INCLUSIONS = "inclusions"
    KEY_NAME = "name"
    KEY_PARTICIPANTS = "participants"
    KEY_SUGGESTIONS = "suggestions"

    PARTICIPANT_DICT = {
        KEY_CODE: "",
        KEY_NAME: "",
        KEY_EMAIL: "",
        KEY_GIFTEE: "",
        KEY_GIFTEE_CODE: "",
        KEY_SUGGESTIONS: [],
    }

    def _to_tuples(e):
        return [tuple(x) for x in e]

    def _input_participants(d):
        while True:
            p = input("Participant: ")
            if not p:
                break
            d["participants"][p] = PARTICIPANT_DICT.copy()
            d["participants"][p][KEY_NAME] = p

    def _input_inclusions(d):
        _input_exchange("Inclusion: ", KEY_INCLUSIONS, d)

    def _input_exclusions(d):
         _input_exchange("Exclusion: ", KEY_EXCLUSIONS, d)

    def _input_exchange(prompt, key, d):
        #i = []
        i = d.get(key, [])
        while True:
            p = input(prompt)
            if not p:
                break
            p1, p2 = p.split(",")
            assert p1 in d[KEY_PARTICIPANTS] and p2 in d[KEY_PARTICIPANTS]
            i.append([p1, p2])
        d[key] = i


    p = argparse.ArgumentParser(description="generate a gift exchange for the given year")
    p.add_argument("year", type=int, help="year to run")
    p.add_argument(
        "--new",
        action=argparse.BooleanOptionalAction,
        default=False,
        dest="new",
        help="create a new file",
    )
    p.add_argument(
        "--regen-codes",
        action=argparse.BooleanOptionalAction,
        default=False,
        dest="regen_codes",
        help="regenerate user codes",
    )
    p.add_argument(
        "--regift",
        action=argparse.BooleanOptionalAction,
        default=True,
        dest="regift",
        help="create new gifter-giftee pairings",
    )
    p.add_argument(
        "--use-previous-participants",
        action=argparse.BooleanOptionalAction,
        default=True,
        dest="usePreviousParticipants",
        help="use the participants from the previous year, if that file exists",
    )
    p.add_argument(
        "--exclude-previous-pairs",
        action=argparse.BooleanOptionalAction,
        default=True,
        dest="excludePreviousPairs",
        help="attempt to exclude the pairings from the previous year, if that file exists",
    )
    a, _ = p.parse_known_args()

    data_dict = None
    data_filename = f"./data/{a.year}.json"

    prev_dict = None
    prev_pairs = []
    prev_filename = f"./data/{a.year - 1}.json"

    if pathlib.Path(prev_filename).exists():
        with open(prev_filename, "r") as f:
            prev_dict = json.loads(f.read())

    if a.new:
        data_dict = {
            KEY_PARTICIPANTS: {},
            KEY_INCLUSIONS: [],
            KEY_EXCLUSIONS: [],
        }
        if a.usePreviousParticipants and prev_dict:
            for p in prev_dict[KEY_PARTICIPANTS]:
                data_dict[KEY_PARTICIPANTS][p] = PARTICIPANT_DICT.copy()
                data_dict[KEY_PARTICIPANTS][p][KEY_NAME] = p
        else:
            _input_participants(data_dict)

    else:
        with open(data_filename, "r") as f:
            data_dict = json.loads(f.read())

    participants = data_dict[KEY_PARTICIPANTS]
    p_names = participants.keys()

    if a.excludePreviousPairs and prev_dict:
        prev_pp = prev_dict.get(KEY_PARTICIPANTS, {})
        for gifter in prev_pp.keys():
            giftee = prev_pp[gifter][KEY_GIFTEE]
            if gifter in p_names and giftee in p_names:
                prev_pairs.append([gifter, giftee])

    data_dict[KEY_EXCLUSIONS].extend(prev_pairs)
    
    # always collect in/exclusions
    _input_inclusions(data_dict)
    _input_exclusions(data_dict)
    
    for p in p_names:
        if a.regen_codes or not participants[p][KEY_CODE]:
            participants[p][KEY_CODE] = random_base62(10)
        if not participants[p].get(KEY_SUGGESTIONS):
            participants[p][KEY_SUGGESTIONS] = []

    exchs = random_exchanges(
        list(p_names),
        inclusions=_to_tuples(data_dict.get(KEY_INCLUSIONS, [])),
        exclusions=_to_tuples(data_dict.get(KEY_EXCLUSIONS, []))
    )
    for a in exchs:
        participants[a[0]][KEY_GIFTEE] = a[1]
        participants[a[0]][KEY_GIFTEE_CODE] = participants[a[1]][KEY_CODE]

    print(data_dict)


    #e = ["Mike", "John", "Joe", "Thomb", "Patrick", "Jerry", "Sari", "Erin"]
    #exc = [("Jerry", "Sari"), ("Sari", "Jerry"), ("Erin", "Joe"), ("Joe", "Erin")]
    #inc = [("Erin", "Sari")]
    #random_exchanges(e, inclusions=inc, exclusions=exc)


if __name__ == "__main__":
    main()
