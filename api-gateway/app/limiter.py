# Centralización de Rate Limiting — Secure Workspace
from slowapi import Limiter
from slowapi.util import get_remote_address

# Instancia global de Limiter para ser compartida entre main y routers
# Evita importaciones circulares.
limiter = Limiter(key_func=get_remote_address)
