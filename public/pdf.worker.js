// public/pdf.worker.js
try {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
} catch (e) {
    try {
        importScripts('https://cdnjs.cloudflare.com/scripts/jspdf/2.5.1/jspdf.umd.min.js');
    } catch (err) {
        console.error("Error cargando jsPDF en el Worker");
    }
}

self.onmessage = function(event) {
    const { reporteData, metricasEconomicas, userData, respuestas } = event.data;
    const JspdfConstructor = self.jspdf.jsPDF;
    const doc = new JspdfConstructor('p', 'mm', 'a4');

    // --- CONFIGURACIÓN ESTRATÉGICA DE MARCA Y ESTILOS ---
    const COLORS = {
        PRIMARY: [59, 130, 246],    
        SECONDARY: [30, 41, 59],   
        TEXT_MAIN: [15, 23, 42],   
        TEXT_GRAY: [100, 116, 139], 
        BORDER_SUTIL: [148, 163, 184], 
        SEM_RED: [220, 38, 38],
        SEM_YELLOW: [202, 138, 4],
        SEM_GREEN: [22, 163, 74],
        GOLD: [255, 211, 28],
        WHITE: [255, 255, 255],
        BG_LIGHT: [248, 250, 252]
    };

    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 0;

    // --- LÓGICA DE CÁLCULO SISTÉMICO ---
    const costosReales = Number(respuestas['VII_costos_reales']) || 0;
    const ingresosAnuales = Number(respuestas['VII_ingresos_anuales']) || 0;
    const desperdicioPct = Number(respuestas['VII_desperdicio_percibido']) || 0;
    const fugaTotal = costosReales * (desperdicioPct / 100);
    const ahorroRecuperable = fugaTotal * 0.85;

    const varImpacto = fugaTotal * 0.30;
    let pctCapacidad = 0.02; 
    const tamanoLower = (userData.tamanoOrganizacion || "").toLowerCase();
    if (tamanoLower.includes("micro")) pctCapacidad = 0.05;
    else if (tamanoLower.includes("pequeña")) pctCapacidad = 0.04;
    else if (tamanoLower.includes("mediana")) pctCapacidad = 0.03;
    
    const varCapacidad = ingresosAnuales * pctCapacidad;

    let varTecnica = 25000000;
    const madurezUpper = (reporteData.nivelMadurez || "PRINCIPIANTE").toUpperCase();
    if (madurezUpper === "PRINCIPIANTE") varTecnica = 5000000;
    else if (madurezUpper === "INTERMEDIO") varTecnica = 12000000;
    
    let feeFinal = Math.max(varImpacto, varCapacidad, varTecnica);
    const techoInversion = ahorroRecuperable * 0.40;
    if (feeFinal > techoInversion && ahorroRecuperable > 0) {
        feeFinal = techoInversion;
    }
    const inversionEstimada = feeFinal; 
    const roiCalculadoPre = inversionEstimada > 0 ? Math.round(((ahorroRecuperable - inversionEstimada) / inversionEstimada) * 100) : 0;
    const roiCalculado = Math.max(roiCalculadoPre, 150);
    const ahorroMensual = ahorroRecuperable / 12;
    const paybackCalculado = (ahorroMensual > 0 && inversionEstimada > 0) ? (inversionEstimada / ahorroMensual).toFixed(1) : "0";

    let baseCalculo = "";
    if (feeFinal === varImpacto) baseCalculo = "la brecha técnica";
    else if (feeFinal === varTecnica) baseCalculo = `el nivel de madurez (${madurezUpper})`;
    else if (feeFinal === techoInversion) baseCalculo = "la optimización de rentabilidad garantizada";
    else baseCalculo = "el tamaño de la organización";

    const SCORE_MAP = [0, 3, 5];
    const puntuacionTotalObtenida = Object.entries(respuestas).reduce((acc, [key, value]) => {
        if (key.startsWith('p')) {
            const index = Number(value) - 1;
            return acc + (SCORE_MAP[index] || 0);
        }
        return acc;
    }, 0);

    const SECTORES_MAP = {
        '1311': '1311 - Preparación e hilatura de fibras textiles',
        '1312': '1312 - Tejeduría de productos textiles',
        '1313': '1313 - Acabado de productos textiles',
        '1391': '1391 - Fabricación de tejidos de punto y ganchillo',
        '1392': '1392 - Confección de artículos con materiales textiles (excepto prendas)',
        '1393': '1393 - Fabricación de tapetes y alfombras para pisos',
        '1394': '1394 - Fabricación de cuerdas, cordeles, cables y redes',
        '1399': '1399 - Fabricación de otros artículos textiles n.c.p.',
        '1410': '1410 - Confección de prendas de vestir (excepto piel)',
        '1420': '1420 - Fabricación de artículos de piel',
        '1430': '1430 - Fabricación de artículos de punto y ganchillo',
        '1511': '1511 - Curtido y recurtido de cueros; teñido de pieles',
        '1512': '1512 - Fabricación de artículos de viaje, bolsos y talabartería',
        '1521': '1521 - Fabricación de calzado de cuero y piel',
        '1522': '1522 - Fabricación de otros tipos de calzado (textil/sintético)',
        '4641': '4641 - Comercio al por mayor de textiles y productos confeccionados',
        '4642': '4642 - Comercio al por mayor de prendas de vestir',
        '4643': '4643 - Comercio al por mayor de calzado',
        '4751': '4751 - Comercio al por menor de productos textiles en especializados',
        '4771': '4771 - Comercio al por menor de prendas de vestir y accesorios',
        'OTRO': 'Otro sector manufacturero'
    };

    const PREGUNTAS_TEXTO = {
        'p1': '¿Tienes definidos claramente los módulos de producción?',
        'p2': '¿Cada módulo tiene objetivos de rendimiento específicos?',
        'p3': '¿Los módulos están integrados eficientemente entre sí?',
        'p4': '¿Realizas análisis para identificar cuellos de botella en la producción?',
        'p5': '¿Usas metodologías Lean Manufacturing para reducir desperdicios?',
        'p6': '¿Monitoreas y reduces los tiempos de ciclo en la producción?',
        'p7': '¿Tienes un sistema de gestión de calidad implementado?',
        'p8': '¿Realizas controles de calidad en cada etapa del proceso productivo?',
        'p9': '¿Implementas acciones correctivas para reducir defectos?',
        'p10': '¿Gestionas eficientemente tu cadena de suministro?',
        'p11': '¿Evalúas el desempeño de tus proveedores regularmente?',
        'p12': '¿Gestionas el inventario de manera eficiente?',
        'p13': '¿Tu personal está capacitado para realizar sus tareas?',
        'p14': '¿Ofreces capacitación continua a tu personal?',
        'p15': '¿Fomentas un ambiente de trabajo seguro y saludable?',
        'p16': '¿Utilizas tecnología para mejorar tus procesos productivos?',
        'p17': '¿Inviertes en innovación para mejorar tu producción?',
        'p18': '¿Utilizas datos para tomar decisiones informadas en la producción?',
        'p19': '¿Conoces tus costos de producción detalladamente?',
        'p20': '¿Reduces los costos de producción de manera continua?',
        'VII_ingresos_anuales': '¿A cuánto ascienden aproximadamente sus ingresos o ventas totales ANUALES?',
        'VII_costos_reales': '¿Cuál es el valor aproximado de sus costos operativos totales ANUALES?',
        'VII_desperdicio_percibido': '¿Qué porcentaje de desperdicio o reproceso estima actualmente en su operación?',
        'expectativas': 'Expectativas y cuellos de botella detectados por el usuario:'
    };

    const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0) + " COP";

