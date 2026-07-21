# Champions League Hub

Aplicacion web que muestra proximos partidos, resultados recientes y la tabla de posiciones de la UEFA Champions League, consumiendo datos en tiempo real desde una API publica de futbol.

## Proyecto final - LINQ03.2

Este proyecto corresponde a la Segunda Parte (Fase de Codigo) del proyecto final: traducir el documento de planeacion (Primera Parte) en una aplicacion web funcional y desplegada.

## Stack tecnologico

- HTML5, CSS3 y JavaScript (Vanilla), sin frameworks, para mantener el proyecto ligero y facil de desplegar.
- API publica: TheSportsDB (https://www.thesportsdb.com/), usada para obtener equipos, partidos y tabla de posiciones de la Champions League (id de liga 4480).
- Despliegue: Vercel, conectado directamente al repositorio de GitHub para despliegue continuo (cada push a main actualiza la app en produccion).
- Control de versiones: GitHub.

## Funcionalidad

- Pestana de Proximos Partidos: consulta el endpoint eventsnextleague.php.
- Pestana de Resultados: consulta el endpoint eventspastleague.php y muestra el marcador de los ultimos partidos.
- Pestana de Tabla de Posiciones: consulta el endpoint lookuptable.php de la temporada 2025-2026.
- Manejo de estados de carga y de error/vacio en cada seccion.

## Estructura de archivos

- index.html: estructura y contenedores de la interfaz.
- style.css: diseno visual (tema oscuro con acentos dorados, inspirado en la identidad de la competicion).
- script.js: logica de pestanas y llamadas fetch a la API.

## Prompts principales utilizados con IA

- "Crea una app web de la Champions League usando GitHub y Vercel ya conectados, integrando una API publica para que se vea profesional."
- Iteracion sobre el diseno de la interfaz (pestanas de proximos partidos, resultados y tabla de posiciones) y sobre el manejo de casos sin datos disponibles (fuera de temporada).

## Autoevaluacion

La aplicacion cumple el objetivo de mostrar informacion en vivo de la Champions League de forma clara e interactiva, con un flujo de trabajo de desarrollo documentado (planeacion en la Primera Parte, implementacion y despliegue en la Segunda Parte). Como areas de mejora a futuro: agregar cache local de las respuestas de la API y pruebas automatizadas basicas.
