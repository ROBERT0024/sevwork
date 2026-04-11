// ReportGenerator.js — Generación de Reportes Gerenciales Profesionales
import html2pdf from 'html2pdf.js';

/**
 * Genera un informe PDF profesional basado en los datos actuales de la aplicación.
 * @param {Object} data - Datos consolidados (notes, tasks, progress, userEmail).
 */
export const generateManagerialReport = async (data) => {
  const { notes, tasks, progress, userEmail, tagData } = data;
  const dateStr = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const highPriority = tasks.filter(t => t.priority === 'high').length;

  // Pantilla HTML del reporte
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: sans-serif; color: #1e293b; padding: 40px; background: #fff;">
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">REPORTE GERENCIAL</h1>
          <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Secure Workspace — Plataforma de Productividad</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 12px; font-weight: bold; margin: 0;">Generado por: <span style="color: #3b82f6;">${userEmail}</span></p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">${dateStr}</p>
        </div>
      </div>

      <!-- Resumen Ejecutivo -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; font-weight: 700; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 20px;">1. RESUMEN EJECUTIVO</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center;">
            <p style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Productividad</p>
            <p style="font-size: 24px; font-weight: 900; color: #10b981; margin: 5px 0;">${progress}%</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center;">
            <p style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Total Tareas</p>
            <p style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 5px 0;">${tasks.length}</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center;">
            <p style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Total Notas</p>
            <p style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 5px 0;">${notes.length}</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center;">
            <p style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">Urgencias</p>
            <p style="font-size: 24px; font-weight: 900; color: #ef4444; margin: 5px 0;">${highPriority}</p>
          </div>
        </div>
      </div>

      <!-- Estado de Tareas -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; font-weight: 700; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 20px;">2. ANÁLISIS DE CUMPLIMIENTO (TAREAS)</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Categoría</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Frecuencia</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">Tareas Completadas</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${completedTasks}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #10b981;">FINALIZADO</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">Pendientes por Ejecutar</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${pendingTasks}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #ef4444;">EN CURSO</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">Alertas de Prioridad Alta</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${highPriority}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #f59e0b;">ATENCIÓN REQUERIDA</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Distribución por Etiquetas -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; font-weight: 700; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 20px;">3. DISTRIBUCIÓN ESTRATÉGICA (ETIQUETAS)</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${tagData.map(t => `
            <div style="background: ${t.color}20; border: 1px solid ${t.color}50; color: ${t.color}; padding: 8px 15px; border-radius: 20px; font-size: 11px; font-weight: bold;">
              ${t.name.toUpperCase()}: ${t.value}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Seguridad y Cumplimiento -->
      <div style="background: #0f172a; color: #fff; padding: 25px; border-radius: 16px; margin-top: 50px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="background: #10b981; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px;">✓</span>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800;">PLATAFORMA CERTIFICADA Y SEGURA</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
              Este informe ha sido generado bajo los estándares de seguridad de la infraestructura <strong>OWASP</strong>. 
              Datos cifrados, protección contra ataques de fuerza bruta y aislamiento de red activos.
            </p>
          </div>
        </div>
      </div>

      <!-- Pie de Página -->
      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 10px; color: #94a3b8;">Documento Confidencial — Secure Workspace Management System</p>
      </div>
    </div>
  `;

  const opt = {
    margin: [0.5, 0.5],
    filename: `Reporte_Gerencial_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  return html2pdf().from(element).set(opt).save();
};
