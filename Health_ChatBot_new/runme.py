import subprocess
import time
import requests

DOCKER_COMPOSE_FILE = "docker-compose.yml" 
def start_docker_compose():
    print("[+] Starting Docker Compose...")
    cmd = ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "up", "--build", "-d"]
    subprocess.run(cmd, check=True)
    print("[+] Docker Compose started in detached mode.")
    print("\t[3] Started Backend.")
    print("\t[4] Started Asha.")



if __name__ == "__main__":
    start_docker_compose()