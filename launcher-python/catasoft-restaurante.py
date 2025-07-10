import os
import sys
import json
import subprocess
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import socket
import psutil
import shutil
import platform

CONFIG_FILE = 'config.json'
LOGS_DIR = 'logs'

# Buscar la ruta absoluta de npm
NPM_PATH = shutil.which('npm') or r'C:\Program Files\nodejs\npm.cmd'
if not os.path.exists(NPM_PATH):
    NPM_PATH = r'C:\Program Files\nodejs\npm.cmd'  # fallback común

# --- MODIFICACIÓN PARA ESTRUCTURA DE CLIENTE ---
# Ajusta las rutas para que funcionen con la estructura mínima:
# backend/backend.jar, license-service/license-service.jar, puente-impresion/puente-impresion.exe

if getattr(sys, 'frozen', False):
    # Si está congelado por PyInstaller
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

SERVICES = {
    'backend': {
        'name': 'Backend',
        'jar': os.path.join(BASE_DIR, 'backend', 'backend.jar'),
        'log': os.path.join(LOGS_DIR, 'backend.log'),
        'process': None
    },
    'license': {
        'name': 'License Service',
        'jar': os.path.join(BASE_DIR, 'license-service', 'license-service.jar'),
        'log': os.path.join(LOGS_DIR, 'license.log'),
        'process': None
    },
    'print': {
        'name': 'Print Bridge',
        'exe': os.path.join(BASE_DIR, 'puente-impresion', 'puente-impresion.exe'),
        'log': os.path.join(LOGS_DIR, 'print.log'),
        'process': None
    }
}

PYTHON_PATH = shutil.which('python') or sys.executable

if platform.system() == 'Windows':
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve.cmd')
else:
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve')

SERVICES['frontend'] = {
    'name': 'Frontend',
    'cmd': [serve_bin, '-s', 'dist', '-l', '5173'],
    'cwd': os.path.join(BASE_DIR, 'frontend'),
    'log': os.path.join(LOGS_DIR, 'frontend.log'),
    'process': None
}

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_process_on_port(port):
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.status == psutil.CONN_LISTEN and conn.laddr.port == port:
                    proc.kill()
                    return True
        except Exception:
            continue
    return False

