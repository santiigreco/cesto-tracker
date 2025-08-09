import cv2
import numpy as np
import pyautogui
import pytesseract


# Configurar la ruta de Tesseract si es necesario
pytesseract.pytesseract.tesseract_cmd = r"D:\Descargas\OCR\tesseract.exe"  # Ajustar en Windows


# Definir la zona de la pantalla donde está la consola del juego (AJUSTAR ESTOS VALORES)
consola_x, consola_y, consola_ancho, consola_alto = 2, 125, 500, 20

def capturar_texto():
    """Captura la zona de la consola y extrae texto con OCR."""
    screenshot = pyautogui.screenshot(region=(consola_x, consola_y, consola_ancho, consola_alto))
    imagen = np.array(screenshot)
    
    # Convertir a escala de grises para mejorar OCR
    imagen_gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
    
    # Extraer texto con OCR
    texto = pytesseract.image_to_string(imagen_gris)  # Cambiar a "spa" si está en español
    
    return texto.strip()

# Prueba: Capturar y mostrar el texto
while True:
    texto = capturar_texto()
    if texto:
        print("Texto detectado:", texto)
    pyautogui.sleep(2)  # Esperar 2 segundos antes de la siguiente captura


def capturar_nombre():
    """Captura la zona donde aparece el nombre del personaje delante y usa OCR."""
    nombre_x, nombre_y, nombre_ancho, nombre_alto = 500, 300, 200, 30  # AJUSTAR ESTOS VALORES
    screenshot = pyautogui.screenshot(region=(nombre_x, nombre_y, nombre_ancho, nombre_alto))
    imagen = np.array(screenshot)
    
    # Convertir a escala de grises
    imagen_gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
    
    # Extraer texto con OCR
    nombre = pytesseract.image_to_string(imagen_gris, lang="eng").strip()
    return nombre