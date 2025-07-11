import customtkinter as ctk
import tkinter as tk
from tkinter import messagebox, filedialog
import subprocess
import threading
import time
import os
import sys
import json
import requests
from PIL import Image, ImageTk
import webbrowser
from datetime import datetime

# Configurar CustomTkinter
ctk.set_appearance_mode("dark")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

def get_exe_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(__file__)

def find_npm():
    # Busca npm en ubicaciones típicas de Windows
    possible_npm = [
        "npm",  # Si está en el PATH
        "npm.cmd",
        os.path.join(os.environ.get("ProgramFiles", ""), "nodejs", "npm.cmd"),
        os.path.join(os.environ.get("ProgramFiles(x86)", ""), "nodejs", "npm.cmd"),
        os.path.join(os.environ.get("APPDATA", ""), "npm", "npm.cmd"),
    ]
    for npm_path in possible_npm:
        try:
            subprocess.run([npm_path, "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=2)
            return npm_path
        except Exception:
            continue
    return None

class ModernLauncher:
    def __init__(self):
        self.root = ctk.CTk()
        self.root.title("Catasoft Restaurante - Launcher")
        self.root.geometry("900x700")
        self.root.resizable(False, False)
        
        # Variables
        self.backend_process = None
        self.frontend_process = None
        self.license_process = None
        self.puente_process = None
        self.is_running = False
        self.backend_running = False
        self.frontend_running = False
        self.license_running = False
        self.puente_running = False
        
        # Logs
        self.backend_logs = []
        self.frontend_logs = []
        self.license_logs = []
        self.puente_logs = []
        
        # Cargar configuración
        self.load_config()
        
        # Crear interfaz
        self.create_widgets()
        
        # Verificar puertos al inicio
        self.check_ports_on_startup()
        
        # Detectar estructura del proyecto después de crear la interfaz
        if self.config.get("auto_detect_paths", True):
            self.detect_project_structure()
    
    def load_config(self):
        """Cargar configuración desde config.json"""
        try:
            with open('config.json', 'r') as f:
                old_config = json.load(f)
                
            # Migrar configuración antigua si es necesario
            if "backend_port" not in old_config:
                self.config = {
                    "backend_port": 8080,
                    "frontend_port": 5173,
                    "license_port": 8081,
                    "backend_path": "../backend",
                    "frontend_path": "../frontend",
                    "license_path": "../license-service",
                    "puente_path": "../puente-impresion",
                    "java_path": old_config.get("java_path", ""),
                    "show_consoles": old_config.get("show_consoles", True),
                    "auto_detect_paths": True,
                    "exe_paths": {
                        "backend_exe": "",
                        "frontend_exe": "",
                        "license_exe": "",
                        "puente_exe": ""
                    }
                }
                self.save_config()
            else:
                self.config = old_config
                
        except FileNotFoundError:
            self.config = {
                "backend_port": 8080,
                "frontend_port": 5173,
                "license_port": 8081,
                "backend_path": "../backend",
                "frontend_path": "../frontend",
                "license_path": "../license-service",
                "puente_path": "../puente-impresion",
                "java_path": "",
                "show_consoles": True,
                "auto_detect_paths": True,
                "exe_paths": {
                    "backend_exe": "",
                    "frontend_exe": "",
                    "license_exe": "",
                    "puente_exe": ""
                }
            }
            self.save_config()
    
    def detect_project_structure(self):
        """Detectar automáticamente la estructura del proyecto"""
        self.log("🔍 Detectando estructura del proyecto...")
        
        exe_dir = get_exe_dir()

        # Buscar en diferentes ubicaciones posibles
        possible_paths = [
            exe_dir,  # Directorio actual (donde está el .exe)
            "..",  # Directorio padre
            "../restaurante-app2",  # Estructura de desarrollo
            "../launcher",  # Estructura compilada
        ]
        
        for base_path in possible_paths:
            self.log(f"🔍 Buscando en: {base_path}")
            
            # Verificar Backend (.jar)
            backend_path = os.path.join(base_path, "backend")
            backend_jar = os.path.join(backend_path, "backend.jar")
            if os.path.exists(backend_path) and os.path.exists(backend_jar):
                self.config["backend_path"] = backend_path
                self.log(f"✅ Backend encontrado en: {backend_path}")
                self.log(f"✅ Backend JAR: {backend_jar}")
                
                # Verificar si hay .exe en el directorio
                exe_files = [f for f in os.listdir(base_path) if f.endswith('.exe')]
                if exe_files:
                    self.log(f"📁 Archivos .exe encontrados: {exe_files}")
            
            # Verificar Frontend (npm run dev)
            frontend_path = os.path.join(base_path, "frontend")
            package_json = os.path.join(frontend_path, "package.json")
            if os.path.exists(frontend_path) and os.path.exists(package_json):
                self.config["frontend_path"] = frontend_path
                self.log(f"✅ Frontend encontrado en: {frontend_path}")
                self.log(f"✅ Package.json: {package_json}")
                
                # Verificar si tiene dist/ (compilado)
                dist_path = os.path.join(frontend_path, "dist")
                if os.path.exists(dist_path):
                    self.log(f"✅ Frontend compilado (dist/) encontrado")
                else:
                    self.log(f"✅ Frontend desarrollo (npm run dev) configurado")
            
            # Verificar License Service (.jar)
            license_path = os.path.join(base_path, "license-service")
            license_jar = os.path.join(license_path, "license-service.jar")
            if os.path.exists(license_path) and os.path.exists(license_jar):
                self.config["license_path"] = license_path
                self.log(f"✅ License Service encontrado en: {license_path}")
                self.log(f"✅ License JAR: {license_jar}")
            
            # Verificar Puente Impresión (node index.js)
            puente_path = os.path.join(base_path, "puente-impresion")
            index_js = os.path.join(puente_path, "index.js")
            if os.path.exists(puente_path) and os.path.exists(index_js):
                self.config["puente_path"] = puente_path
                self.log(f"✅ Puente Impresión encontrado en: {puente_path}")
                self.log(f"✅ Index.js: {index_js}")
                
                # Verificar package.json del puente
                puente_package = os.path.join(puente_path, "package.json")
                if os.path.exists(puente_package):
                    self.log(f"✅ Package.json del puente encontrado")
        
        self.save_config()
        self.log("✅ Detección de estructura completada")
    
    def save_config(self):
        """Guardar configuración a config.json"""
        with open('config.json', 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def create_widgets(self):
        """Crear todos los widgets de la interfaz"""
        # Frame principal
        main_frame = ctk.CTkFrame(self.root)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Header
        header_frame = ctk.CTkFrame(main_frame)
        header_frame.pack(fill="x", padx=20, pady=(20, 10))
        
        # Logo y título
        title_label = ctk.CTkLabel(
            header_frame, 
            text="🍽️ Catasoft Restaurante", 
            font=ctk.CTkFont(size=24, weight="bold")
        )
        title_label.pack(pady=10)
        
        subtitle_label = ctk.CTkLabel(
            header_frame,
            text="Sistema de Gestión de Restaurante",
            font=ctk.CTkFont(size=14),
            text_color="gray"
        )
        subtitle_label.pack(pady=(0, 10))
        
        # Frame de estado
        status_frame = ctk.CTkFrame(main_frame)
        status_frame.pack(fill="x", padx=20, pady=10)
        
        # Título del estado
        status_title = ctk.CTkLabel(
            status_frame,
            text="Estado de los Servicios",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        status_title.pack(pady=10)
        
        # Grid de servicios
        services_frame = ctk.CTkFrame(status_frame)
        services_frame.pack(fill="x", padx=20, pady=10)
        
        # Backend
        backend_frame = ctk.CTkFrame(services_frame)
        backend_frame.pack(fill="x", pady=5)
        
        self.backend_status = ctk.CTkLabel(
            backend_frame,
            text="🔴 Backend: Detenido",
            font=ctk.CTkFont(size=12)
        )
        self.backend_status.pack(side="left", pady=5)
        
        self.backend_log_button = ctk.CTkButton(
            backend_frame,
            text="📋 Ver Logs",
            command=lambda: self.show_logs("backend"),
            font=ctk.CTkFont(size=10),
            width=80,
            height=25
        )
        self.backend_log_button.pack(side="right", padx=5, pady=5)
        
        # Frontend
        frontend_frame = ctk.CTkFrame(services_frame)
        frontend_frame.pack(fill="x", pady=5)
        
        self.frontend_status = ctk.CTkLabel(
            frontend_frame,
            text="🔴 Frontend: Detenido",
            font=ctk.CTkFont(size=12)
        )
        self.frontend_status.pack(side="left", pady=5)
        
        self.frontend_log_button = ctk.CTkButton(
            frontend_frame,
            text="📋 Ver Logs",
            command=lambda: self.show_logs("frontend"),
            font=ctk.CTkFont(size=10),
            width=80,
            height=25
        )
        self.frontend_log_button.pack(side="right", padx=5, pady=5)
        
        # License Service
        license_frame = ctk.CTkFrame(services_frame)
        license_frame.pack(fill="x", pady=5)
        
        self.license_status = ctk.CTkLabel(
            license_frame,
            text="🔴 License Service: Detenido",
            font=ctk.CTkFont(size=12)
        )
        self.license_status.pack(side="left", pady=5)
        
        self.license_log_button = ctk.CTkButton(
            license_frame,
            text="📋 Ver Logs",
            command=lambda: self.show_logs("license"),
            font=ctk.CTkFont(size=10),
            width=80,
            height=25
        )
        self.license_log_button.pack(side="right", padx=5, pady=5)
        
        # Puente Impresión
        puente_frame = ctk.CTkFrame(services_frame)
        puente_frame.pack(fill="x", pady=5)
        
        self.puente_status = ctk.CTkLabel(
            puente_frame,
            text="🔴 Puente Impresión: Detenido",
            font=ctk.CTkFont(size=12)
        )
        self.puente_status.pack(side="left", pady=5)
        
        self.puente_log_button = ctk.CTkButton(
            puente_frame,
            text="📋 Ver Logs",
            command=lambda: self.show_logs("puente"),
            font=ctk.CTkFont(size=10),
            width=80,
            height=25
        )
        self.puente_log_button.pack(side="right", padx=5, pady=5)
        
        # Frame de controles
        controls_frame = ctk.CTkFrame(main_frame)
        controls_frame.pack(fill="x", padx=20, pady=10)
        
        # Botones principales
        buttons_frame = ctk.CTkFrame(controls_frame)
        buttons_frame.pack(fill="x", padx=20, pady=20)
        
        # Botón principal - Iniciar todos
        self.main_button = ctk.CTkButton(
            buttons_frame,
            text="🚀 Iniciar Todos los Servicios",
            command=self.toggle_all_services,
            font=ctk.CTkFont(size=16, weight="bold"),
            height=50
        )
        self.main_button.pack(fill="x", pady=10)
        
        # Botones individuales
        individual_buttons_frame = ctk.CTkFrame(buttons_frame)
        individual_buttons_frame.pack(fill="x", pady=10)
        
        # Título de botones individuales
        individual_title = ctk.CTkLabel(
            individual_buttons_frame,
            text="Iniciar Servicios Individuales:",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        individual_title.pack(pady=5)
        
        # Grid de botones individuales
        buttons_grid = ctk.CTkFrame(individual_buttons_frame)
        buttons_grid.pack(fill="x", pady=5)
        
        # Backend
        self.backend_button = ctk.CTkButton(
            buttons_grid,
            text="🔧 Backend",
            command=self.toggle_backend,
            font=ctk.CTkFont(size=12),
            height=35
        )
        self.backend_button.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        # Frontend
        self.frontend_button = ctk.CTkButton(
            buttons_grid,
            text="🎨 Frontend",
            command=self.toggle_frontend,
            font=ctk.CTkFont(size=12),
            height=35
        )
        self.frontend_button.pack(side="left", fill="x", expand=True, padx=5)
        
        # License Service
        self.license_button = ctk.CTkButton(
            buttons_grid,
            text="🔐 License",
            command=self.toggle_license,
            font=ctk.CTkFont(size=12),
            height=35
        )
        self.license_button.pack(side="left", fill="x", expand=True, padx=(5, 0))
        
        # Puente Impresión
        self.puente_button = ctk.CTkButton(
            buttons_grid,
            text="🖨️ Puente",
            command=self.toggle_puente,
            font=ctk.CTkFont(size=12),
            height=35
        )
        self.puente_button.pack(side="left", fill="x", expand=True, padx=(5, 0))
        
        # Frame de acciones
        actions_frame = ctk.CTkFrame(main_frame)
        actions_frame.pack(fill="x", padx=20, pady=10)
        
        # Botones de acción
        action_buttons_frame = ctk.CTkFrame(actions_frame)
        action_buttons_frame.pack(fill="x", padx=20, pady=20)
        
        # Botón del navegador
        self.browser_button = ctk.CTkButton(
            action_buttons_frame,
            text="🌐 Abrir en Navegador",
            command=self.open_browser,
            font=ctk.CTkFont(size=14),
            height=40,
            state="disabled"
        )
        self.browser_button.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        # Botón de configuración
        config_button = ctk.CTkButton(
            action_buttons_frame,
            text="⚙️ Configuración",
            command=self.show_config,
            font=ctk.CTkFont(size=14),
            height=40
        )
        config_button.pack(side="right", fill="x", expand=True, padx=(5, 0))
        
        # Frame de logs
        logs_frame = ctk.CTkFrame(main_frame)
        logs_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # Título de logs
        logs_title = ctk.CTkLabel(
            logs_frame,
            text="📝 Logs del Sistema",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        logs_title.pack(pady=10)
        
        # Área de logs
        self.logs_text = ctk.CTkTextbox(
            logs_frame,
            height=150,
            font=ctk.CTkFont(size=10)
        )
        self.logs_text.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Botón para limpiar logs
        clear_logs_button = ctk.CTkButton(
            logs_frame,
            text="🗑️ Limpiar Logs",
            command=self.clear_logs,
            font=ctk.CTkFont(size=10),
            height=30
        )
        clear_logs_button.pack(pady=(0, 10))
    
    def show_logs(self, service):
        """Mostrar logs de un servicio específico"""
        log_window = ctk.CTkToplevel(self.root)
        log_window.title(f"Logs - {service.title()}")
        log_window.geometry("800x600")
        log_window.resizable(True, True)
        
        # Centrar ventana
        log_window.transient(self.root)
        log_window.grab_set()
        
        # Frame principal
        main_frame = ctk.CTkFrame(log_window)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Título
        title_label = ctk.CTkLabel(
            main_frame,
            text=f"📋 Logs de {service.title()}",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        title_label.pack(pady=10)
        
        # Área de logs
        logs_text = ctk.CTkTextbox(main_frame)
        logs_text.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        # Función para actualizar logs en tiempo real
        def update_logs():
            logs_text.configure(state="normal")
            logs_text.delete("1.0", "end")
            
            if service == "backend":
                logs = self.backend_logs
            elif service == "frontend":
                logs = self.frontend_logs
            elif service == "license":
                logs = self.license_logs
            elif service == "puente":
                logs = self.puente_logs
            else:
                logs = []
            
            for log in logs:
                logs_text.insert("end", f"{log}\n")
            
            logs_text.see("end")  # Auto-scroll al final
            logs_text.configure(state="disabled")
            
            # Programar siguiente actualización si la ventana sigue abierta
            if log_window.winfo_exists():
                log_window.after(1000, update_logs)  # Actualizar cada segundo
        
        # Iniciar actualización automática
        update_logs()
        
        # Botones
        buttons_frame = ctk.CTkFrame(main_frame)
        buttons_frame.pack(fill="x", pady=(0, 10))
        
        def refresh_logs():
            logs_text.configure(state="normal")
            logs_text.delete("1.0", "end")
            
            if service == "backend":
                logs = self.backend_logs
            elif service == "frontend":
                logs = self.frontend_logs
            elif service == "license":
                logs = self.license_logs
            elif service == "puente":
                logs = self.puente_logs
            
            for log in logs:
                logs_text.insert("end", f"{log}\n")
            
            logs_text.see("end")
            logs_text.configure(state="disabled")
        
        refresh_button = ctk.CTkButton(
            buttons_frame,
            text="🔄 Actualizar",
            command=refresh_logs
        )
        refresh_button.pack(side="left", padx=(0, 5))
        
        close_button = ctk.CTkButton(
            buttons_frame,
            text="❌ Cerrar",
            command=log_window.destroy
        )
        close_button.pack(side="right", padx=(5, 0))
    
    def clear_logs(self):
        """Limpiar logs del sistema"""
        self.logs_text.configure(state="normal")
        self.logs_text.delete("1.0", "end")
        self.logs_text.configure(state="disabled")
        self.log("🗑️ Logs del sistema limpiados")
    
    def log(self, message):
        """Agregar mensaje al log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        
        # Agregar al área de logs
        self.logs_text.configure(state="normal")
        self.logs_text.insert("end", log_message + "\n")
        self.logs_text.see("end")
        self.logs_text.configure(state="disabled")
        
        print(log_message)
    
    def check_ports_on_startup(self):
        """Verificar puertos al inicio"""
        self.log("🔍 Verificando puertos...")
        
        exe_dir = get_exe_dir()
        backend_path = os.path.join(exe_dir, self.config["backend_path"])
        if self.is_port_in_use(self.config["backend_port"]):
            self.log(f"⚠️ Puerto {self.config['backend_port']} (Backend) en uso")
        else:
            self.log(f"✅ Puerto {self.config['backend_port']} (Backend) disponible")
        
        frontend_path = os.path.join(exe_dir, self.config["frontend_path"])
        if self.is_port_in_use(self.config["frontend_port"]):
            self.log(f"⚠️ Puerto {self.config['frontend_port']} (Frontend) en uso")
        else:
            self.log(f"✅ Puerto {self.config['frontend_port']} (Frontend) disponible")
        
        license_path = os.path.join(exe_dir, self.config["license_path"])
        if self.is_port_in_use(self.config["license_port"]):
            self.log(f"⚠️ Puerto {self.config['license_port']} (License) en uso")
        else:
            self.log(f"✅ Puerto {self.config['license_port']} (License) disponible")
    
    def is_port_in_use(self, port):
        """Verificar si un puerto está en uso"""
        try:
            import socket
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return False
        except OSError:
            return True
    
    def toggle_services(self):
        """Alternar todos los servicios"""
        if self.is_running:
            self.stop_services()
        else:
            self.start_services()
    
    def toggle_all_services(self):
        """Alternar todos los servicios"""
        if self.is_running:
            self.stop_services()
        else:
            self.start_services()
    
    def toggle_backend(self):
        """Alternar backend"""
        if self.backend_running:
            self.stop_backend()
        else:
            self.start_backend()
    
    def toggle_frontend(self):
        """Alternar frontend"""
        if self.frontend_running:
            self.stop_frontend()
        else:
            self.start_frontend()
    
    def toggle_license(self):
        """Alternar license service"""
        if self.license_running:
            self.stop_license()
        else:
            self.start_license_service()
    
    def toggle_puente(self):
        """Alternar puente de impresión"""
        if self.puente_running:
            self.stop_puente()
        else:
            self.start_puente()
    
    def stop_backend(self):
        """Detener backend"""
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            self.backend_process = None
            self.backend_running = False
            self.backend_status.configure(text="🔴 Backend: Detenido")
            self.backend_button.configure(text="🔧 Backend")
            self.log("🛑 Backend detenido")
    
    def stop_frontend(self):
        """Detener frontend"""
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            self.frontend_process = None
            self.frontend_running = False
            self.frontend_status.configure(text="🔴 Frontend: Detenido")
            self.frontend_button.configure(text="🎨 Frontend")
            self.log("🛑 Frontend detenido")
    
    def stop_license(self):
        """Detener license service"""
        if self.license_process:
            try:
                self.license_process.terminate()
                self.license_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.license_process.kill()
            self.license_process = None
            self.license_running = False
            self.license_status.configure(text="🔴 License Service: Detenido")
            self.license_button.configure(text="🔐 License")
            self.log("🛑 License Service detenido")
    
    def stop_puente(self):
        """Detener puente de impresión"""
        if self.puente_process:
            try:
                self.puente_process.terminate()
                self.puente_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.puente_process.kill()
            self.puente_process = None
            self.puente_running = False
            self.puente_status.configure(text="🔴 Puente Impresión: Detenido")
            self.puente_button.configure(text="🖨️ Puente")
            self.log("🛑 Puente Impresión detenido")
    
    def start_services(self):
        """Iniciar todos los servicios"""
        self.log("🚀 Iniciando todos los servicios...")
        
        exe_dir = get_exe_dir()

        # Iniciar en hilos separados
        threading.Thread(target=self.start_backend, daemon=True).start()
        time.sleep(2)
        threading.Thread(target=self.start_frontend, daemon=True).start()
        time.sleep(2)
        threading.Thread(target=self.start_license_service, daemon=True).start()
        time.sleep(2)
        threading.Thread(target=self.start_puente, daemon=True).start()
        
        self.is_running = True
        self.main_button.configure(text="🛑 Detener Todos los Servicios")
        
        # Habilitar botón del navegador después de un tiempo
        threading.Thread(target=self.enable_browser_button, daemon=True).start()
    
    def stop_services(self):
        """Detener todos los servicios"""
        self.log("🛑 Deteniendo todos los servicios...")
        
        self.stop_backend()
        self.stop_frontend()
        self.stop_license()
        self.stop_puente()
        
        self.is_running = False
        self.main_button.configure(text="🚀 Iniciar Todos los Servicios")
        self.browser_button.configure(state="disabled")
    
    def start_backend(self):
        """Iniciar backend"""
        try:
            exe_dir = get_exe_dir()
            backend_path = os.path.join(exe_dir, self.config["backend_path"])
            if os.path.exists(backend_path):
                self.log("🔧 Iniciando Backend...")
                
                # Verificar que el JAR existe
                jar_path = os.path.join(backend_path, "backend.jar")
                if not os.path.exists(jar_path):
                    self.log(f"❌ Error: No se encontró backend.jar en {backend_path}")
                    return
                
                # Usar java_path si está configurado
                java_cmd = "java"
                if self.config.get("java_path"):
                    java_cmd = os.path.join(self.config["java_path"], "java.exe")
                
                self.log(f"🔧 Ejecutando: {java_cmd} -jar backend.jar")
                self.log(f"🔧 Directorio: {backend_path}")
                self.log(f"🔧 JAR: {jar_path}")
                
                self.backend_process = subprocess.Popen(
                    [java_cmd, "-jar", "backend.jar"],
                    cwd=backend_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
                
                # Verificar que el proceso se inició correctamente
                if self.backend_process.poll() is None:
                    self.log("✅ Proceso Backend iniciado correctamente")
                    # Agregar log de prueba
                    self.backend_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Backend: Proceso iniciado correctamente")
                else:
                    self.log("❌ Error: El proceso Backend no se inició correctamente")
                    return
                
                # Iniciar hilos para leer logs
                threading.Thread(target=self.read_backend_logs, daemon=True).start()
                
                self.backend_running = True
                self.backend_status.configure(text="🟢 Backend: Ejecutándose")
                self.backend_button.configure(text="🛑 Backend")
                self.log("✅ Backend iniciado correctamente")
            else:
                self.log(f"❌ Error: No se encontró el directorio del backend en {backend_path}")
        except Exception as e:
            self.log(f"❌ Error iniciando Backend: {str(e)}")
    
    def start_frontend(self):
        """Iniciar frontend"""
        try:
            exe_dir = get_exe_dir()
            frontend_path = os.path.join(exe_dir, self.config["frontend_path"])
            if os.path.exists(frontend_path):
                self.log("🎨 Iniciando Frontend...")
                
                # Verificar que package.json existe
                package_json = os.path.join(frontend_path, "package.json")
                if not os.path.exists(package_json):
                    self.log(f"❌ Error: No se encontró package.json en {frontend_path}")
                    return
                
                npm_cmd = find_npm()
                if not npm_cmd:
                    self.log("❌ Error: No se encontró npm. Asegúrate de tener Node.js instalado y en el PATH.")
                    return
                
                self.log(f"🎨 Ejecutando: {npm_cmd} run dev")
                self.log(f"🎨 Directorio: {frontend_path}")
                self.log(f"🎨 Package.json: {package_json}")
                
                self.frontend_process = subprocess.Popen(
                    [npm_cmd, "run", "dev"],
                    cwd=frontend_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
                
                # Verificar que el proceso se inició correctamente
                if self.frontend_process.poll() is None:
                    self.log("✅ Proceso Frontend iniciado correctamente")
                    # Agregar log de prueba
                    self.frontend_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Frontend: Proceso iniciado correctamente")
                else:
                    self.log("❌ Error: El proceso Frontend no se inició correctamente")
                    return
                
                # Iniciar hilos para leer logs
                threading.Thread(target=self.read_frontend_logs, daemon=True).start()
                
                self.frontend_running = True
                self.frontend_status.configure(text="🟢 Frontend: Ejecutándose")
                self.frontend_button.configure(text="🛑 Frontend")
                self.log("✅ Frontend iniciado correctamente")
            else:
                self.log(f"❌ Error: No se encontró el directorio del frontend en {frontend_path}")
        except Exception as e:
            self.log(f"❌ Error iniciando Frontend: {str(e)}")
    
    def start_license_service(self):
        """Iniciar license service"""
        try:
            exe_dir = get_exe_dir()
            license_path = os.path.join(exe_dir, self.config["license_path"])
            if os.path.exists(license_path):
                self.log("🔐 Iniciando License Service...")
                
                # Verificar que el JAR existe
                jar_path = os.path.join(license_path, "license-service.jar")
                if not os.path.exists(jar_path):
                    self.log(f"❌ Error: No se encontró license-service.jar en {license_path}")
                    return
                
                # Usar java_path si está configurado
                java_cmd = "java"
                if self.config.get("java_path"):
                    java_cmd = os.path.join(self.config["java_path"], "java.exe")
                
                self.log(f"🔐 Ejecutando: {java_cmd} -jar license-service.jar")
                self.log(f"🔐 Directorio: {license_path}")
                self.log(f"🔐 JAR: {jar_path}")
                
                self.license_process = subprocess.Popen(
                    [java_cmd, "-jar", "license-service.jar"],
                    cwd=license_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
                
                # Verificar que el proceso se inició correctamente
                if self.license_process.poll() is None:
                    self.log("✅ Proceso License Service iniciado correctamente")
                    # Agregar log de prueba
                    self.license_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] License: Proceso iniciado correctamente")
                else:
                    self.log("❌ Error: El proceso License Service no se inició correctamente")
                    return
                
                # Iniciar hilos para leer logs
                threading.Thread(target=self.read_license_logs, daemon=True).start()
                
                self.license_running = True
                self.license_status.configure(text="🟢 License Service: Ejecutándose")
                self.license_button.configure(text="🛑 License")
                self.log("✅ License Service iniciado correctamente")
            else:
                self.log(f"❌ Error: No se encontró el directorio del license service en {license_path}")
        except Exception as e:
            self.log(f"❌ Error iniciando License Service: {str(e)}")
    
    def start_puente(self):
        """Iniciar puente de impresión"""
        try:
            exe_dir = get_exe_dir()
            puente_path = os.path.join(exe_dir, self.config["puente_path"])
            if os.path.exists(puente_path):
                self.log("🖨️ Iniciando Puente de Impresión...")
                
                # Verificar que index.js existe
                index_js = os.path.join(puente_path, "index.js")
                if not os.path.exists(index_js):
                    self.log(f"❌ Error: No se encontró index.js en {puente_path}")
                    return
                
                self.log(f"🖨️ Ejecutando: node index.js")
                self.log(f"🖨️ Directorio: {puente_path}")
                self.log(f"🖨️ Index.js: {index_js}")
                
                self.puente_process = subprocess.Popen(
                    ["node", "index.js"],
                    cwd=puente_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
                
                # Verificar que el proceso se inició correctamente
                if self.puente_process.poll() is None:
                    self.log("✅ Proceso Puente de Impresión iniciado correctamente")
                    # Agregar log de prueba
                    self.puente_logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] Puente: Proceso iniciado correctamente")
                else:
                    self.log("❌ Error: El proceso Puente de Impresión no se inició correctamente")
                    return
                
                # Iniciar hilos para leer logs
                threading.Thread(target=self.read_puente_logs, daemon=True).start()
                
                self.puente_running = True
                self.puente_status.configure(text="🟢 Puente Impresión: Ejecutándose")
                self.puente_button.configure(text="🛑 Puente")
                self.log("✅ Puente de Impresión iniciado correctamente")
            else:
                self.log(f"❌ Error: No se encontró el directorio del puente de impresión en {puente_path}")
        except Exception as e:
            self.log(f"❌ Error iniciando Puente de Impresión: {str(e)}")
    
    def read_backend_logs(self):
        """Leer logs del backend"""
        self.log("🔍 Iniciando captura de logs del Backend...")
        
        exe_dir = get_exe_dir()
        backend_path = os.path.join(exe_dir, self.config["backend_path"])

        if self.backend_process and self.backend_process.stdout:
            try:
                self.log("📖 Leyendo stdout del Backend...")
                for line in iter(self.backend_process.stdout.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Backend: {line.strip()}"
                        self.backend_logs.append(log_entry)
                        if len(self.backend_logs) > 1000:  # Limitar logs
                            self.backend_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Backend log: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo logs del backend: {e}")
        
        # También leer stderr
        if self.backend_process and self.backend_process.stderr:
            try:
                self.log("📖 Leyendo stderr del Backend...")
                for line in iter(self.backend_process.stderr.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Backend ERROR: {line.strip()}"
                        self.backend_logs.append(log_entry)
                        if len(self.backend_logs) > 1000:  # Limitar logs
                            self.backend_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Backend error: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo stderr del backend: {e}")
    
    def read_frontend_logs(self):
        """Leer logs del frontend"""
        self.log("🔍 Iniciando captura de logs del Frontend...")
        
        exe_dir = get_exe_dir()
        frontend_path = os.path.join(exe_dir, self.config["frontend_path"])

        if self.frontend_process and self.frontend_process.stdout:
            try:
                self.log("📖 Leyendo stdout del Frontend...")
                for line in iter(self.frontend_process.stdout.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Frontend: {line.strip()}"
                        self.frontend_logs.append(log_entry)
                        if len(self.frontend_logs) > 1000:  # Limitar logs
                            self.frontend_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Frontend log: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo logs del frontend: {e}")
        
        # También leer stderr
        if self.frontend_process and self.frontend_process.stderr:
            try:
                self.log("📖 Leyendo stderr del Frontend...")
                for line in iter(self.frontend_process.stderr.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Frontend ERROR: {line.strip()}"
                        self.frontend_logs.append(log_entry)
                        if len(self.frontend_logs) > 1000:  # Limitar logs
                            self.frontend_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Frontend error: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo stderr del frontend: {e}")
    
    def read_license_logs(self):
        """Leer logs del license service"""
        self.log("🔍 Iniciando captura de logs del License Service...")
        
        exe_dir = get_exe_dir()
        license_path = os.path.join(exe_dir, self.config["license_path"])

        if self.license_process and self.license_process.stdout:
            try:
                self.log("📖 Leyendo stdout del License Service...")
                for line in iter(self.license_process.stdout.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] License: {line.strip()}"
                        self.license_logs.append(log_entry)
                        if len(self.license_logs) > 1000:  # Limitar logs
                            self.license_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"License log: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo logs del license: {e}")
        
        # También leer stderr
        if self.license_process and self.license_process.stderr:
            try:
                self.log("📖 Leyendo stderr del License Service...")
                for line in iter(self.license_process.stderr.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] License ERROR: {line.strip()}"
                        self.license_logs.append(log_entry)
                        if len(self.license_logs) > 1000:  # Limitar logs
                            self.license_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"License error: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo stderr del license: {e}")
    
    def read_puente_logs(self):
        """Leer logs del puente de impresión"""
        self.log("🔍 Iniciando captura de logs del Puente de Impresión...")
        
        exe_dir = get_exe_dir()
        puente_path = os.path.join(exe_dir, self.config["puente_path"])

        if self.puente_process and self.puente_process.stdout:
            try:
                self.log("📖 Leyendo stdout del Puente de Impresión...")
                for line in iter(self.puente_process.stdout.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Puente: {line.strip()}"
                        self.puente_logs.append(log_entry)
                        if len(self.puente_logs) > 1000:  # Limitar logs
                            self.puente_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Puente log: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo logs del puente: {e}")
        
        # También leer stderr
        if self.puente_process and self.puente_process.stderr:
            try:
                self.log("📖 Leyendo stderr del Puente de Impresión...")
                for line in iter(self.puente_process.stderr.readline, ''):
                    if line:
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        log_entry = f"[{timestamp}] Puente ERROR: {line.strip()}"
                        self.puente_logs.append(log_entry)
                        if len(self.puente_logs) > 1000:  # Limitar logs
                            self.puente_logs.pop(0)
                        # Actualizar interfaz en el hilo principal
                        self.root.after(0, self.update_logs_display)
                        print(f"Puente error: {line.strip()}")  # Debug
            except Exception as e:
                self.log(f"❌ Error leyendo stderr del puente: {e}")
    
    def update_logs_display(self):
        """Actualizar la visualización de logs en la interfaz"""
        try:
            # Actualizar logs del sistema
            self.logs_text.configure(state="normal")
            # No limpiar aquí, solo agregar nuevos logs si es necesario
            self.logs_text.configure(state="disabled")
        except Exception as e:
            print(f"Error actualizando logs display: {e}")
    
    def check_process_status(self):
        """Verificar el estado de los procesos y generar logs de prueba"""
        try:
            exe_dir = get_exe_dir()

            # Verificar Backend
            if self.backend_process and self.backend_running:
                backend_path = os.path.join(exe_dir, self.config["backend_path"])
                if self.backend_process.poll() is None:
                    # Proceso está ejecutándose, agregar log de prueba
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    self.backend_logs.append(f"[{timestamp}] Backend: Proceso ejecutándose normalmente")
                else:
                    self.log("⚠️ Proceso Backend terminó inesperadamente")
                    self.backend_running = False
                    self.backend_status.configure(text="🔴 Backend: Detenido")
                    self.backend_button.configure(text="🔧 Backend")
            
            # Verificar Frontend
            if self.frontend_process and self.frontend_running:
                frontend_path = os.path.join(exe_dir, self.config["frontend_path"])
                if self.frontend_process.poll() is None:
                    # Proceso está ejecutándose, agregar log de prueba
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    self.frontend_logs.append(f"[{timestamp}] Frontend: Proceso ejecutándose normalmente")
                else:
                    self.log("⚠️ Proceso Frontend terminó inesperadamente")
                    self.frontend_running = False
                    self.frontend_status.configure(text="🔴 Frontend: Detenido")
                    self.frontend_button.configure(text="🎨 Frontend")
            
            # Verificar License Service
            if self.license_process and self.license_running:
                license_path = os.path.join(exe_dir, self.config["license_path"])
                if self.license_process.poll() is None:
                    # Proceso está ejecutándose, agregar log de prueba
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    self.license_logs.append(f"[{timestamp}] License: Proceso ejecutándose normalmente")
                else:
                    self.log("⚠️ Proceso License Service terminó inesperadamente")
                    self.license_running = False
                    self.license_status.configure(text="🔴 License Service: Detenido")
                    self.license_button.configure(text="🔐 License")
            
            # Verificar Puente de Impresión
            if self.puente_process and self.puente_running:
                puente_path = os.path.join(exe_dir, self.config["puente_path"])
                if self.puente_process.poll() is None:
                    # Proceso está ejecutándose, agregar log de prueba
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    self.puente_logs.append(f"[{timestamp}] Puente: Proceso ejecutándose normalmente")
                else:
                    self.log("⚠️ Proceso Puente de Impresión terminó inesperadamente")
                    self.puente_running = False
                    self.puente_status.configure(text="🔴 Puente Impresión: Detenido")
                    self.puente_button.configure(text="🖨️ Puente")
            
            # Programar siguiente verificación
            self.root.after(5000, self.check_process_status)  # Verificar cada 5 segundos
            
        except Exception as e:
            self.log(f"❌ Error verificando estado de procesos: {e}")
    
    def enable_browser_button(self):
        """Habilitar botón del navegador"""
        time.sleep(5)  # Esperar a que los servicios se inicien
        self.browser_button.configure(state="normal")
        self.log("🌐 Navegador habilitado")
        
        # Iniciar verificación de procesos
        self.check_process_status()
    
    def open_browser(self):
        """Abrir aplicación en el navegador"""
        try:
            exe_dir = get_exe_dir()
            frontend_path = os.path.join(exe_dir, self.config["frontend_path"])
            url = f"http://localhost:{self.config['frontend_port']}"
            webbrowser.open(url)
            self.log(f"🌐 Abriendo navegador en {url}")
        except Exception as e:
            self.log(f"❌ Error abriendo navegador: {str(e)}")
    
    def show_config(self):
        """Mostrar ventana de configuración"""
        config_window = ctk.CTkToplevel(self.root)
        config_window.title("Configuración")
        config_window.geometry("600x700")
        config_window.resizable(False, False)
        
        # Centrar ventana
        config_window.transient(self.root)
        config_window.grab_set()
        
        # Contenido de configuración
        content_frame = ctk.CTkFrame(config_window)
        content_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        title_label = ctk.CTkLabel(
            content_frame,
            text="⚙️ Configuración del Launcher",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        title_label.pack(pady=10)
        
        # Crear scrollable frame
        scroll_frame = ctk.CTkScrollableFrame(content_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Campos de configuración
        fields_frame = ctk.CTkFrame(scroll_frame)
        fields_frame.pack(fill="x", pady=10)
        
        # Título de puertos
        ports_title = ctk.CTkLabel(
            fields_frame,
            text="🔌 Configuración de Puertos",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        ports_title.pack(pady=10)
        
        # Backend Port
        ctk.CTkLabel(fields_frame, text="Puerto Backend:").pack(anchor="w", pady=2)
        backend_port_entry = ctk.CTkEntry(fields_frame)
        backend_port_entry.insert(0, str(self.config["backend_port"]))
        backend_port_entry.pack(fill="x", pady=(0, 10))
        
        # Frontend Port
        ctk.CTkLabel(fields_frame, text="Puerto Frontend:").pack(anchor="w", pady=2)
        frontend_port_entry = ctk.CTkEntry(fields_frame)
        frontend_port_entry.insert(0, str(self.config["frontend_port"]))
        frontend_port_entry.pack(fill="x", pady=(0, 10))
        
        # License Port
        ctk.CTkLabel(fields_frame, text="Puerto License Service:").pack(anchor="w", pady=2)
        license_port_entry = ctk.CTkEntry(fields_frame)
        license_port_entry.insert(0, str(self.config["license_port"]))
        license_port_entry.pack(fill="x", pady=(0, 10))
        
        # Título de rutas
        paths_title = ctk.CTkLabel(
            fields_frame,
            text="📁 Configuración de Rutas",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        paths_title.pack(pady=10)
        
        # Backend Path
        ctk.CTkLabel(fields_frame, text="Ruta Backend:").pack(anchor="w", pady=2)
        backend_path_entry = ctk.CTkEntry(fields_frame)
        backend_path_entry.insert(0, self.config.get("backend_path", ""))
        backend_path_entry.pack(fill="x", pady=(0, 10))
        
        # Frontend Path
        ctk.CTkLabel(fields_frame, text="Ruta Frontend:").pack(anchor="w", pady=2)
        frontend_path_entry = ctk.CTkEntry(fields_frame)
        frontend_path_entry.insert(0, self.config.get("frontend_path", ""))
        frontend_path_entry.pack(fill="x", pady=(0, 10))
        
        # License Path
        ctk.CTkLabel(fields_frame, text="Ruta License Service:").pack(anchor="w", pady=2)
        license_path_entry = ctk.CTkEntry(fields_frame)
        license_path_entry.insert(0, self.config.get("license_path", ""))
        license_path_entry.pack(fill="x", pady=(0, 10))
        
        # Puente Path
        ctk.CTkLabel(fields_frame, text="Ruta Puente Impresión:").pack(anchor="w", pady=2)
        puente_path_entry = ctk.CTkEntry(fields_frame)
        puente_path_entry.insert(0, self.config.get("puente_path", ""))
        puente_path_entry.pack(fill="x", pady=(0, 10))
        
        # Título de ejecutables
        exe_title = ctk.CTkLabel(
            fields_frame,
            text="💻 Configuración de Ejecutables",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        exe_title.pack(pady=10)
        
        # Backend EXE
        ctk.CTkLabel(fields_frame, text="Ejecutable Backend (.exe):").pack(anchor="w", pady=2)
        backend_exe_entry = ctk.CTkEntry(fields_frame)
        backend_exe_entry.insert(0, self.config.get("exe_paths", {}).get("backend_exe", ""))
        backend_exe_entry.pack(fill="x", pady=(0, 10))
        
        # Frontend EXE
        ctk.CTkLabel(fields_frame, text="Ejecutable Frontend (.exe):").pack(anchor="w", pady=2)
        frontend_exe_entry = ctk.CTkEntry(fields_frame)
        frontend_exe_entry.insert(0, self.config.get("exe_paths", {}).get("frontend_exe", ""))
        frontend_exe_entry.pack(fill="x", pady=(0, 10))
        
        # License EXE
        ctk.CTkLabel(fields_frame, text="Ejecutable License (.exe):").pack(anchor="w", pady=2)
        license_exe_entry = ctk.CTkEntry(fields_frame)
        license_exe_entry.insert(0, self.config.get("exe_paths", {}).get("license_exe", ""))
        license_exe_entry.pack(fill="x", pady=(0, 10))
        
        # Puente EXE
        ctk.CTkLabel(fields_frame, text="Ejecutable Puente (.exe):").pack(anchor="w", pady=2)
        puente_exe_entry = ctk.CTkEntry(fields_frame)
        puente_exe_entry.insert(0, self.config.get("exe_paths", {}).get("puente_exe", ""))
        puente_exe_entry.pack(fill="x", pady=(0, 10))
        
        # Título de configuración avanzada
        advanced_title = ctk.CTkLabel(
            fields_frame,
            text="🔧 Configuración Avanzada",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        advanced_title.pack(pady=10)
        
        # Java Path
        java_path_frame = ctk.CTkFrame(fields_frame)
        java_path_frame.pack(fill="x", pady=(0, 10))
        
        ctk.CTkLabel(java_path_frame, text="Ruta de Java (opcional):").pack(anchor="w", pady=2)
        
        java_path_entry_frame = ctk.CTkFrame(java_path_frame)
        java_path_entry_frame.pack(fill="x", pady=2)
        
        java_path_entry = ctk.CTkEntry(java_path_entry_frame)
        java_path_entry.insert(0, self.config.get("java_path", ""))
        java_path_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        def browse_java():
            java_dir = filedialog.askdirectory(title="Seleccionar directorio de Java")
            if java_dir:
                java_path_entry.delete(0, tk.END)
                java_path_entry.insert(0, java_dir)
        
        browse_button = ctk.CTkButton(
            java_path_entry_frame,
            text="📁",
            width=40,
            command=browse_java
        )
        browse_button.pack(side="right")
        
        # Auto detect paths
        auto_detect_var = tk.BooleanVar(value=self.config.get("auto_detect_paths", True))
        auto_detect_check = ctk.CTkCheckBox(
            fields_frame,
            text="Detectar rutas automáticamente al iniciar",
            variable=auto_detect_var
        )
        auto_detect_check.pack(anchor="w", pady=(0, 10))
        
        # Show Consoles
        show_consoles_var = tk.BooleanVar(value=self.config.get("show_consoles", True))
        show_consoles_check = ctk.CTkCheckBox(
            fields_frame,
            text="Mostrar consolas de servicios",
            variable=show_consoles_var
        )
        show_consoles_check.pack(anchor="w", pady=(0, 10))
        
        # Botones
        buttons_frame = ctk.CTkFrame(content_frame)
        buttons_frame.pack(fill="x", padx=20, pady=20)
        
        def detect_paths():
            """Detectar rutas automáticamente"""
            self.detect_project_structure()
            # Actualizar campos
            backend_path_entry.delete(0, tk.END)
            backend_path_entry.insert(0, self.config.get("backend_path", ""))
            frontend_path_entry.delete(0, tk.END)
            frontend_path_entry.insert(0, self.config.get("frontend_path", ""))
            license_path_entry.delete(0, tk.END)
            license_path_entry.insert(0, self.config.get("license_path", ""))
            puente_path_entry.delete(0, tk.END)
            puente_path_entry.insert(0, self.config.get("puente_path", ""))
            self.log("✅ Rutas detectadas automáticamente")
        
        def save_config():
            try:
                self.config["backend_port"] = int(backend_port_entry.get())
                self.config["frontend_port"] = int(frontend_port_entry.get())
                self.config["license_port"] = int(license_port_entry.get())
                self.config["backend_path"] = backend_path_entry.get()
                self.config["frontend_path"] = frontend_path_entry.get()
                self.config["license_path"] = license_path_entry.get()
                self.config["puente_path"] = puente_path_entry.get()
                self.config["java_path"] = java_path_entry.get()
                self.config["auto_detect_paths"] = auto_detect_var.get()
                self.config["show_consoles"] = show_consoles_var.get()
                
                # Guardar rutas de ejecutables
                self.config["exe_paths"] = {
                    "backend_exe": backend_exe_entry.get(),
                    "frontend_exe": frontend_exe_entry.get(),
                    "license_exe": license_exe_entry.get(),
                    "puente_exe": puente_exe_entry.get()
                }
                
                self.save_config()
                self.log("✅ Configuración guardada")
                config_window.destroy()
            except ValueError:
                messagebox.showerror("Error", "Los puertos deben ser números válidos")
        
        # Botones
        detect_button = ctk.CTkButton(
            buttons_frame,
            text="🔍 Detectar Rutas",
            command=detect_paths
        )
        detect_button.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        save_button = ctk.CTkButton(
            buttons_frame,
            text="💾 Guardar",
            command=save_config
        )
        save_button.pack(side="left", fill="x", expand=True, padx=5)
        
        cancel_button = ctk.CTkButton(
            buttons_frame,
            text="❌ Cancelar",
            command=config_window.destroy
        )
        cancel_button.pack(side="right", fill="x", expand=True, padx=(5, 0))
    
    def run(self):
        """Ejecutar la aplicación"""
        self.log("🎯 Launcher iniciado")
        self.root.mainloop()

if __name__ == "__main__":
    app = ModernLauncher()
    app.run() 