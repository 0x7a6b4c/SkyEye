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

def enumerateEnvEntities(envData, mode="default"):
    reScanEnvEntities = {
        "Users":[],
        "Groups":[],
        "Roles":[],
        "Policies":[]
    }
    for index, users in enumerate(envData.users):
        if users.get("InlinePolicies", []):
            if users["InlinePolicies"][0].get("Statement", []):
                if users.get("AttachedManagedPolicies", []):
                    if mode == "assumed-role":
                        if users.get("GroupList", []):
                            if users.get("RoleList", []):
                                pass
                            else:
                                reScanEnvEntities['Users'].append(index)
                        else:
                            reScanEnvEntities['Users'].append(index)
                else:
                    reScanEnvEntities['Users'].append(index)
            else:
                reScanEnvEntities['Users'].append(index)
        else:
            reScanEnvEntities['Users'].append(index)
    for index, groups in enumerate(envData.groups):
        if groups.get("InlinePolicies", []):
            if groups["InlinePolicies"][0].get("Statement", []):
                if groups.get("AttachedManagedPolicies", []):
                    pass
                else:
                    reScanEnvEntities['Groups'].append(index)
            else:
                reScanEnvEntities['Groups'].append(index)
        else:
            reScanEnvEntities['Groups'].append(index)
        
    for index, roles in enumerate(envData.roles):
        if roles.get("InlinePolicies", []):
            if roles["InlinePolicies"][0].get("Statement", []):
                if roles.get("AttachedManagedPolicies", []):
                    pass
                else:
                    reScanEnvEntities['Roles'].append(index)
            else:
                reScanEnvEntities['Roles'].append(index)
        else:
            reScanEnvEntities['Roles'].append(index)

    for index, policies in enumerate(envData.policies):
        if policies.get("DefaultVersionId") and policies.get("Statement"):
            pass
        else:
            reScanEnvEntities['Policies'].append(index)
    return reScanEnvEntities