import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportPagesToPDF = async (pageSelector, { header, footer } = {}) => {
  const nodes = Array.from(document.querySelectorAll(pageSelector));
  if (!nodes.length) return;
  const pdf = new jsPDF("p", "pt", "a4");
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const old = node.style.transform;
    node.style.transform = "none";
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const imgW = pw;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (i > 0) pdf.addPage();

    // Header
    if (header?.enabled) {
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(header.text || "", 40, 30);
    }

    pdf.addImage(imgData, "PNG", 0, (header?.enabled ? 40 : 0), imgW, imgH);

    // Footer
    if (footer?.enabled) {
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const pageNumber = `${i+1}/${nodes.length}`;
      pdf.text(footer.left || "", 40, ph - 22);
      pdf.text(pageNumber, pw - 60, ph - 22);
    }

    node.style.transform = old;
  }
  pdf.save("contract.pdf");
};
