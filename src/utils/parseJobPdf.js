import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

export const parseJobPdf = async (fileBuffer) => {
  const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join('\n') + '\n';
  }

  const blocks = fullText.split(/Order item:/g).slice(1);

  return blocks.map((block) => {
    const get = (regex, flags = '') => {
      const match = block.match(new RegExp(regex, flags));
      return match?.[1]?.trim() || '';
    };

    const order = get(/Order:\s*(SO\d+)/);
    const item = get(/^(.+?)\n/);
    const ref = get(/Ref:\s*(.*)/);
    const totalPieces = parseInt(get(/Total pieces in .*?:\s*(\d+)/), 10);
    const materialRaw = get(/Material:\s*([\s\S]*?)Sheet width:/).replace(/\n/g, ' ').trim();
    const width = get(/Sheet width:\s*(\d+\s*mm)/);
    const bends = get(/Bends:\s*(\d+\+?\d*)/);

    const quantityRaw = get(/Quantity:\s*([\s\S]*?)Bends:/).trim();

    const quantities = quantityRaw
      .split('\n')
      .map((line) => {
        const match = line.match(/(\d+)\s*x\s*(\d+\s*mm)/);
        if (!match) return null;
        return { count: parseInt(match[1], 10), length: match[2].trim() };
      })
      .filter(Boolean);

    return {
      order,
      item,
      ref,
      totalPieces,
      material: materialRaw,
      sheetWidth: width,
      quantities,
      bends,
    };
  });
};
