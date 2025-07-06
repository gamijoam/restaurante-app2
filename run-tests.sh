#!/bin/bash

echo "========================================"
echo "   RESTAURANTE APP - TESTING SUITE"
echo "========================================"
echo

echo "[1/4] Limpiando proyecto..."
mvn clean
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al limpiar proyecto"
    exit 1
fi

echo
echo "[2/4] Ejecutando pruebas unitarias..."
mvn test
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo en pruebas unitarias"
    exit 1
fi

echo
echo "[3/4] Ejecutando pruebas de integración..."
mvn integration-test
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo en pruebas de integración"
    exit 1
fi

echo
echo "[4/4] Generando reportes..."
mvn jacoco:report surefire-report:report
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al generar reportes"
    exit 1
fi

echo
echo "========================================"
echo "           TESTS COMPLETADOS"
echo "========================================"
echo
echo "Reportes disponibles en:"
echo "- Cobertura: target/site/jacoco/index.html"
echo "- Tests: target/site/surefire-report.html"
echo

# Detectar el sistema operativo para abrir los reportes
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        echo "Abriendo reporte de cobertura..."
        xdg-open target/site/jacoco/index.html &
        
        echo "Abriendo reporte de tests..."
        xdg-open target/site/surefire-report.html &
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Abriendo reporte de cobertura..."
    open target/site/jacoco/index.html
    
    echo "Abriendo reporte de tests..."
    open target/site/surefire-report.html
else
    echo "No se pudo abrir automáticamente los reportes."
    echo "Por favor, abre manualmente:"
    echo "- target/site/jacoco/index.html"
    echo "- target/site/surefire-report.html"
fi

echo
echo "¡Testing completado exitosamente!" 