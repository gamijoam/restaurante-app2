#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PrintBridgeManager {
    constructor() {
        this.process = null;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.restartDelay = 5000;
        this.isShuttingDown = false;
        this.logFile = path.join(__dirname, 'print-bridge.log');
        
        // Configurar logging
        this.setupLogging();
        
        console.log('🚀 Iniciando Gestor del Puente de Impresión...');
        console.log('📁 Directorio:', __dirname);
        console.log('📝 Log file:', this.logFile);
    }

    setupLogging() {
        // Crear stream de logging
        const logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
        
        // Interceptar console.log y console.error
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
            const message = `[${new Date().toISOString()}] [INFO] ${args.join(' ')}\n`;
            logStream.write(message);
            originalLog(...args);
        };
        
        console.error = (...args) => {
            const message = `[${new Date().toISOString()}] [ERROR] ${args.join(' ')}\n`;
            logStream.write(message);
            originalError(...args);
        };
    }

    startProcess() {
        if (this.isShuttingDown) return;
        
        console.log(`🔄 Iniciando proceso del puente de impresión (intento ${this.restartCount + 1}/${this.maxRestarts})`);
        
        const scriptPath = path.join(__dirname, 'index.js');
        
        this.process = spawn('node', [scriptPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });

        // Configurar handlers de eventos
        this.process.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                console.log(`[PUENTE] ${output}`);
            }
        });

        this.process.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error) {
                console.error(`[PUENTE ERROR] ${error}`);
            }
        });

        this.process.on('close', (code) => {
            console.log(`❌ Proceso del puente de impresión terminado con código: ${code}`);
            
            if (!this.isShuttingDown && this.restartCount < this.maxRestarts) {
                this.restartCount++;
                console.log(`🔄 Reiniciando en ${this.restartDelay/1000} segundos...`);
                
                setTimeout(() => {
                    this.startProcess();
                }, this.restartDelay);
            } else if (this.restartCount >= this.maxRestarts) {
                console.error('❌ Máximo número de reinicios alcanzado. Deteniendo gestor.');
                process.exit(1);
            }
        });

        this.process.on('error', (error) => {
            console.error('❌ Error iniciando proceso:', error);
            
            if (!this.isShuttingDown && this.restartCount < this.maxRestarts) {
                this.restartCount++;
                setTimeout(() => {
                    this.startProcess();
                }, this.restartDelay);
            }
        });

        // Health check
        this.startHealthCheck();
    }

    startHealthCheck() {
        const healthCheck = setInterval(() => {
            if (this.isShuttingDown) {
                clearInterval(healthCheck);
                return;
            }
            
            if (this.process && this.process.killed) {
                console.log('⚠️ Proceso detectado como terminado, reiniciando...');
                clearInterval(healthCheck);
                this.restartProcess();
            }
        }, 30000); // Verificar cada 30 segundos
    }

    restartProcess() {
        if (this.isShuttingDown) return;
        
        console.log('🔄 Reiniciando proceso del puente de impresión...');
        
        if (this.process) {
            this.process.kill('SIGTERM');
        }
        
        setTimeout(() => {
            if (!this.isShuttingDown) {
                this.startProcess();
            }
        }, 2000);
    }

    stopProcess() {
        console.log('🛑 Deteniendo proceso del puente de impresión...');
        this.isShuttingDown = true;
        
        if (this.process) {
            this.process.kill('SIGTERM');
            
            // Forzar cierre si no responde
            setTimeout(() => {
                if (this.process && !this.process.killed) {
                    console.log('⚠️ Forzando cierre del proceso...');
                    this.process.kill('SIGKILL');
                }
            }, 5000);
        }
    }

    // Método para verificar el estado del proceso
    getStatus() {
        return {
            isRunning: this.process && !this.process.killed,
            restartCount: this.restartCount,
            maxRestarts: this.maxRestarts,
            isShuttingDown: this.isShuttingDown
        };
    }
}

// Crear instancia del gestor
const manager = new PrintBridgeManager();

// Manejar señales de terminación
process.on('SIGINT', () => {
    console.log('\n🛑 Recibida señal SIGINT, cerrando...');
    manager.stopProcess();
    setTimeout(() => {
        process.exit(0);
    }, 2000);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Recibida señal SIGTERM, cerrando...');
    manager.stopProcess();
    setTimeout(() => {
        process.exit(0);
    }, 2000);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    manager.stopProcess();
    setTimeout(() => {
        process.exit(1);
    }, 2000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    manager.stopProcess();
    setTimeout(() => {
        process.exit(1);
    }, 2000);
});

// Iniciar el proceso
manager.startProcess();

// Exportar para uso externo si es necesario
module.exports = manager; 