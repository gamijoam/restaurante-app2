#!/bin/bash

echo "Iniciando License Service..."
echo ""
cd license-service

echo "Compilando proyecto..."
mvn clean compile
if [ $? -ne 0 ]; then
    echo "Error compilando el proyecto"
    exit 1
fi

echo ""
echo "Iniciando License Service en puerto 8081..."
echo "URL: http://localhost:8081"
echo "H2 Console: http://localhost:8081/h2-console"
echo ""

mvn spring-boot:run 