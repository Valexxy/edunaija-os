import os
import sys
import sqlite3
import json

sys.path.insert(0, os.path.abspath("."))
from backend.database.sqlite_store import (
    init_db,
    seed_nigerian_directory,
    get_nigerian_states,
    get_nigerian_state_details,
    get_nigerian_institutions,
    get_nigerian_secondary_schools
)

def test_all_states_have_motto_and_heritage():
    init_db()
    seed_nigerian_directory()
    states = get_nigerian_states()

    assert len(states) == 37, f"Expected 37 states/FCT, got {len(states)}"

    for state in states:
        name = state["state_name"]
        motto = state["motto"]
        year = state["creation_year"]
        history = state["historical_summary"]
        edu = state["educational_heritage"]
        scholars = state["notable_scholars_and_heroes"]
        landmarks = state["cultural_landmarks"]

        assert len(motto) > 2, f"State {name} is missing official motto"
        assert 1960 <= year <= 2000, f"State {name} has invalid creation year {year}"
        assert len(history) > 20, f"State {name} has insufficient historical summary"
        assert len(edu) > 10, f"State {name} has insufficient educational heritage"
        assert len(scholars) > 5, f"State {name} has insufficient scholars record"
        assert len(landmarks) > 5, f"State {name} has insufficient landmarks"

def test_specific_state_mottos_and_details():
    # Verify signature state mottos
    lagos = get_nigerian_state_details("Lagos")
    assert lagos is not None
    assert lagos["motto"] == "Centre of Excellence"
    assert lagos["creation_year"] == 1967
    assert len(lagos["institutions"]) >= 3
    assert len(lagos["secondary_schools"]) >= 5

    oyo = get_nigerian_state_details("Oyo")
    assert oyo is not None
    assert oyo["motto"] == "Pace Setter State"
    assert "Cocoa House" in oyo["cultural_landmarks"]
    assert "University of Ibadan" in oyo["educational_heritage"]

    kaduna = get_nigerian_state_details("Kaduna")
    assert kaduna is not None
    assert kaduna["motto"] == "Centre of Learning"
    assert "Ahmadu Bello University" in kaduna["educational_heritage"]

    anambra = get_nigerian_state_details("Anambra")
    assert anambra is not None
    assert anambra["motto"] == "Light of the Nation"
    assert "Chinua Achebe" in anambra["notable_scholars_and_heroes"]

    kano = get_nigerian_state_details("Kano")
    assert kano is not None
    assert kano["motto"] == "Centre of Commerce"
    assert "Bayero University" in kano["educational_heritage"]

    fct = get_nigerian_state_details("FCT Abuja")
    assert fct is not None
    assert fct["motto"] == "Centre of Unity"

def test_institutions_and_schools_heritage():
    institutions = get_nigerian_institutions()
    assert len(institutions) >= 46

    unilag = next((i for i in institutions if "UNILAG" in i["short_name"]), None)
    assert unilag is not None
    assert "In Deed and in Truth" in unilag["motto"]
    assert unilag["founded_year"] == 1962

    ui = next((i for i in institutions if i["short_name"] == "UI"), None)
    assert ui is not None
    assert "Recte Sapere Fons" in ui["motto"]
    assert ui["founded_year"] == 1948

    schools = get_nigerian_secondary_schools()
    assert len(schools) >= 20

    kings = next((s for s in schools if "King's College" in s["name"]), None)
    assert kings is not None
    assert "Floreat Collegium" in kings["motto"]
    assert kings["founded_year"] == 1909

    barewa = next((s for s in schools if "Barewa College" in s["name"]), None)
    assert barewa is not None
    assert "Man Juhun" in barewa["motto"]
    assert barewa["founded_year"] == 1921

if __name__ == "__main__":
    test_all_states_have_motto_and_heritage()
    test_specific_state_mottos_and_details()
    test_institutions_and_schools_heritage()
    print("ALL PAN-NIGERIAN HERITAGE & DIRECTORY TESTS PASSED!")
