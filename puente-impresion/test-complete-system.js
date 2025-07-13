#!/usr/bin/env node

const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');

Object.assign(global, { WebSocket });

console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE IMPRESIÓN');
console.log('=============================================');

class CompleteSystemTester {
    constructor() {
        this.testResults = [];
        this.websocketUrl = 'ws://localhost:8080/ws';
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    async testBackendConnection() {
        this.log('🏥 Probando conexión al backend...');
        
        try {
            const http = require('http');
            
            return new Promise((resolve) => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 8080,
                    path: '/actuator/health',
                    method: 'GET',
                    timeout: 5000
                }, (res) => {
                    if (res.statusCode === 200 || res.statusCode === 403) {
                        this.log('✅ Backend responde correctamente', 'SUCCESS');
                        resolve(true);
                    } else {
                        this.log(`❌ Backend responde con código: ${res.statusCode}`, 'ERROR');
                        resolve(false);
                    }
                });

                req.on('error', (error) => {
                    this.log(`❌ Error conectando al backend: ${error.message}`, 'ERROR');
                    resolve(false);
                });

                req.on('timeout', () => {
                    this.log('❌ Timeout conectando al backend', 'ERROR');
                    req.destroy();
                    resolve(false);
                });

                req.end();
            });
        } catch (error) {
            this.log(`❌ Error en test de backend: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async testWebSocketConnection() {
        this.log('🔍 Probando conexión WebSocket...');
        
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 3000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let connectionTimeout = setTimeout(() => {
                this.log('❌ Timeout de conexión WebSocket', 'ERROR');
                client.deactivate();
                resolve(false);
            }, 10000);

            client.onConnect = () => {
                clearTimeout(connectionTimeout);
                this.log('✅ Conexión WebSocket exitosa', 'SUCCESS');
                client.deactivate();
                resolve(true);
            };

            client.onStompError = (frame) => {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error STOMP: ${frame.headers['message']}`, 'ERROR');
                resolve(false);
            };

            client.onWebSocketError = (error) => {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error WebSocket: ${error.message}`, 'ERROR');
                resolve(false);
            };

            try {
                client.activate();
            } catch (error) {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error activando cliente: ${error.message}`, 'ERROR');
                resolve(false);
            }
        });
    }

    async testPrintJobSending() {
        this.log('🖨️ Probando envío de trabajo de impresión...');
        
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 3000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let testTimeout = setTimeout(() => {
                this.log('❌ Timeout enviando trabajo de impresión', 'ERROR');
                client.deactivate();
                resolve(false);
            }, 15000);

            client.onConnect = () => {
                this.log('✅ Conectado, enviando trabajo de prueba...');
                
                const testPrintJob = {
                    printerType: 'THERMAL',
                    printerTarget: 'TEST_PRINTER',
                    ticketType: 'COCINA',
                    ticketData: {
                        nombreMesa: 'Mesa de Prueba',
                        comandaId: 'TEST-001',
                        fechaHora: new Date().toISOString(),
                        items: [
                            {
                                nombreProducto: 'Producto de Prueba',
                                cantidad: 1,
                                precioTotal: 10.00
                            }
                        ],
                        total: 10.00
                    }
                };

                try {
                    client.publish({
                        destination: '/app/print',
                        body: JSON.stringify(testPrintJob),
                        headers: {
                            'content-type': 'application/json'
                        }
                    });
                    
                    this.log('✅ Trabajo de impresión enviado correctamente', 'SUCCESS');
                    clearTimeout(testTimeout);
                    client.deactivate();
                    resolve(true);
                    
                } catch (error) {
                    this.log(`❌ Error enviando trabajo: ${error.message}`, 'ERROR');
                    clearTimeout(testTimeout);
                    client.deactivate();
                    resolve(false);
                }
            };

            client.onStompError = (frame) => {
                clearTimeout(testTimeout);
                this.log(`❌ Error STOMP: ${frame.headers['message']}`, 'ERROR');
                resolve(false);
            };

            client.onWebSocketError = (error) => {
                clearTimeout(testTimeout);
                this.log(`❌ Error WebSocket: ${error.message}`, 'ERROR');
                resolve(false);
            };

            try {
                client.activate();
            } catch (error) {
                clearTimeout(testTimeout);
                this.log(`❌ Error activando cliente: ${error.message}`, 'ERROR');
                resolve(false);
            }
        });
    }

    async testMultiplePrintJobs() {
        this.log('🔄 Probando múltiples trabajos de impresión...');
        
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 3000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let jobsSent = 0;
            const totalJobs = 3;
            let testTimeout = setTimeout(() => {
                this.log('❌ Timeout en prueba de múltiples trabajos', 'ERROR');
                client.deactivate();
                resolve(false);
            }, 30000);

            client.onConnect = () => {
                this.log('✅ Conectado, enviando múltiples trabajos...');
                
                const sendJob = (jobNumber) => {
                    const testPrintJob = {
                        printerType: 'THERMAL',
                        printerTarget: 'TEST_PRINTER',
                        ticketType: jobNumber % 2 === 0 ? 'COCINA' : 'CAJA',
                        ticketData: {
                            nombreMesa: `Mesa ${jobNumber}`,
                            comandaId: `TEST-${jobNumber}`,
                            fechaHora: new Date().toISOString(),
                            items: [
                                {
                                    nombreProducto: `Producto ${jobNumber}`,
                                    cantidad: jobNumber,
                                    precioTotal: 10.00 * jobNumber
                                }
                            ],
                            total: 10.00 * jobNumber
                        }
                    };

                    try {
                        client.publish({
                            destination: '/app/print',
                            body: JSON.stringify(testPrintJob),
                            headers: {
                                'content-type': 'application/json'
                            }
                        });
                        
                        jobsSent++;
                        this.log(`✅ Trabajo ${jobNumber}/${totalJobs} enviado`);
                        
                        if (jobsSent < totalJobs) {
                            setTimeout(() => sendJob(jobNumber + 1), 2000);
                        } else {
                            this.log('✅ Todos los trabajos enviados correctamente', 'SUCCESS');
                            clearTimeout(testTimeout);
                            client.deactivate();
                            resolve(true);
                        }
                        
                    } catch (error) {
                        this.log(`❌ Error enviando trabajo ${jobNumber}: ${error.message}`, 'ERROR');
                        clearTimeout(testTimeout);
                        client.deactivate();
                        resolve(false);
                    }
                };
                
                sendJob(1);
            };

            client.onStompError = (frame) => {
                clearTimeout(testTimeout);
                this.log(`❌ Error STOMP: ${frame.headers['message']}`, 'ERROR');
                resolve(false);
            };

            client.onWebSocketError = (error) => {
                clearTimeout(testTimeout);
                this.log(`❌ Error WebSocket: ${error.message}`, 'ERROR');
                resolve(false);
            };

            try {
                client.activate();
            } catch (error) {
                clearTimeout(testTimeout);
                this.log(`❌ Error activando cliente: ${error.message}`, 'ERROR');
                resolve(false);
            }
        });
    }

    async runAllTests() {
        this.log('🚀 Iniciando pruebas completas del sistema...');
        this.log(`📍 URL WebSocket: ${this.websocketUrl}`);
        this.log('');

        // Test 1: Salud del backend
        const backendOk = await this.testBackendConnection();
        this.testResults.push({ test: 'Backend Health', result: backendOk });
        this.log('');

        // Test 2: Conexión WebSocket
        const websocketOk = await this.testWebSocketConnection();
        this.testResults.push({ test: 'WebSocket Connection', result: websocketOk });
        this.log('');

        // Test 3: Envío de trabajo de impresión
        const printJobOk = await this.testPrintJobSending();
        this.testResults.push({ test: 'Single Print Job', result: printJobOk });
        this.log('');

        // Test 4: Múltiples trabajos de impresión
        const multipleJobsOk = await this.testMultiplePrintJobs();
        this.testResults.push({ test: 'Multiple Print Jobs', result: multipleJobsOk });
        this.log('');

        // Resumen de resultados
        this.printResults();
    }

    printResults() {
        this.log('📊 RESULTADOS DE LAS PRUEBAS COMPLETAS');
        this.log('========================================');
        
        let passedTests = 0;
        let totalTests = this.testResults.length;

        this.testResults.forEach(({ test, result }) => {
            const status = result ? '✅ PASÓ' : '❌ FALLÓ';
            this.log(`${status} - ${test}`);
            if (result) passedTests++;
        });

        this.log('');
        this.log(`📈 Resumen: ${passedTests}/${totalTests} pruebas pasaron`);
        
        if (passedTests === totalTests) {
            this.log('🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.', 'SUCCESS');
            this.log('💡 El sistema no debería bloquearse después de imprimir.', 'SUCCESS');
        } else {
            this.log('⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.', 'WARNING');
            this.printRecommendations();
        }
    }

    printRecommendations() {
        this.log('');
        this.log('🔧 RECOMENDACIONES:');
        this.log('==================');
        
        const failedTests = this.testResults.filter(r => !r.result);
        
        failedTests.forEach(({ test }) => {
            switch (test) {
                case 'Backend Health':
                    this.log('- Verifica que el backend esté corriendo en puerto 8080');
                    this.log('- Ejecuta: java -jar backend.jar');
                    break;
                case 'WebSocket Connection':
                    this.log('- Verifica que el WebSocket esté habilitado en el backend');
                    this.log('- Revisa la configuración de CORS en el backend');
                    break;
                case 'Single Print Job':
                case 'Multiple Print Jobs':
                    this.log('- Verifica que el puente de impresión esté corriendo');
                    this.log('- Ejecuta: node index.js en el directorio puente-impresion');
                    this.log('- Verifica que las impresoras estén conectadas');
                    break;
            }
        });
    }
}

// Ejecutar pruebas
const tester = new CompleteSystemTester();
tester.runAllTests().catch(error => {
    console.error('❌ Error ejecutando pruebas:', error);
    process.exit(1);
}); 