const drawGlobalHeader = () => {
        // Fondo oscuro del encabezado
        doc.setFillColor(...COLORS.SECONDARY);
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        // --- RENDERIZADO DEL LOGO CON PROPORCIÓN NATURAL ---
        try {
            /**
             * AJUSTE DE PROPORCIÓN:
             * Se cambia de 15x15 (cuadrado) a 28x12 (rectangular).
             * Esto evita que el logo se vea apiñado o comprimido.
             */
            doc.addImage('/logo-producir-te.png', 'PNG', margin, 4, 21, 15);
        } catch (e) {
            console.error("No se pudo cargar el logo en el PDF:", e);
        }
        
        // Línea dorada decorativa
        doc.setFillColor(...COLORS.GOLD);
        doc.rect(0, 23, pageWidth, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        
        /**
         * AJUSTE DE TEXTO:
         * Se desplaza el texto 32mm a la derecha (margin + 32) para dar espacio 
         * al nuevo ancho del logo rectangular.
         */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("DIAGNÓSTICO NEXO: REPORTE DE COMPETITIVIDAD TÉCNICA", margin + 25, 14);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("TRANSFORMACIÓN PRODUCTIVA DEL SECTOR TEXTIL 2026", margin + 25, 19);
    };

    const drawGlobalFooter = (pageNum, total) => {
        doc.setFillColor(...COLORS.SECONDARY);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        const footerText = `Diseñado por VIALKER para Producir-TE: "Transformación productiva del sector textil". Todos los derechos reservados 2026.© | Pág. ${pageNum}/${total}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
    };

    const drawSectionTitle = (title, y) => {
        doc.setTextColor(...COLORS.TEXT_MAIN);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, y);
        doc.setDrawColor(...COLORS.BORDER_SUTIL);
        doc.setLineWidth(0.4);
        doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
    };

    const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > pageHeight - 20) {
            doc.addPage();
            drawGlobalHeader();
            currentY = 35;
            return true;
        }
        return false;
    };

    drawGlobalHeader();

    // 1. NIVEL DE MADUREZ
    const madW = 45, madH = 16;
    doc.setDrawColor(...COLORS.PRIMARY);
    doc.setLineWidth(0.6);
    doc.setFillColor(...COLORS.WHITE);
    doc.roundedRect(pageWidth - margin - madW, 28, madW, madH, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.TEXT_GRAY);
    doc.setFont("helvetica", "bold"); 
    doc.text("NIVEL DE MADUREZ", pageWidth - margin - madW + 4, 33);
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.text(madurezUpper, pageWidth - margin - madW + 4, 39);

    // --- NUEVO AJUSTE: FECHA Y HORA DE DILIGENCIAMIENTO ---
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.TEXT_GRAY);
    doc.setFont("helvetica", "italic");
    doc.text(`Fecha de diligenciamiento: ${dateStr} | Hora: ${timeStr}`, margin, 35);
    // -----------------------------------------------------

    currentY = 48; 
    drawSectionTitle("1. FICHA TÉCNICA DEL CLIENTE", currentY);
    currentY += 8;

    let tamanoDisplay = userData.tamanoOrganizacion || "No especificado";
    const tLower = tamanoDisplay.toLowerCase();
    if(tLower.includes("micro")) tamanoDisplay = "Microempresa (1-10 personas)";
    else if(tLower.includes("pequeña")) tamanoDisplay = "Pequeña empresa (11-50 personas)";
    else if(tLower.includes("mediana")) tamanoDisplay = "Mediana empresa (51-200 personas)";
    else if(tLower.includes("gran")) tamanoDisplay = "Gran empresa (Más de 200 personas)";

    let sectoresTexto = userData.sector && Array.isArray(userData.sector) 
        ? userData.sector.map(id => SECTORES_MAP[id] || id).join(' / ') 
        : (SECTORES_MAP[userData.sector] || userData.sector || "No especificado");

    const clientFields = [
        { label: "NOMBRES", val: userData.nombre },
        { label: "APELLIDOS", val: userData.apellido },
        { label: "EMPRESA", val: userData.empresa },
        { label: "NIT / RUC", val: userData.nit || "N/A" },
        { label: "CARGO / PUESTO", val: userData.cargo },
        { label: "TAMAÑO DE ORGANIZACIÓN", val: tamanoDisplay },
        { label: "CORREO CORPORATIVO", val: userData.email },
        { label: "TELÉFONO (WhatsApp)", val: `${userData.dialCode || '+57'} ${userData.whatsapp}` },
        { label: "ACTIVIDADES ECONÓMICAS (CIIU)", val: sectoresTexto }
    ];

    const cellW = (pageWidth - (margin * 2) - 4) / 2;
    let rowMaxHeight = 18;

    for (let i = 0; i < clientFields.length; i++) {
        const col = i % 2;
        const x = margin + (col * (cellW + 4));
        const y = currentY;
        if (col === 0) rowMaxHeight = 15;
        const field = clientFields[i];
        
        const isWide = field.label === "ACTIVIDADES ECONÓMICAS (CIIU)";
        let currentCellW = isWide ? (pageWidth - (margin * 2)) : cellW;
        
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        const valText = doc.splitTextToSize(String(field.val), currentCellW - 6);
        const textHeight = valText.length * 4.5;
        const currentBoxHeight = Math.max(14, textHeight + 8);
        if (currentBoxHeight > rowMaxHeight) rowMaxHeight = currentBoxHeight;

        doc.setDrawColor(...COLORS.BORDER_SUTIL);
        doc.setLineWidth(0.4);
        doc.setFillColor(...COLORS.WHITE);
        doc.roundedRect(x, y, currentCellW, currentBoxHeight, 2, 2, 'FD');

        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.TEXT_GRAY);
        doc.setFont("helvetica", "normal");
        doc.text(field.label, x + 3, y + 4.5);

        doc.setTextColor(...COLORS.TEXT_MAIN);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(isWide ? 7.5 : 8.5);
        doc.text(valText, x + 3, y + 9, { lineHeightFactor: 1.15 });

        if (col === 1 || isWide) currentY += rowMaxHeight + 3;
    }

    // 2. IMPACTO FINANCIERO
    checkPageBreak(110);
    currentY += 5;
    drawSectionTitle("2. IMPACTO FINANCIERO Y RECUPERACIÓN", currentY);
    currentY += 8;
    const halfW = (pageWidth - (margin * 2) - 5) / 2;
    doc.setDrawColor(...COLORS.SEM_RED);
    doc.setLineWidth(0.6);
    doc.setFillColor(...COLORS.WHITE);
    doc.roundedRect(margin, currentY, halfW, 25, 3, 3, 'FD');
    doc.setTextColor(...COLORS.SEM_RED);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("BRECHA ECONÓMICA ANUAL DETECTADA", margin + 5, currentY + 7);
    doc.setFontSize(13); doc.text(formatCOP(fugaTotal), margin + 5, currentY + 15);
    doc.setFontSize(6.5); doc.setTextColor(...COLORS.TEXT_GRAY); doc.setFont("helvetica", "normal");
    doc.text(`Basado en desperdicio del ${desperdicioPct}% sobre costos.`, margin + 5, currentY + 21);

    doc.setDrawColor(...COLORS.SEM_GREEN);
    doc.setFillColor(...COLORS.WHITE); 
    doc.roundedRect(margin + halfW + 5, currentY, halfW, 25, 3, 3, 'FD');
    doc.setTextColor(...COLORS.SEM_GREEN);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("AHORRO POSIBLE (85%)", margin + halfW + 10, currentY + 7);
    doc.setFontSize(13); doc.text(formatCOP(ahorroRecuperable), margin + halfW + 10, currentY + 15);
    doc.setFontSize(6.5); doc.setTextColor(...COLORS.TEXT_GRAY);
    doc.text("Potencial recuperable bajo estándares mundiales.", margin + halfW + 10, currentY + 21);

    currentY += 32;
    const finStats = [
        { l: "ROI ESPERADO", v: `${roiCalculado}%`, e: "Rentabilidad proyectada sobre el capital destinado a la optimización de procesos." },
        { l: "RECUPERACIÓN", v: `${paybackCalculado} Meses`, e: "Tiempo estimado para la recuperación de la inversión" },
        { l: "PUNTOS NEXO", v: `${puntuacionTotalObtenida} PTS`, e: "Validación del cumplimiento técnico según la metodología Nexo." }
    ];
    finStats.forEach((s, i) => {
        const x = margin + (i * ( (pageWidth - 30 - 10)/3 + 5));
        const w = (pageWidth - 30 - 10)/3;
        doc.setDrawColor(...COLORS.PRIMARY);
        doc.setLineWidth(0.6);
        doc.setFillColor(...COLORS.WHITE);
        doc.roundedRect(x, currentY, w, 40, 2, 2, 'FD');
        doc.setTextColor(...COLORS.PRIMARY);
        doc.setFontSize(8); doc.setFont("helvetica", "bold");
        doc.text(s.l, x + 3, currentY + 7);
        doc.setFontSize(12); doc.text(String(s.v), x + 3, currentY + 15);
        doc.setFontSize(6.5); doc.setTextColor(...COLORS.TEXT_GRAY);
        doc.setFont("helvetica", "normal");
        const explText = doc.splitTextToSize(s.e, w - 6);
        doc.text(explText, x + 3, currentY + 22);
    });

    currentY += 50;

    // 3. ANÁLISIS DE EFICIENCIAS TÉCNICAS
    checkPageBreak(100);
    drawSectionTitle("3. ANÁLISIS DE EFICIENCIAS TÉCNICAS", currentY);
    currentY += 30; 
    const calcularGap = (ids) => {
        const suma = ids.reduce((acc, id) => {
            const val = respuestas[id] || 1;
            return acc + (SCORE_MAP[Number(val) - 1] || 0);
        }, 0);
        return Math.round(100 - ((suma / (ids.length * 5)) * 100));
    };
    const eficiencias = [
        { l: "EFICIENCIA OPERACIONAL", v: calcularGap(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']), c: COLORS.PRIMARY, sub: "Potencial de Mejora para Alcanzar la Eficiencia Operacional Total" },
        { l: "EFICIENCIA PRODUCCIÓN", v: calcularGap(['p7', 'p8', 'p9', 'p10', 'p11', 'p12']), c: COLORS.SEM_GREEN, sub: "Potencial de Mejora para Alcanzar la Eficiencia de Producción Total" },
        { l: "EFICIENCIA PROCESOS", v: calcularGap(['p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20']), c: COLORS.SEM_YELLOW, sub: "Potencial de Mejora para Alcanzar la Eficiencia de Procesos Total" }
    ];
    const startCenterX = margin + 30;
    eficiencias.forEach((ef, i) => {
        const centerX = startCenterX + (i * 55);
        const radius = 18; 
        doc.setLineWidth(3); 
        doc.setDrawColor(240, 240, 240);
        doc.circle(centerX, currentY, radius, 'S');
        doc.setDrawColor(...ef.c);
        const endAngle = (ef.v / 100 * 360) - 90;
        for(let deg = -90; deg < endAngle; deg += 3) {
            const r1 = deg * Math.PI / 180;
            const r2 = (deg + 3.5) * Math.PI / 180;
            doc.line(centerX + radius * Math.cos(r1), currentY + radius * Math.sin(r1), centerX + radius * Math.cos(r2), currentY + radius * Math.sin(r2));
        }
        doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFontSize(13); doc.setFont("helvetica", "bold"); 
        doc.text(`${ef.v}%`, centerX, currentY + 2, { align: 'center' });
        doc.setFontSize(7.5); 
        doc.text(doc.splitTextToSize(ef.l, 35), centerX, currentY + 25, { align: 'center' });
        doc.setFontSize(6); doc.setTextColor(...COLORS.TEXT_GRAY); doc.setFont("helvetica", "italic");
        doc.text(doc.splitTextToSize(ef.sub, 45), centerX, currentY + 34, { align: 'center' });
    });

    currentY += 55;
    checkPageBreak(90);
    drawSectionTitle("COMPARATIVA ESTRATÉGICA DE IMPLEMENTACIÓN", currentY);
    currentY += 8;
    doc.setDrawColor(...COLORS.SEM_RED); doc.setLineWidth(0.8); doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 34, 2, 2, 'FD');
    doc.setTextColor(...COLORS.SEM_RED); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("ESCENARIO SIN NEXO", margin + 5, currentY + 8);
    doc.setFontSize(10);
    doc.text("• Estado: Ineficiencia Detectada", margin + 8, currentY + 16);
    doc.text(`• Brecha Económica: ${formatCOP(fugaTotal)} en riesgo anual`, margin + 8, currentY + 22);
    doc.text("• Riesgo: Estancamiento Competitivo y Operativo", margin + 8, currentY + 28); 
    
    currentY += 40; 
    doc.setDrawColor(...COLORS.SEM_GREEN); doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 34, 2, 2, 'FD');
    doc.setTextColor(...COLORS.SEM_GREEN); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("ESCENARIO CON NEXO", margin + 5, currentY + 8);
    doc.setFontSize(10);
    doc.text("• Productividad: +15% de Optimización", margin + 8, currentY + 16);
    doc.text(`• ROI: ${roiCalculado}% Proyectado`, margin + 8, currentY + 22);
    doc.text(`• Retorno Neto: ${formatCOP(ahorroRecuperable)} recuperables`, margin + 8, currentY + 28);

    doc.addPage();
    drawGlobalHeader();
    currentY = 35;
    drawSectionTitle("4. ANEXO A: AUDITORÍA DE CUESTIONARIO COMPLETO", currentY);
    currentY += 10;
    const CATEGORIES = {
        'I': 'GESTIÓN DE PROCESOS POR MÓDULOS', 'II': 'EFICIENCIA Y OPTIMIZACIÓN', 'III': 'GESTIÓN DE CALIDAD',
        'IV': 'CADENA DE SUMINISTRO', 'V': 'TALENTO HUMANO', 'VI': 'TECNOLOGÍA E INNOVACIÓN', 'VII': 'COSTOS Y FINANZAS'
    };

    const auditoriaFull = { ...respuestas, expectativas: userData.expectativas };

    Object.keys(CATEGORIES).forEach(cat => {
        checkPageBreak(25);
        doc.setFillColor(...COLORS.SECONDARY);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 7, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(8);
        doc.text(`CATEGORÍA ${cat}: ${CATEGORIES[cat]}`, margin + 3, currentY + 5);
        currentY += 10;
        
        Object.keys(auditoriaFull).forEach(key => {
            let belongs = false;
            const num = parseInt(key.replace('p', ''));
            if(cat==='I' && num<=3) belongs=true;
            else if(cat==='II' && num>=4 && num<=6) belongs=true;
            else if(cat==='III' && num>=7 && num<=9) belongs=true;
            else if(cat==='IV' && num>=10 && num<=12) belongs=true;
            else if(cat==='V' && num>=13 && num<=15) belongs=true;
            else if(cat==='VI' && num>=16 && num<=18) belongs=true;
            else if(cat==='VII' && (num>=19 || key.includes('VII') || key === 'expectativas')) belongs=true;

            if(belongs && PREGUNTAS_TEXTO[key]) {
                const isExpectativas = key === 'expectativas';
                if (!isExpectativas) {
                    checkPageBreak(12);
                    doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
                    const pText = doc.splitTextToSize(`${key.toUpperCase()}: ${PREGUNTAS_TEXTO[key]}`, pageWidth - margin * 2 - 45);
                    doc.text(pText, margin + 2, currentY + 4);
                    
                    const val = auditoriaFull[key];
                    let scoreColor = (Number(val) >= 3) ? COLORS.SEM_GREEN : (Number(val) === 2 ? COLORS.SEM_YELLOW : COLORS.SEM_RED);
                    doc.setTextColor(...scoreColor); doc.setFont("helvetica", "bold");
                    let labelRes = `PUNTAJE: ${val}/3`;
                    if(key === 'VII_ingresos_anuales') labelRes = formatCOP(val);
                    if(key === 'VII_costos_reales') labelRes = formatCOP(val);
                    if(key === 'VII_desperdicio_percibido') labelRes = `${val} %`;
                    doc.text(labelRes, pageWidth - margin - 5, currentY + 4, { align: 'right' });
                    currentY += (pText.length * 4) + 2;
                }
            }
        });

        // BOTÓN DE PUNTUACIÓN ACUMULADA: Justo después de los datos de categoría VII (antes de expectativas)
        if (cat === 'VII') {
            checkPageBreak(25);
            currentY += 5;
            const auditBoxW = 100;
            doc.setDrawColor(...COLORS.PRIMARY); doc.setLineWidth(0.8); doc.setFillColor(...COLORS.WHITE);
            doc.roundedRect((pageWidth - auditBoxW) / 2, currentY, auditBoxW, 14, 2, 2, 'FD');
            doc.setFontSize(11); doc.setTextColor(...COLORS.PRIMARY); doc.setFont("helvetica", "bold");
            doc.text(`Puntuación Total Acumulada: ${puntuacionTotalObtenida} / 100`, pageWidth / 2, currentY + 9, { align: 'center' });
            currentY += 25;

            // RENDERIZADO DE EXPECTATIVAS EN RECUADRO ESTILO FICHA TÉCNICA
            if (auditoriaFull.expectativas) {
                checkPageBreak(40);
                doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
                doc.text("EXPECTATIVAS: Expectativas y cuellos de botella detectados por el usuario:", margin, currentY);
                currentY += 4;
                
                const expTextVal = String(auditoriaFull.expectativas || "No especificadas");
                const splitExp = doc.splitTextToSize(expTextVal, pageWidth - (margin * 2) - 10);
                const boxHeightExp = (splitExp.length * 4.5) + 10;
                
                doc.setDrawColor(...COLORS.BORDER_SUTIL); doc.setLineWidth(0.4); doc.setFillColor(...COLORS.WHITE);
                doc.roundedRect(margin, currentY, pageWidth - (margin * 2), boxHeightExp, 2, 2, 'FD');
                
                doc.setFont("helvetica", "italic"); doc.setTextColor(...COLORS.TEXT_GRAY); doc.setFontSize(8);
                doc.text(splitExp, margin + 5, currentY + 7, { lineHeightFactor: 1.15 });
                currentY += boxHeightExp + 15;
            }
        }
    });

    // CIERRE Y PROPUESTA (SIN SALTO DE PÁGINA FORZADO)
    checkPageBreak(120);
    doc.setFontSize(15); doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFont("helvetica", "bold");
    doc.text("¡Felicidades por completar tu Diagnóstico Nexo con ÉXITO!", pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 12;
    doc.setDrawColor(...COLORS.GOLD); doc.setLineWidth(1); doc.setFillColor(...COLORS.WHITE);
    const boxHeight = 52; 
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxHeight, 3, 3, 'FD');
    
    doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFontSize(10.5); doc.setFont("helvetica", "normal");
    let textY = currentY + 12;
    const iLine = 1.15 * 5; 
    const line1 = `Nuestra propuesta se basa en un `;
    const feeTextStr = `Fee de Optimización`;
    const line2 = ` proyectado según ${baseCalculo}, lo cual se traduce en un valor de:`;
    const w1 = doc.getTextWidth(line1);
    const wFee = doc.getTextWidth(feeTextStr);
    const totalW = w1 + wFee;
    let startXLine = (pageWidth - totalW) / 2;
    doc.text(line1, startXLine, textY);
    doc.setFont("helvetica", "bold"); doc.text(feeTextStr, startXLine + w1, textY);
    doc.setFont("helvetica", "normal"); textY += iLine;
    doc.text(line2, pageWidth / 2, textY, { align: 'center' });
    textY += iLine + 4;
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(...COLORS.PRIMARY);
    doc.text(formatCOP(feeFinal), pageWidth / 2, textY, { align: 'center' });
    textY += iLine + 4;
    doc.setFontSize(10.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...COLORS.TEXT_MAIN);
    const footerRecuadro = doc.splitTextToSize("Esta es la inversión necesaria en consultoría para ejecutar la ruta de acción, estandarizar sus procesos, y optimizar su operación.", pageWidth - margin * 4);
    doc.text(footerRecuadro, pageWidth / 2, textY, { align: 'center', lineHeightFactor: 1.15 });

    currentY += boxHeight + 6;
    doc.setFont("helvetica", "italic"); doc.setTextColor(...COLORS.TEXT_GRAY); doc.setFontSize(8);
    const textoLegal = "La presente propuesta de optimización y sus valores proyectados se rigen bajo los términos y condiciones técnicas de negociación con Producir-TE y sus representantes.";
    const legalLines = doc.splitTextToSize(textoLegal, pageWidth - (margin * 2));
    doc.text(legalLines, pageWidth / 2, currentY, { align: 'center' });

    currentY += 18;
    doc.setFontSize(11.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...COLORS.PRIMARY);
    const fraseAccion = "¡Accede ahora a la ruta de optimización de tu operación con nuestro método nexo y goza de beneficios por pronto pago!";
    const fraseLines = doc.splitTextToSize(fraseAccion, pageWidth - margin * 4);
    doc.text(fraseLines, pageWidth / 2, currentY, { align: 'center', lineHeightFactor: 1.15 });

    currentY += 14; 
    doc.setDrawColor(...COLORS.BORDER_SUTIL); doc.setLineWidth(0.5);
    doc.line(margin * 2, currentY, pageWidth - margin * 2, currentY);
    currentY += 7;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...COLORS.TEXT_MAIN); 
    doc.text("Responsable del diagnóstico:", margin, currentY);
    currentY += 6;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Maria Paulina Merino Riascos", margin, currentY);
    doc.setFontSize(9); doc.setTextColor(...COLORS.TEXT_GRAY);
    doc.text("Ingeniera de Producción - Universidad Eafit", margin, currentY + 5);
    doc.text("Consultora en Optimización de Procesos Productivos", margin, currentY + 10);
    doc.text("Email: producirte.med@gmail.com | WhatsApp: 3153774241", margin, currentY + 15);

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); drawGlobalFooter(i, totalPages);
    }

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    self.postMessage({ status: 'completed', pdfBase64: pdfBase64 });
};