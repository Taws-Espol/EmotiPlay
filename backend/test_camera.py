#!/usr/bin/env python3
"""Test camera access on macOS"""

import cv2
import sys
import time

def test_camera():
    print("🎥 Probando acceso a la cámara...")
    print(f"   OpenCV version: {cv2.__version__}")
    
    # Lista de backends a probar en macOS
    backends = [
        (cv2.CAP_AVFOUNDATION, "AVFoundation (macOS nativo)"),
        (cv2.CAP_ANY, "Auto-detect"),
    ]
    
    for backend_id, backend_name in backends:
        print(f"\n🔍 Probando backend: {backend_name}")
        
        # Intentar abrir la cámara con este backend
        cap = cv2.VideoCapture(0, backend_id)
        
        if not cap.isOpened():
            print(f"   ❌ No se puede abrir con {backend_name}")
            continue
        
        # Dar tiempo para inicializar
        time.sleep(0.5)
        
        # Intentar leer varios frames
        for attempt in range(5):
            ret, frame = cap.read()
            if ret and frame is not None:
                print(f"   ✅ ¡Funcionando con {backend_name}!")
                print(f"      Resolución: {frame.shape[1]}x{frame.shape[0]}")
                print(f"      Canales: {frame.shape[2]}")
                cap.release()
                return True, backend_id
            time.sleep(0.2)
        
        print(f"   ❌ Cámara abierta pero no lee frames con {backend_name}")
        cap.release()
    
    print("\n❌ ERROR: No se pudo acceder a la cámara con ningún backend")
    print("\n📋 Soluciones para macOS:")
    print("   1. Ve a Configuración del Sistema > Privacidad y Seguridad > Cámara")
    print("   2. Asegúrate de que Terminal tenga permisos de cámara")
    print("   3. Si usas Cursor/VS Code, dale permisos de cámara también")
    print("   4. Cierra otras aplicaciones que usen la cámara (FaceTime, Zoom, etc.)")
    print("   5. Reinicia la Terminal después de dar permisos")
    return False, None

if __name__ == "__main__":
    success, backend = test_camera()
    if success:
        print(f"\n✅ Usa este backend en tu código: cv2.VideoCapture(0, {backend})")
    sys.exit(0 if success else 1)

