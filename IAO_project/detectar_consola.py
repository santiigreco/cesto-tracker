import pyautogui
import time

print("Mueve el mouse a la esquina superior izquierda de la consola y presiona 'Ctrl+C' para detener.")
while True:
    x, y = pyautogui.position()  # Obtiene la posición actual del mouse
    print(f"Posición del mouse: ({x}, {y})")
    time.sleep(3)  # Pausa por medio segundo antes de actualizar