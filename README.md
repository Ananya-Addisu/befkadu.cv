# Personalized CV and Application Letter Generator

This project is a web-based tool for quickly generating personalized CVs and application letters. It dynamically inserts a specified company name and location into pre-defined templates and allows you to download the documents as PDFs. You can download the generated documents individually or as a single, combined PDF that includes your academic records and other certificates.

## How It Works

The application is built with vanilla HTML, CSS, and JavaScript, and it leverages a few key libraries to handle PDF generation and manipulation directly in the browser.

1.  **User Interface (`index.html`)**: The main page provides a simple form where you enter the **Company Name** and **Location (City)**. It also includes checkboxes to select which documents you want to include in the final combined PDF.

2.  **Dynamic Templates (`letter.html`, `cv.html`)**: The application letter and CV are HTML files that act as templates. They contain placeholders (`<span id="...">`) that are dynamically populated with the company name and location you provide.

3.  **Client-Side PDF Generation**: When you click a download button, the following happens:
    *   **`html2canvas`**: This library takes a "screenshot" of the specified HTML content (e.g., the CV or letter container) and converts it into a canvas image.
    *   **`jsPDF`**: The canvas image is then taken by `jsPDF` and placed into a new PDF document.
    *   This entire process happens in the browser, creating a PDF version of your HTML template on the fly.

4.  **PDF Merging**:
    *   **`pdf-lib`**: When you choose to download the combined document, this powerful library is used. It can create new PDFs or modify existing ones.
    *   The application first generates the PDFs for the application letter and CV in memory.
    *   Then, it fetches your static documents (`BEFKADU_ACADEMIC_DOCUMENTS.pdf` and `BEFKADU_OTHER_CERTIFICATES.pdf`) from the `assets/docs/` directory.
    *   Finally, it merges all the selected documents into a single PDF file in the correct order (Letter, CV, Academic Docs, Certificates).

5.  **User Feedback**:
    *   A **loading modal** appears during any download process to let you know that the application is working.
    *   A custom **alert modal** is used for all notifications (e.g., if you forget to fill in a field), providing a more polished experience than the browser's default alerts.

## File Structure

Here is a breakdown of the key files and directories:

```
BEFKADU/
│
├── index.html              # The main page with the user interface.
├── letter.html             # The HTML template for the application letter.
├── cv.html                 # The HTML template for the CV.
├── style.css               # The main stylesheet for the application.
├── script.js               # The core JavaScript logic for all functionality.
│
└── assets/
    └── docs/
        ├── BEFKADU_ACADEMIC_DOCUMENTS.pdf  # Placeholder for academic documents.
        └── BEFKADU_OTHER_CERTIFICATES.pdf # Placeholder for other certificates.
```

## How to Use

1.  **Add Your Documents**: Place your academic records PDF and your other certificates PDF into the `BEFKADU/assets/docs/` directory.
    *   Ensure the filenames are exactly `BEFKADU_ACADEMIC_DOCUMENTS.pdf` and `BEFKADU_OTHER_CERTIFICATES.pdf`. If you wish to use different names, you must update the file paths in `script.js`.

2.  **Run a Local Server (Important)**: Due to browser security policies (CORS) that prevent web pages from accessing local files directly (`file://` protocol), you need to run this project from a local web server. This is very simple to do:
    *   **Using VS Code**: Install the **Live Server** extension. Right-click on `index.html` and select "Open with Live Server".
    *   **Using Python**: Navigate to the `BEFKADU` directory in your terminal and run `python -m http.server`. Then open your browser to `http://localhost:8000`.

3.  **Generate Documents**:
    *   Open the `index.html` page in your browser using the local server.
    *   Fill in the company name and location.
    *   Select the documents you want to combine or download files individually.
    *   Click the desired download button.

## Customization

*   **To change the content** of the application letter or CV, simply edit the text within the `letter.html` and `cv.html` files.
*   **To change the appearance**, you can modify `style.css` for the main page, or edit the `<style>` blocks within `letter.html` and `cv.html` for the documents themselves.
*   **To use different static documents**, replace the PDF files in the `assets/docs/` directory and update the filenames in `script.js` if they are different. 