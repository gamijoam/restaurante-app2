import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

if __name__ == "__main__":
    ports = [8080, 8081, 5173, 8082]
    for port in ports:
        print(f"Puerto {port}: {'OCUPADO' if is_port_in_use(port) else 'LIBRE'}")