class LauncherApp:
    def __init__(self, root):
        self.root = root
        self.root.title('Catasoft Restaurante Launcher')
        self.root.geometry('700x600')
        self.root.resizable(False, False)
        self.config = self.load_config()
        self.show_consoles = self.config.get('show_consoles', False)
        self.java_path = self.config.get('java_path', '')
        self.create_widgets()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_config(self):
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump({'java_path': self.java_path, 'show_consoles': self.show_consoles}, f, indent=2)

    def create_widgets(self):
        frame = tk.Frame(self.root)
        frame.pack(pady=10)

        tk.Label(frame, text='Ruta de java.exe:').grid(row=0, column=0, sticky='e')
        self.java_entry = tk.Entry(frame, width=60)
        self.java_entry.grid(row=0, column=1, padx=5)
        self.java_entry.insert(0, self.java_path)
        tk.Button(frame, text='Buscar...', command=self.browse_java).grid(row=0, column=2)
        tk.Button(frame, text='Guardar', command=self.save_java_path).grid(row=0, column=3, padx=5)

        self.show_console_var = tk.BooleanVar(value=self.show_consoles)
        tk.Checkbutton(frame, text='Mostrar consolas de servicios', variable=self.show_console_var, command=self.toggle_consoles).grid(row=1, column=0, columnspan=4, pady=5)

        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=10)
        tk.Button(btn_frame, text='Iniciar Todos', width=15, command=self.start_all).grid(row=0, column=0, padx=5)
        tk.Button(btn_frame, text='Detener Todos', width=15, command=self.stop_all).grid(row=0, column=1, padx=5)
        tk.Button(btn_frame, text='Ver Logs', width=15, command=self.show_logs).grid(row=0, column=2, padx=5)
        tk.Button(btn_frame, text='Verificar Puertos', width=15, command=self.check_ports).grid(row=1, column=0, padx=5)
        tk.Button(btn_frame, text='Cerrar Puertos', width=15, command=self.close_ports).grid(row=1, column=1, padx=5)

        self.status_text = tk.StringVar()
        self.status_text.set('Listo.')
        tk.Label(self.root, textvariable=self.status_text, fg='blue').pack(pady=5)

        self.log_area = scrolledtext.ScrolledText(self.root, width=80, height=20, state='disabled')
        self.log_area.pack(pady=10)

    def browse_java(self):
        path = filedialog.askopenfilename(title='Selecciona java.exe', filetypes=[('Ejecutable Java', 'java.exe')])
        if path:
            self.java_entry.delete(0, tk.END)
            self.java_entry.insert(0, path)

    def save_java_path(self):
        self.java_path = self.java_entry.get().strip()
        self.save_config()
        messagebox.showinfo('Configuración', 'Ruta de Java guardada.')

    def toggle_consoles(self):
        self.show_consoles = self.show_console_var.get()
        self.save_config()

    def start_all(self):
        self.status_text.set('Iniciando servicios...')
        self.clear_log()
        threading.Thread(target=self._start_services, daemon=True).start()

    def stop_all(self):
        self.status_text.set('Deteniendo servicios...')
        threading.Thread(target=self._stop_services, daemon=True).start()

    def show_logs(self):
        self.clear_log()
        for svc in SERVICES.values():
            log_file = svc.get('log')
            if log_file and os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                    self.append_log(f'--- {svc["name"]} ---\n')
                    self.append_log(f.read() + '\n')

    def clear_log(self):
        self.log_area.config(state='normal')
        self.log_area.delete(1.0, tk.END)
        self.log_area.config(state='disabled')

    def append_log(self, text):
        self.log_area.config(state='normal')
        self.log_area.insert(tk.END, text)
        self.log_area.config(state='disabled')
        self.log_area.see(tk.END)

    def _start_services(self):
        # Backend
        if self.java_path and os.path.exists(self.java_path):
            backend_cmd = [self.java_path, '-jar', SERVICES['backend']['jar']]
        else:
            backend_cmd = ['java', '-jar', SERVICES['backend']['jar']]
        SERVICES['backend']['process'] = self._start_process(backend_cmd, os.path.dirname(SERVICES['backend']['jar']), SERVICES['backend']['log'])

        # License Service
        if self.java_path and os.path.exists(self.java_path):
            license_cmd = [self.java_path, '-jar', SERVICES['license']['jar']]
        else:
            license_cmd = ['java', '-jar', SERVICES['license']['jar']]
        SERVICES['license']['process'] = self._start_process(license_cmd, os.path.dirname(SERVICES['license']['jar']), SERVICES['license']['log'])

        # Print Bridge (ahora ejecuta el .exe si existe)
        if os.path.exists(SERVICES['print']['exe']):
            print_cmd = [SERVICES['print']['exe']]
            print_cwd = os.path.dirname(SERVICES['print']['exe'])
        else:
            print_cmd = ['node', os.path.join(BASE_DIR, 'puente-impresion', 'index.js')]
            print_cwd = os.path.join(BASE_DIR, 'puente-impresion')
        SERVICES['print']['process'] = self._start_process(print_cmd, print_cwd, SERVICES['print']['log'])

        # Frontend (iniciar servidor HTTP y abrir en navegador)
        frontend_cmd = SERVICES['frontend']['cmd']
        frontend_cwd = SERVICES['frontend']['cwd']
        SERVICES['frontend']['process'] = self._start_process(frontend_cmd, frontend_cwd, SERVICES['frontend']['log'])
        
        # Esperar un poco para que el servidor se inicie
        import time
        time.sleep(2)
        
        # Abrir en el navegador
        import webbrowser
        try:
            webbrowser.open('http://localhost:5173')
            self.append_log('Frontend abierto en el navegador en http://localhost:5173\n')
        except Exception as e:
            self.append_log(f'Error abriendo navegador: {e}\n')

        self.status_text.set('Todos los servicios iniciados.')
        self.append_log('Todos los servicios iniciados.\n')

    def _stop_services(self):
        for svc in SERVICES.values():
            proc = svc.get('process')
            if proc and proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except Exception:
                    proc.kill()
                svc['process'] = None
        self.status_text.set('Todos los servicios detenidos.')
        self.append_log('Todos los servicios detenidos.\n')

    def _start_process(self, cmd, cwd, log_file):
        with open(log_file, 'w', encoding='utf-8') as logf:
            creationflags = 0
            if not self.show_consoles and os.name == 'nt':
                creationflags = subprocess.CREATE_NO_WINDOW
            try:
                proc = subprocess.Popen(cmd, cwd=cwd, stdout=logf, stderr=logf, creationflags=creationflags)
                return proc
            except Exception as e:
                self.append_log(f'Error iniciando {cmd}: {e}\n')
                return None

    def check_ports(self):
        ports = [8080, 8081, 5173, 8082]
        status = []
        for port in ports:
            ocupado = is_port_in_use(port)
            status.append(f'Puerto {port}: {"OCUPADO" if ocupado else "LIBRE"}')
        self.append_log('\n'.join(status) + '\n')
        messagebox.showinfo('Estado de Puertos', '\n'.join(status))

    def close_ports(self):
        ports = [8080, 8081, 5173, 8082]
        cerrados = []
        for port in ports:
            if is_port_in_use(port):
                if kill_process_on_port(port):
                    cerrados.append(f'Puerto {port}: CERRADO')
                else:
                    cerrados.append(f'Puerto {port}: NO SE PUDO CERRAR')
            else:
                cerrados.append(f'Puerto {port}: YA ESTABA LIBRE')
        self.append_log('\n'.join(cerrados) + '\n')
        messagebox.showinfo('Cerrar Puertos', '\n'.join(cerrados))

def main():
    if not os.path.exists(LOGS_DIR):
        os.makedirs(LOGS_DIR)
    root = tk.Tk()
    app = LauncherApp(root)
    root.mainloop()

if __name__ == '__main__':
    main()
