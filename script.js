document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const { PDFDocument } = window.PDFLib;

    const companyNameInput = document.getElementById('companyName');
    const locationInput = document.getElementById('location');
    const renderArea = document.getElementById('render-area');
    const loadingModal = document.getElementById('loading-modal');
    const alertModal = document.getElementById('alert-modal');
    const alertMessage = document.getElementById('alert-message');
    const alertCloseBtn = document.getElementById('alert-close-btn');

    const includeLetterCheck = document.getElementById('includeLetter');
    const includeCVCheck = document.getElementById('includeCV');
    const includeAcademicCheck = document.getElementById('includeAcademic');
    const includeCertsCheck = document.getElementById('includeCerts');

    const showLoader = () => loadingModal.style.display = 'flex';
    const hideLoader = () => loadingModal.style.display = 'none';

    const showAlert = (message) => {
        alertMessage.textContent = message;
        alertModal.style.display = 'flex';
        setTimeout(() => alertModal.classList.add('visible'), 10);
    };

    const hideAlert = () => {
        alertModal.classList.remove('visible');
        setTimeout(() => alertModal.style.display = 'none', 300);
    };

    alertCloseBtn.addEventListener('click', hideAlert);

    async function generatePdfFromHtml(url, setupFn) {
        const response = await fetch(url);
        const html = await response.text();
        const tempContainer = document.createElement('div');
        renderArea.appendChild(tempContainer);
        tempContainer.innerHTML = html;
        setupFn(tempContainer);
        const content = tempContainer.querySelector('.letter-container, .cv-container');
        const canvas = await html2canvas(content, { scale: 2 });
        renderArea.innerHTML = '';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf.output('arraybuffer');
    }
    
    function triggerDownload(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    async function downloadStaticPdf(filePath, fileName) {
        showLoader();
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`File not found: ${filePath}`);
            const blob = await response.blob();
            triggerDownload(blob, fileName);
        } catch (error) {
            console.error('Failed to download static PDF:', error);
            showAlert(`Could not download ${fileName}. Make sure the file exists at ${filePath}.`);
        } finally {
            hideLoader();
        }
    }

    async function downloadIndividual(type) {
        const companyName = companyNameInput.value;
        const location = locationInput.value;

        if ((type === 'letter' || type === 'cv') && (!companyName || !location)) {
            showAlert('Please fill in both company name and location.');
            return;
        }
        
        showLoader();
        try {
            let url, setupFn, fileName;
            
            if (type === 'letter') {
                url = 'letter.html';
                fileName = 'Application Letter.pdf';
                setupFn = (container) => {
                    container.querySelector('#letter-city').textContent = location;
                    container.querySelector('#letter-company').textContent = companyName;
                    container.querySelector('#letter-company-body').textContent = companyName;
                };
                const pdfBytes = await generatePdfFromHtml(url, setupFn);
                triggerDownload(new Blob([pdfBytes]), fileName);

            } else if (type === 'cv') {
                url = 'cv.html';
                fileName = 'CV.pdf';
                setupFn = (container) => { container.querySelector('#cv-city').textContent = location; };
                const pdfBytes = await generatePdfFromHtml(url, setupFn);
                triggerDownload(new Blob([pdfBytes]), fileName);

            } else if (type === 'academic') {
                await downloadStaticPdf('assets/docs/BEFKADU_ACADEMIC_DOCUMENTS.pdf', 'BEFKADU_ACADEMIC_DOCUMENTS.pdf');
            } else if (type === 'certs') {
                await downloadStaticPdf('assets/docs/BEFKADU_OTHER_CERTIFICATES.pdf', 'BEFKADU_OTHER_CERTIFICATES.pdf');
            }
        } catch (error) {
            console.error(`Error downloading ${type}:`, error);
            showAlert(`An error occurred while generating your ${type}.`);
        } finally {
            hideLoader();
        }
    }
    
    document.getElementById('downloadLetter').addEventListener('click', () => downloadIndividual('letter'));
    document.getElementById('downloadCV').addEventListener('click', () => downloadIndividual('cv'));
    document.getElementById('downloadAcademic').addEventListener('click', () => downloadIndividual('academic'));
    document.getElementById('downloadCerts').addEventListener('click', () => downloadIndividual('certs'));

    document.getElementById('generateCombined').addEventListener('click', async () => {
        const companyName = companyNameInput.value;
        const location = locationInput.value;
        if (!companyName || !location) {
            showAlert('Please fill in both company name and location.');
            return;
        }
        
        showLoader();
        try {
            const mergedPdf = await PDFDocument.create();

            if (includeLetterCheck.checked) {
                const letterPdfBytes = await generatePdfFromHtml('letter.html', (c) => {
                    c.querySelector('#letter-city').textContent = location;
                    c.querySelector('#letter-company').textContent = companyName;
                    c.querySelector('#letter-company-body').textContent = companyName;
                });
                const letterPdf = await PDFDocument.load(letterPdfBytes);
                const copiedPages = await mergedPdf.copyPages(letterPdf, letterPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            if (includeCVCheck.checked) {
                const cvPdfBytes = await generatePdfFromHtml('cv.html', (c) => { c.querySelector('#cv-city').textContent = location; });
                const cvPdf = await PDFDocument.load(cvPdfBytes);
                const copiedPages = await mergedPdf.copyPages(cvPdf, cvPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            if (includeAcademicCheck.checked) {
                const academicPdfBytes = await fetch('assets/docs/BEFKADU_ACADEMIC_DOCUMENTS.pdf').then(res => res.arrayBuffer());
                const academicPdf = await PDFDocument.load(academicPdfBytes);
                const copiedPages = await mergedPdf.copyPages(academicPdf, academicPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            if (includeCertsCheck.checked) {
                const certsPdfBytes = await fetch('assets/docs/BEFKADU_OTHER_CERTIFICATES.pdf').then(res => res.arrayBuffer());
                const certsPdf = await PDFDocument.load(certsPdfBytes);
                const copiedPages = await mergedPdf.copyPages(certsPdf, certsPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            triggerDownload(new Blob([mergedPdfBytes], { type: 'application/pdf' }), 'Combined_Documents.pdf');

        } catch (error) {
            console.error('Failed to generate combined PDF:', error);
            showAlert('An error occurred while generating the combined PDF. Make sure the PDF files exist in the `assets/docs` folder and that you are running this from a local server.');
        } finally {
            hideLoader();
        }
    });
}); 