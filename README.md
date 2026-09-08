# cartera-precios-diarios

Captura diaria automática (GitHub Actions, ~22:00 hora de Madrid) de cotizaciones públicas de mercado — acciones, ETFs, fondos, oro y Bitcoin, vía Yahoo Finance / gold-api.com / frankfurter.app / CoinGecko.

Este repositorio es público y solo contiene identificadores de mercado (tickers/ISIN) y sus cotizaciones — información pública, consultable igualmente en Yahoo Finance. No contiene cantidades, valores en euros ni ningún dato personal.

Sirve como respaldo de continuidad para un panel de seguimiento de cartera personal, que descarga estos datos para rellenar los días en los que su propio equipo estuvo apagado.

Cada ejecución escribe un archivo precios/AAAA-MM-DD.json con la cotización de cada activo seguido.
