
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'es' | 'eu';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: { [key in Language]: any } = {
  en: {
    "header.title": "LRA-IDE",
    "header.file": "File",
    "header.edit": "Edit",
    "header.view": "View",
    "header.run": "Run",
    "header.help": "Help",
    "header.analyzing": "Analyzing...",
    "activitybar.explorer": "Explorer",
    "activitybar.search": "Search",
    "activitybar.source_control": "Source Control",
    "activitybar.run_debug": "Run and Debug",
    "activitybar.extensions": "Extensions",
    "sidebar.explorer": "Explorer",
    "sidebar.data_source": "Data Source",
    "sidebar.variables": "Variables",
    "sidebar.plot_button": "Plot Data",
    "uploader.upload_csv": "Upload CSV",
    "uploader.new_table": "New Table",
    "uploader.no_folder": "No folder opened",
    "variables.independent": "Independent Variable (X)",
    "variables.dependent": "Dependent Variable (Y)",
    "main.workspace_title": "Analysis Workspace",
    "main.workspace_description": "Upload a CSV file in the Explorer panel to begin your analysis.",
    "main.no_data": "No data to display.",
    "main.plot_placeholder_title": "Ready to Plot",
    "main.plot_placeholder_description": "Select your variables and click the 'Plot Data' button in the explorer to visualize your data.",
    "plot.observations": "Observations",
    "plot.regression_line": "Regression Line",
    "tooltip.residual": "Residual",
    "analysis.show_grid": "Show Grid",
    "analysis.show_line": "Show Regression Line",
    "right_sidebar.equation": "Regression Equation",
    "results.summary": "Summary Statistics",
    "results.rsquared": "R-Squared",
    "results.rsquared_desc": "Model Fit",
    "results.stderr": "Std. Error",
    "results.stderr_desc": "Prediction Error",
    "results.slope": "Slope (β₁)",
    "results.slope_desc": "X's Effect on Y",
    "results.intercept": "Intercept (β₀)",
    "results.intercept_desc": "Y value at X=0",
    "statusbar.ready": "Ready",
    "statusbar.error": "Error",
    "statusbar.rows": "Rows",
    "statusbar.type": "Linear Regression",
    "table.add_row": "Add Row",
    "table.add_column": "Add Column",
    "table.delete_row": "Delete Row",
    "table.delete_column": "Delete Column",
    "table.new_column_prompt": "Enter new column name:",
    "table.duplicate_column_error": "A column named '{columnName}' already exists.",
    "error.invalid_file_type": "Invalid file type. Please upload a CSV file.",
    "error.empty_csv": "CSV file is empty or has less than two columns.",
    "error.parse_failed": "Failed to parse CSV file. Please check its format.",
    "error.missing_data": "Please select variables before plotting.",
    "error.same_variables": "Independent and dependent variables cannot be the same.",
    "error.analysis_failed": "Analysis failed: {errorMessage}",
    "error.unknown": "An unknown error occurred.",
    "error.unknown_analysis": "Could not perform regression. Check data for errors."
  },
  es: {
    "header.title": "IDE-ALR",
    "header.file": "Archivo",
    "header.edit": "Editar",
    "header.view": "Ver",
    "header.run": "Ejecutar",
    "header.help": "Ayuda",
    "header.analyzing": "Analizando...",
    "activitybar.explorer": "Explorador",
    "activitybar.search": "Buscar",
    "activitybar.source_control": "Control de Fuentes",
    "activitybar.run_debug": "Ejecutar y Depurar",
    "activitybar.extensions": "Extensiones",
    "sidebar.explorer": "Explorador",
    "sidebar.data_source": "Fuente de Datos",
    "sidebar.variables": "Variables",
    "sidebar.plot_button": "Graficar Datos",
    "uploader.upload_csv": "Subir CSV",
    "uploader.new_table": "Nueva Tabla",
    "uploader.no_folder": "Ninguna carpeta abierta",
    "variables.independent": "Variable Independiente (X)",
    "variables.dependent": "Variable Dependiente (Y)",
    "main.workspace_title": "Espacio de Análisis",
    "main.workspace_description": "Sube un archivo CSV en el panel Explorador para comenzar tu análisis.",
    "main.no_data": "No hay datos para mostrar.",
    "main.plot_placeholder_title": "Listo para Graficar",
    "main.plot_placeholder_description": "Selecciona tus variables y haz clic en el botón 'Graficar Datos' en el explorador para visualizar tus datos.",
    "plot.observations": "Observaciones",
    "plot.regression_line": "Línea de Regresión",
    "tooltip.residual": "Residuo",
    "analysis.show_grid": "Mostrar Rejilla",
    "analysis.show_line": "Mostrar Línea de Regresión",
    "right_sidebar.equation": "Ecuación de Regresión",
    "results.summary": "Estadísticas de Resumen",
    "results.rsquared": "R-Cuadrado",
    "results.rsquared_desc": "Ajuste del Modelo",
    "results.stderr": "Error Est.",
    "results.stderr_desc": "Error de Predicción",
    "results.slope": "Pendiente (β₁)",
    "results.slope_desc": "Efecto de X en Y",
    "results.intercept": "Intercepto (β₀)",
    "results.intercept_desc": "Valor de Y en X=0",
    "statusbar.ready": "Listo",
    "statusbar.error": "Error",
    "statusbar.rows": "Filas",
    "statusbar.type": "Regresión Lineal",
    "table.add_row": "Añadir Fila",
    "table.add_column": "Añadir Columna",
    "table.delete_row": "Eliminar Fila",
    "table.delete_column": "Eliminar Columna",
    "table.new_column_prompt": "Introduce el nombre de la nueva columna:",
    "table.duplicate_column_error": "Ya existe una columna llamada '{columnName}'.",
    "error.invalid_file_type": "Tipo de archivo no válido. Por favor, sube un archivo CSV.",
    "error.empty_csv": "El archivo CSV está vacío o tiene menos de dos columnas.",
    "error.parse_failed": "No se pudo analizar el archivo CSV. Por favor, revisa su formato.",
    "error.missing_data": "Por favor, selecciona las variables antes de graficar.",
    "error.same_variables": "Las variables independiente y dependiente no pueden ser iguales.",
    "error.analysis_failed": "El análisis falló: {errorMessage}",
    "error.unknown": "Ocurrió un error desconocido.",
    "error.unknown_analysis": "No se pudo realizar la regresión. Revisa los datos en busca de errores."
  },
  eu: {
    "header.title": "LRA-IDE",
    "header.file": "Fitxategia",
    "header.edit": "Editatu",
    "header.view": "Ikusi",
    "header.run": "Exekutatu",
    "header.help": "Laguntza",
    "header.analyzing": "Aztertzen...",
    "activitybar.explorer": "Esploratzailea",
    "activitybar.search": "Bilatu",
    "activitybar.source_control": "Iturburu Kontrola",
    "activitybar.run_debug": "Exekutatu eta Araztu",
    "activitybar.extensions": "Hedapenak",
    "sidebar.explorer": "Esploratzailea",
    "sidebar.data_source": "Datu Iturria",
    "sidebar.variables": "Aldagaiak",
    "sidebar.plot_button": "Datuak Marraztu",
    "uploader.upload_csv": "CSV Igo",
    "uploader.new_table": "Taula Berria",
    "uploader.no_folder": "Ez da karpetarik ireki",
    "variables.independent": "Aldagai Askea (X)",
    "variables.dependent": "Mendeko Aldagaia (Y)",
    "main.workspace_title": "Azterketa Eremua",
    "main.workspace_description": "Igo CSV fitxategi bat Esploratzaile panelean zure azterketa hasteko.",
    "main.no_data": "Ez dago daturik erakusteko.",
    "main.plot_placeholder_title": "Marrazteko Prest",
    "main.plot_placeholder_description": "Hautatu zure aldagaiak eta egin klik 'Datuak Marraztu' botoian esploratzailean zure datuak ikusteko.",
    "plot.observations": "Behaketak",
    "plot.regression_line": "Erregresio Lerroa",
    "tooltip.residual": "Hondarra",
    "analysis.show_grid": "Erakutsi Sarea",
    "analysis.show_line": "Erakutsi Erregresio Lerroa",
    "right_sidebar.equation": "Erregresio Ekuazioa",
    "results.summary": "Laburpen Estatistikak",
    "results.rsquared": "R-Karratua",
    "results.rsquared_desc": "Modelaren Doikuntza",
    "results.stderr": "Errore Estandarra",
    "results.stderr_desc": "Aurreikuspen Errorea",
    "results.slope": "Malda (β₁)",
    "results.slope_desc": "X-ren eragina Y-n",
    "results.intercept": "Abscisa (β₀)",
    "results.intercept_desc": "Y-ren balioa X=0 denean",
    "statusbar.ready": "Prest",
    "statusbar.error": "Errorea",
    "statusbar.rows": "Errenkadak",
    "statusbar.type": "Erregresio Lineala",
    "table.add_row": "Gehitu Errenkada",
    "table.add_column": "Gehitu Zutabea",
    "table.delete_row": "Ezabatu Errenkada",
    "table.delete_column": "Ezabatu Zutabea",
    "table.new_column_prompt": "Sartu zutabe berriaren izena:",
    "table.duplicate_column_error": "Dagoeneko badago '{columnName}' izeneko zutabe bat.",
    "error.invalid_file_type": "Fitxategi mota baliogabea. Mesedez, igo CSV fitxategi bat.",
    "error.empty_csv": "CSV fitxategia hutsik dago edo bi zutabe baino gutxiago ditu.",
    "error.parse_failed": "Ezin izan da CSV fitxategia aztertu. Mesedez, egiaztatu formatua.",
    "error.missing_data": "Mesedez, hautatu aldagaiak marraztu aurretik.",
    "error.same_variables": "Aldagai askea eta mendeko aldagaia ezin dira berdinak izan.",
    "error.analysis_failed": "Azterketak huts egin du: {errorMessage}",
    "error.unknown": "Errore ezezagun bat gertatu da.",
    "error.unknown_analysis": "Ezin izan da erregresioa egin. Egiaztatu datuetan errorerik dagoen."
  }
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;

    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    
    const initialLang = savedLang || 'en';
    setLanguage(initialLang);

  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const t = useCallback((key: string, replacements: { [key: string]: string } = {}) => {
    const translationSet = translations[language];
    let translatedString = translationSet ? (translationSet[key] || key) : key;
    
    Object.keys(replacements).forEach(placeholder => {
        translatedString = translatedString.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return translatedString;
  }, [language]);

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
