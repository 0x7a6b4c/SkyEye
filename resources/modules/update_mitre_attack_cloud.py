"""
Copyright (C) 2025  Minh Hoang NGUYEN

This program (SkyEye) is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program (SkyEye) is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

import json, os, re, requests, logging
from copy import deepcopy

CLOUD_PLATFORMS = {"IaaS", "SaaS", "Office Suite", "Identity Provider"}

def get_code_id(obj):
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack" and "external_id" in ref:
            return ref["external_id"]
    return None

def get_shortname(obj):
    if "x_mitre_shortname" in obj:
        return obj["x_mitre_shortname"]
    return obj.get("name", "").lower().replace(" ", "-")

def get_domains(obj):
    return obj.get("x_mitre_domains", ["enterprise-attack"])

def extract_fields_tactic(obj):
    return {
        "code_id": get_code_id(obj),
        "shortname": get_shortname(obj),
        "domains": get_domains(obj),
        "name": obj.get("name", ""),
        "description": obj.get("description", ""),
        "techniques": []
    }

def extract_fields_technique(obj):
    return {
        "code_id": get_code_id(obj),
        "shortname": get_shortname(obj),
        "platforms": obj.get("x_mitre_platforms", []),
        "domains": get_domains(obj),
        "name": obj.get("name", ""),
        "description": obj.get("description", ""),
        "sub_techniques": []
    }

def extract_fields_subtechnique(obj):
    return {
        "code_id": get_code_id(obj),
        "shortname": get_shortname(obj),
        "platforms": obj.get("x_mitre_platforms", []),
        "domains": get_domains(obj),
        "name": obj.get("name", ""),
        "description": obj.get("description", "")
    }

def tactic_sort_key(tactic_id):
    match = re.match(r"TA(\d+)", tactic_id)
    return int(match.group(1)) if match else float('inf')

def summarize_mitre_attack_data(mitre_attack_list):
    summary = {}
    for tactic in mitre_attack_list:
        tactic_id = tactic.get("code_id")
        summary[tactic_id] = {
            "name": tactic.get("name"),
            "description": tactic.get("description"),
            "techniques": {}
        }
        for tech in tactic.get("techniques", []):
            tech_id = tech.get("code_id")
            summary[tactic_id]["techniques"][tech_id] = {
                "name": tech.get("name"),
                "description": tech.get("description"),
                "sub_techniques": {}
            }
            for subtech in tech.get("sub_techniques", []):
                subtech_id = subtech.get("code_id")
                summary[tactic_id]["techniques"][tech_id]["sub_techniques"][subtech_id] = {
                    "name": subtech.get("name"),
                    "description": subtech.get("description")
                }

    ordered_tactic_ids = sorted(summary.keys(), key=tactic_sort_key)
    ordered_summary = {}

    for tactic_id in ordered_tactic_ids:
        tactic = summary[tactic_id]
        techniques = tactic["techniques"]
        ordered_tech_ids = sorted(
            techniques.keys(),
            key=lambda tid: techniques[tid]["name"].lower() if techniques[tid].get("name") else ""
        )
        ordered_techniques = {}
        for tech_id in ordered_tech_ids:
            tech = techniques[tech_id]
            sub_techniques = tech["sub_techniques"]
            ordered_subtech_ids = sorted(
                sub_techniques.keys(),
                key=lambda stid: sub_techniques[stid]["name"].lower() if sub_techniques[stid].get("name") else ""
            )
            ordered_subtechniques = {stid: sub_techniques[stid] for stid in ordered_subtech_ids}
            tech_entry = dict(tech)
            tech_entry["sub_techniques"] = ordered_subtechniques
            ordered_techniques[tech_id] = tech_entry

        tactic_entry = dict(tactic)
        tactic_entry["techniques"] = ordered_techniques
        ordered_summary[tactic_id] = tactic_entry

    return ordered_summary

def add_references(mitre_attack_data):
    for tactic_id, tactic in mitre_attack_data['Matrix'].items():
        # Add Reference to tactic
        tactic["Reference"] = f"https://attack.mitre.org/tactics/{tactic_id}"
        for technique_id, technique in tactic.get("techniques", {}).items():
            # Add Reference to technique and sub_technique
            technique["Reference"] = f"https://attack.mitre.org/techniques/{technique_id}"
            for sub_tech_id, sub_tech in technique.get("sub_techniques", {}).items():
                if "." in sub_tech_id:
                    base, sub = sub_tech_id.split(".")
                    ref = f"https://attack.mitre.org/techniques/{base}/{sub.zfill(3)}"
                else:
                    ref = f"https://attack.mitre.org/techniques/{sub_tech_id}"
                sub_tech["Reference"] = ref

    return mitre_attack_data

def update_mitre_attack_cloud_core(data):
    tactics = {}
    for obj in data.get("objects", []):
        if obj.get("type") == "x-mitre-tactic":
            tactics[obj["x_mitre_shortname"]] = extract_fields_tactic(obj)

    techniques_by_externalid = {}
    subtechniques_by_parent_externalid = {}

    for obj in data.get("objects", []):
        if obj.get("type") == "attack-pattern":
            platforms = set(obj.get("x_mitre_platforms", []))
            if not (platforms & CLOUD_PLATFORMS):
                continue
            code_id = get_code_id(obj)
            if not code_id:
                continue
            if obj.get("x_mitre_is_subtechnique"):
                if '.' in code_id:
                    parent_external_id = code_id.rsplit('.', 1)[0]
                    sub_list = subtechniques_by_parent_externalid.setdefault(parent_external_id, [])
                    sub_list.append(extract_fields_subtechnique(obj))
            else:
                techniques_by_externalid[code_id] = extract_fields_technique(obj)

    for parent_external_id, subs in subtechniques_by_parent_externalid.items():
        if parent_external_id in techniques_by_externalid:
            techniques_by_externalid[parent_external_id]["sub_techniques"].extend(subs)

    tactic_tree = []
    for tactic_shortname, tactic in tactics.items():
        for obj in data.get("objects", []):
            if obj.get("type") == "attack-pattern" and not obj.get("x_mitre_is_subtechnique"):
                platforms = set(obj.get("x_mitre_platforms", []))
                if not (platforms & CLOUD_PLATFORMS):
                    continue
                code_id = get_code_id(obj)
                if not code_id:
                    continue
                tech_fields = techniques_by_externalid.get(code_id)
                if not tech_fields:
                    continue
                for phase in obj.get("kill_chain_phases", []):
                    if phase.get("kill_chain_name") == "mitre-attack" and phase.get("phase_name") == tactic_shortname:
                        tactic["techniques"].append(tech_fields)
                        break
        tactic_tree.append(tactic)

    mitre_attack_data = deduplicate_techniques_by_shortname(tactic_tree)
    mitre_attack_data = remove_empty_tactics(mitre_attack_data)
    mitre_attack_data = remove_deprecated_techniques(mitre_attack_data)
    mitre_attack_data = summarize_mitre_attack_data(mitre_attack_data)
    mitre_attack_data_ref = {
        "Reference":"https://attack.mitre.org",
        "Matrix": mitre_attack_data
        }
    data_no_ref = deepcopy(mitre_attack_data_ref)
    data_ref = add_references(mitre_attack_data_ref)    
    return data_ref, data_no_ref

def deduplicate_techniques_by_shortname(tactic_tree):
    subtechnique_names = set()
    for tactic in tactic_tree:
        for tech in tactic.get("techniques", []):
            for sub in tech.get("sub_techniques", []):
                sub_name = sub.get("shortname")
                if sub_name:
                    subtechnique_names.add(sub_name)
    for tactic in tactic_tree:
        tactic["techniques"] = [
            tech for tech in tactic.get("techniques", [])
            if tech.get("shortname") not in subtechnique_names
        ]
    return tactic_tree

def remove_empty_tactics(tactic_tree):
    return [tactic for tactic in tactic_tree if tactic.get("techniques")]

def remove_deprecated_techniques(tactic_tree):
    for tactic in tactic_tree:
        new_techs = []
        for tech in tactic.get("techniques", []):
            if "**This technique has been deprecated" in tech.get("description", ""):
                continue
            new_subs = [
                sub for sub in tech.get("sub_techniques", [])
                if "**This technique has been deprecated" not in sub.get("description", "")
            ]
            tech["sub_techniques"] = new_subs
            new_techs.append(tech)
        tactic["techniques"] = new_techs
    return tactic_tree

def get_mitre_attack_json(url="https://raw.githubusercontent.com/mitre/cti/refs/heads/master/enterprise-attack/enterprise-attack.json"):
    """
    Downloads and loads the MITRE ATT&CK Enterprise JSON data from the given URL.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to update the MITRE ATT&CK Matrix [Cloud] : {e}")
        return None
    else:
        return response.json()

def update_mitre_attack_cloud_data():
    logging.info("Updating [Resource] MITRE ATT&CK Matrix - Cloud...")
    filename_ref = "mitre_attack_cloud_matrix_table.json"
    filename_no_ref = "mitre_attack_cloud_matrix_data.json"
    # Get the mitre_attack_list
    mitre_attack_list = get_mitre_attack_json()
    if mitre_attack_list:
        # Processing Mitre Attack Matrix Data - Cloud
        data_ref, data_no_ref = update_mitre_attack_cloud_core(mitre_attack_list)

        if data_ref and data_no_ref:
            ref = os.path.join("resources/mitre_attack_libraries", filename_ref)
            with open(ref, "w", encoding="utf-8") as f:
                json.dump(data_ref, f, indent=4, ensure_ascii=False)

            no_ref = os.path.join("resources/mitre_attack_libraries", filename_no_ref)
            with open(no_ref, "w", encoding="utf-8") as f:
                json.dump(data_no_ref, f, indent=4, ensure_ascii=False)
            logging.info("Mitre ATT&CK Matrix [Cloud] has been updated!")
        else:
            logging.error("Failed to update Mitre ATT&CK Matrix [Cloud]!")