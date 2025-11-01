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
    "uploader.upload_csv": "Upload CSV",
    "uploader.new_table": "New Table",
    "uploader.no_folder": "No folder opened",
    "variables.independent": "Independent Variable (X)",
    "variables.dependent": "Dependent Variable (Y)",
    "main.workspace_title": "Analysis Workspace",
    "main.workspace_description": "Upload a CSV file or create a new table in the Explorer panel to begin your analysis.",
    "main.loading_title": "Performing Analysis...",
    "main.loading_description": "The model is crunching the numbers. This may take a moment.",
    "main.data_viewer": "Data Viewer",
    "main.plots": "Plots",
    "main.run_analysis_prompt": "Run analysis to generate plots.",
    "main.no_data": "No data to display.",
    "plot.regression": "Regression Plot",
    "plot.residual": "Residual Plot",
    "plot.observations": "Observations",
    "plot.regression_line": "Regression Line",
    "plot.predicted_values": "Predicted Values",
    "plot.residuals": "Residuals",
    "tooltip.residual": "Residual",
    "right_sidebar.analysis": "Analysis",
    "right_sidebar.export": "Export",
    "right_sidebar.equation": "Regression Equation",
    "results.summary": "Summary Statistics",
    "results.rsquared": "R-Squared",
    "results.rsquared_desc": "Model Fit",
    "results.stderr": "Std. Error",
    "results.stderr_desc": "Prediction Error",
    "results.slope": "Slope (β₁)",
    "results.slope_desc": "X's Effect on Y",
    "results.pvalue_slope": "P-Value (Slope)",
    "results.pvalue_slope_desc": "Slope Significance",
    "results.intercept": "Intercept (β₀)",
    "results.intercept_desc": "Y value at X=0",
    "results.pvalue_intercept": "P-Value (Int.)",
    "results.pvalue_intercept_desc": "Int. Significance",
    "statusbar.ready": "Ready",
    "statusbar.error": "Error",
    "statusbar.rows": "Rows",
    "statusbar.type": "Linear Regression",
    "error.invalid_file_type": "Invalid file type. Please upload a CSV file.",
    "error.empty_csv": "CSV file is empty or has less than two columns.",
    "error.parse_failed": "Failed to parse CSV file. Please check its format.",
    "error.missing_data": "Please upload data and select variables.",
    "error.same_variables": "Independent and dependent variables cannot be the same.",
    "error.analysis_failed": "Analysis failed: {errorMessage}",
    "error.unknown": "An unknown error occurred."
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
    "uploader.upload_csv": "Subir CSV",
    "uploader.new_table": "Nueva Tabla",
    "uploader.no_folder": "Ninguna carpeta abierta",
    "variables.independent": "Variable Independiente (X)",
    "variables.dependent": "Variable Dependiente (Y)",
    "main.workspace_title": "Espacio de Análisis",
    "main.workspace_description": "Sube un archivo CSV o crea una nueva tabla en el panel Explorador para comenzar tu análisis.",
    "main.loading_title": "Realizando Análisis...",
    "main.loading_description": "El modelo está procesando los números. Esto puede tardar un momento.",
    "main.data_viewer": "Visor de Datos",
    "main.plots": "Gráficos",
    "main.run_analysis_prompt": "Ejecuta el análisis para generar gráficos.",
    "main.no_data": "No hay datos para mostrar.",
    "plot.regression": "Gráfico de Regresión",
    "plot.residual": "Gráfico de Residuos",
    "plot.observations": "Observaciones",
    "plot.regression_line": "Línea de Regresión",
    "plot.predicted_values": "Valores Predichos",
    "plot.residuals": "Residuos",
    "tooltip.residual": "Residuo",
    "right_sidebar.analysis": "Análisis",
    "right_sidebar.export": "Exportar",
    "right_sidebar.equation": "Ecuación de Regresión",
    "results.summary": "Estadísticas de Resumen",
    "results.rsquared": "R-Cuadrado",
    "results.rsquared_desc": "Ajuste del Modelo",
    "results.stderr": "Error Est.",
    "results.stderr_desc": "Error de Predicción",
    "results.slope": "Pendiente (β₁)",
    "results.slope_desc": "Efecto de X en Y",
    "results.pvalue_slope": "Valor P (Pend.)",
    "results.pvalue_slope_desc": "Signif. de Pendiente",
    "results.intercept": "Intercepto (β₀)",
    "results.intercept_desc": "Valor de Y en X=0",
    "results.pvalue_intercept": "Valor P (Int.)",
    "results.pvalue_intercept_desc": "Signif. de Intercepto",
    "statusbar.ready": "Listo",
    "statusbar.error": "Error",
    "statusbar.rows": "Filas",
    "statusbar.type": "Regresión Lineal",
    "error.invalid_file_type": "Tipo de archivo no válido. Por favor, sube un archivo CSV.",
    "error.empty_csv": "El archivo CSV está vacío o tiene menos de dos columnas.",
    "error.parse_failed": "No se pudo analizar el archivo CSV. Por favor, revisa su formato.",
    "error.missing_data": "Por favor, sube datos y selecciona las variables.",
    "error.same_variables": "Las variables independiente y dependiente no pueden ser iguales.",
    "error.analysis_failed": "El análisis falló: {errorMessage}",
    "error.unknown": "Ocurrió un error desconocido."
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
    "uploader.upload_csv": "CSV Igo",
    "uploader.new_table": "Taula Berria",
    "uploader.no_folder": "Ez da karpetarik ireki",
    "variables.independent": "Aldagai Askea (X)",
    "variables.dependent": "Mendeko Aldagaia (Y)",
    "main.workspace_title": "Azterketa Eremua",
    "main.workspace_description": "Igo CSV fitxategi bat edo sortu taula berri bat Esploratzaile panelean zure azterketa hasteko.",
    "main.loading_title": "Azterketa Egiten...",
    "main.loading_description": "Modeloa zenbakiak prozesatzen ari da. Honek une bat har dezake.",
    "main.data_viewer": "Datu Bistaratzailea",
    "main.plots": "Grafikoak",
    "main.run_analysis_prompt": "Exekutatu azterketa grafikoak sortzeko.",
    "main.no_data": "Ez dago daturik erakusteko.",
    "plot.regression": "Erregresio Grafikoa",
    "plot.residual": "Hondar Grafikoa",
    "plot.observations": "Behaketak",
    "plot.regression_line": "Erregresio Lerroa",
    "plot.predicted_values": "Aurreikusitako Balioak",
    "plot.residuals": "Hondarrak",
    "tooltip.residual": "Hondarra",
    "right_sidebar.analysis": "Azterketa",
    "right_sidebar.export": "Esportatu",
    "right_sidebar.equation": "Erregresio Ekuazioa",
    "results.summary": "Laburpen Estatistikak",
    "results.rsquared": "R-Karratua",
    "results.rsquared_desc": "Modelaren Doikuntza",
    "results.stderr": "Errore Estandarra",
    "results.stderr_desc": "Aurreikuspen Errorea",
    "results.slope": "Malda (β₁)",
    "results.slope_desc": "X-ren eragina Y-n",
    "results.pvalue_slope": "P-Balioa (Malda)",
    "results.pvalue_slope_desc": "Maldaren Esangura",
    "results.intercept": "Abscisa (β₀)",
    "results.intercept_desc": "Y-ren balioa X=0 denean",
    "results.pvalue_intercept": "P-Balioa (Abs.)",
    "results.pvalue_intercept_desc": "Abscisaren Esangura",
    "statusbar.ready": "Prest",
    "statusbar.error": "Errorea",
    "statusbar.rows": "Errenkadak",
    "statusbar.type": "Erregresio Lineala",
    "error.invalid_file_type": "Fitxategi mota baliogabea. Mesedez, igo CSV fitxategi bat.",
    "error.empty_csv": "CSV fitxategia hutsik dago edo bi zutabe baino gutxiago ditu.",
    "error.parse_failed": "Ezin izan da CSV fitxategia aztertu. Mesedez, egiaztatu formatua.",
    "error.missing_data": "Mesedez, igo datuak eta hautatu aldagaiak.",
    "error.same_variables": "Aldagai askea eta mendeko aldagaia ezin dira berdinak izan.",
    "error.analysis_failed": "Azterketak huts egin du: {errorMessage}",
    "error.unknown": "Errore ezezagun bat gertatu da."
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