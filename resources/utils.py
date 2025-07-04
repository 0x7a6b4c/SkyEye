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

import sys, re, logging, logging.handlers, datetime, urllib3, os, json, threading, queue

class envIAMData:
    def __init__(self):
        # Initialize all collections and their locks
        self._users = []
        self._groups = []
        self._roles = []
        self._policies = []
        self._all = []
        self._arns = []
        self._groupsAll = []
        self._policiesAll = []

        self._lockU = threading.Lock()
        self._lockG = threading.Lock()
        self._lockR = threading.Lock()
        self._lockP = threading.Lock()
        self._lockA = threading.Lock()
        self._lockArn = threading.Lock()
        self._lockGroupsAll = threading.Lock()
        self._lockPoliciesAll = threading.Lock()
        

    # Context manager methods for each collection
    def users_context(self):
        """Provides thread-safe access to users list"""
        return self._CollectionContext(self._users, self._lockU)

    def groups_context(self):
        """Provides thread-safe access to groups list"""
        return self._CollectionContext(self._groups, self._lockG)

    def roles_context(self):
        """Provides thread-safe access to roles list"""
        return self._CollectionContext(self._roles, self._lockR)

    def policies_context(self):
        """Provides thread-safe access to policies list"""
        return self._CollectionContext(self._policies, self._lockP)
    
    def all_context(self):
        """Provides thread-safe access to all list"""
        return self._CollectionContext(self._all, self._lockA)
    
    def arns_context(self):
        """Provides thread-safe access to arn list"""
        return self._CollectionContext(self._arns, self._lockArn)
    
    def groupsAll_context(self):
        """Provides thread-safe access to group all list"""
        return self._CollectionContext(self._groupsAll, self._lockGroupsAll)
    
    def policiesAll_context(self):
        """Provides thread-safe access to policies all list"""
        return self._CollectionContext(self._policiesAll, self._lockPoliciesAll)

    # Inner context manager class
    class _CollectionContext:
        def __init__(self, collection, lock):
            self.collection = collection
            self.lock = lock

        def __enter__(self):
            self.lock.acquire()
            return self.collection

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.lock.release()
    
    @property
    def users(self):
        with self._lockU:
            return self._users.copy()
        
    @property
    def groups(self):
        with self._lockG:
            return self._groups.copy()
    
    @property
    def roles(self):
        with self._lockR:
            return self._roles.copy()
    
    @property
    def policies(self):
        with self._lockP:
            return self._policies.copy()
        
    @property
    def all(self):
        with self._lockA:
            return self._all.copy()
        
    @property
    def arns(self):
        with self._lockArn:
            return self._arns.copy()
        
    @property
    def groupsAll(self):
        with self._lockGroupsAll:
            return self._groupsAll.copy()
        
    @property
    def policiesAll(self):
        with self._lockPoliciesAll:
            return self._policiesAll.copy()

def remove_metadata(boto_response):
    if isinstance(boto_response, dict):
        boto_response.pop('ResponseMetadata', None)
    return boto_response

def json_encoder(o):
    if type(o) is datetime.date or type(o) is datetime.datetime:
        return o.isoformat()

    if isinstance(o, bytes):
        return o.encode('utf-8', errors='ignore')

    if isinstance(o, str):
        return o.encode('utf-8', errors='ignore')

"""
DEBUG logging mode

def configure_logging(timestamp):
    os.makedirs('logs', exist_ok=True)
    log_filename = os.path.join("logs", f"scanningSession_{timestamp}.log")

    log_queue = queue.Queue(-1)

    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - [%(levelname)s] %(message)s')
    file_handler.setFormatter(formatter)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(logging.INFO)
    stream_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    queue_handler = logging.handlers.QueueHandler(log_queue)
    root_logger.addHandler(queue_handler)
    root_logger.addHandler(stream_handler)

    listener = logging.handlers.QueueListener(log_queue, file_handler)
    listener.start()

    logging.getLogger('boto3').setLevel(logging.DEBUG)
    logging.getLogger('botocore').setLevel(logging.DEBUG)

    logging.getLogger('nose').setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    return listener
"""

def configure_logging(timestamp: str, session_type: str = "scanning"):
    os.makedirs('logs', exist_ok=True)
    log_filename = os.path.join("logs", f"{session_type}Session_{timestamp}.log")

    log_queue = queue.Queue(-1)

    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter('%(asctime)s - [%(levelname)s] %(message)s'))

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter('%(asctime)s - [%(levelname)s] %(message)s'))

    queue_handler = logging.handlers.QueueHandler(log_queue)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [queue_handler, console_handler]

    listener = logging.handlers.QueueListener(log_queue, file_handler)
    listener.start()

    for noisy in ['boto3', 'botocore', 'nose', 'requests', 'urllib3']:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    return listener

# regex_filtering("sts:AssumeRole", statement_action):
def regex_filtering(action, pattern):
    pattern = re.escape(pattern).replace(r'\*', '.*').replace(r'\?', '.')
    return bool(re.fullmatch(pattern, action))

def load_credentials_from_json(file_path):
    with open(file_path, 'r') as file:
        try:
            credentials = json.load(file)
        except Exception as e:
            return None
    return credentials

def ensure_completed_scan_folder(mode, timestamp):
    if not os.path.exists("completed_scan"):
        os.makedirs("completed_scan")
    
    sub_folder = os.path.join("completed_scan", f"{timestamp}_{mode}")
    os.makedirs(sub_folder, exist_ok=True)
    return sub_folder

def createDir(intialPath, newDir):
    folder = os.path.join(intialPath, newDir)
    os.makedirs(folder, exist_ok=True)
    return folder

def save_output_to_file(output, folder_path, file_name):
    file_path = os.path.join(folder_path, file_name)
    with open(file_path, 'w') as file:
        json.dump(output, file, indent=4, default=json_encoder)
    logging.info(f"Output saved to {file_path}")

def save_output_to_fileEnv(folder_path, envData):
    file_path = os.path.join(folder_path, "envUsers.json")
    with open(file_path, 'w') as file:
        json.dump(envData.users, file, indent=4, default=json_encoder)
    logging.info(f"Output saved to {file_path}")
    file_path = os.path.join(folder_path, "envGroups.json")
    with open(file_path, 'w') as file:
        json.dump(envData.groups, file, indent=4, default=json_encoder)
    logging.info(f"Output saved to {file_path}")
    file_path = os.path.join(folder_path, "envRoles.json")
    with open(file_path, 'w') as file:
        json.dump(envData.roles, file, indent=4, default=json_encoder)
    logging.info(f"Output saved to {file_path}")
    file_path = os.path.join(folder_path, "envPolicies.json")
    with open(file_path, 'w') as file:
        json.dump(envData.policies, file, indent=4, default=json_encoder)
    logging.info(f"Output saved to {file_path}")

def update_max_threads(new_value):
    config_file = './resources/threads_config.py'

    with open(config_file, 'r') as file:
        lines = file.readlines()

    updated_lines = []
    for line in lines:
        if line.startswith("MAX_THREADS"):
            updated_lines.append(f"MAX_THREADS = {new_value}\n")
        else:
            updated_lines.append(line)

    with open(config_file, 'w') as file:
        file.writelines(updated_lines)


"""
    ╔═══════╗ ══  ══ ══    ══ ══════ ══    ══ ══════ 
    ║ ══════╝ ══ ══   ══  ══  ══      ══  ══  ══      
    ╚═══════╗ ════     ════   ═════    ════   ═════
    ╔══════ ║ ══  ══    ══    ══        ══    ══      
    ╚═══════╝ ══   ══   ══    ══════    ══    ══════
"""

def skyeye_logo():
    logo = f"""
                         .+@@@@@@@@@@@*:                            
                      :%@@@@@@@@@@@@@@@@@@-                         
         :-         =@@@@@@@#+-:::=+*@@@@@@@+                       
          ##      :@@@@@@-             :%@@@@@=                     
         :.@@#   :@@@@@-                 .%@@@@+                    
         +@:#@@@+:.=%%                     *@@@@=                   
         .%@@%@@@@@@+-  =*=:                #@@@@.                  
           =@@@@@@@@@@@@%++@@@#: :#-         @@@@@@@@@@+.           
      .#:=    :*@@@@@@@@@@@@@@@@@%.%@*.-     +@@@@@@@@@@@@:         
     *@@-*+#@%:       %@@@@@@@@@@@@@@@@%@-   -@@@@--+%@@@@@%.       
    #@@@%-@%*@@-      =#=#@@@@@@::=*@@@@@@+  #@@@*     =@@@@%:      
   =@@@@: -@@@@@#         @@@@@        .=@@- @@@*       :@@@@#      
   @@@@*   :@@@@@@*       ==:        ..:.   @@@-         +@@@@.     
   @@@@+     #@@@@@@@+-.      .=#*+@@@@#+-::.            -@@@@:     
   #@@@@      .%@@%%@@@@@@@@@@@@@@@@=.                   *@@@@.     
   :@@@@#        :@@@. -#@@@%*-                         +@@@@=      
    =@@@@@=           .:.                             :@@@@@*       
     :@@@@@@@@%####################################%@@@@@@@=        
       :%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=          
          .=%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%+.             

╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩╩════
    SkyEye - WHEN YOUR VISION REACHES BEYOND IAM BOUNDARY SCOPE
════════════════════════════════════════════════════════════════════╗                       
    """
    print(logo)